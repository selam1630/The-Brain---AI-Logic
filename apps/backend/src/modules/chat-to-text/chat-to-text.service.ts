/**
 * Chat-to-Text Service
 * Handles Speech-to-Text transcription, normalization, and conversation management
 * 
 * Core responsibilities:
 * - Process audio/video streams to text
 * - Normalize transcriptions
 * - Save transcripts and conversations to database
 * - Manage transcript lifecycle (PENDING, PROCESSING, COMPLETED, FAILED)
 */

import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTranscriptDto, TranscribeAudioDto, UpdateTranscriptDto } from './dtos';
import { MessageType, TranscriptStatus, Transcript } from '@prisma/client';

const OPENAI_TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions';
const DEFAULT_TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';

interface IUploadedAudioFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

interface IOpenAiTranscriptionResponse {
  text: string;
}

interface IOpenAiErrorResponse {
  error?: {
    message?: string;
  };
}

@Injectable()
export class ChatToTextService {
  private readonly logger = new Logger(ChatToTextService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Transcribes an uploaded audio file with OpenAI and persists the normalized result.
   * Raw upload bytes are discarded after the upstream request completes.
   *
   * @param file - Validated in-memory audio upload
   * @param transcribeAudioDto - Conversation and optional language metadata
   * @returns Completed transcript record
   * @throws {ServiceUnavailableException} If the OpenAI key is missing
   * @throws {BadGatewayException} If the transcription provider fails
   */
  async transcribeAudio(
    file: IUploadedAudioFile,
    transcribeAudioDto: TranscribeAudioDto,
  ): Promise<Transcript> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('Speech-to-text service is not configured');
    }

    const transcription = await this.requestOpenAiTranscription(
      file,
      apiKey,
      transcribeAudioDto.language,
    );

    return this.create({
      conversationId: transcribeAudioDto.conversationId,
      language: transcribeAudioDto.language,
      provider: 'openai' as CreateTranscriptDto['provider'],
      rawText: transcription.text,
    });
  }

  /**
   * Sends a file to OpenAI's transcription endpoint.
   * @param file - Audio upload held only in request memory
   * @param apiKey - OpenAI API credential
   * @param language - Optional language hint
   * @returns Provider transcription payload
   */
  private async requestOpenAiTranscription(
    file: IUploadedAudioFile,
    apiKey: string,
    language?: string,
  ): Promise<IOpenAiTranscriptionResponse> {
    const formData = new FormData();
    const audio = new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });
    formData.append('file', audio, file.originalname);
    formData.append(
      'model',
      this.configService.get<string>(
        'OPENAI_TRANSCRIPTION_MODEL',
        DEFAULT_TRANSCRIPTION_MODEL,
      ),
    );

    if (language) {
      formData.append('language', language);
    }

    let response: Response;
    try {
      response = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });
    } catch (error: unknown) {
      this.logger.error(
        `OpenAI transcription request failed: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw new BadGatewayException('Speech-to-text provider is unavailable');
    }

    if (!response.ok) {
      const providerError = await this.getOpenAiErrorMessage(response);
      this.logger.error(
        `OpenAI transcription failed with status ${response.status}: ${providerError}`,
      );
      throw new BadGatewayException(
        this.getProviderFailureMessage(response.status),
      );
    }

    const payload: unknown = await response.json();
    if (!this.isOpenAiTranscriptionResponse(payload)) {
      throw new BadGatewayException('Speech-to-text provider returned an invalid response');
    }

    if (!payload.text.trim()) {
      throw new BadRequestException('No speech was detected in the uploaded file');
    }

    return payload;
  }

  /** Extracts a non-sensitive diagnostic from an OpenAI error response for logs. */
  private async getOpenAiErrorMessage(response: Response): Promise<string> {
    const body = await response.text();

    try {
      const parsed: unknown = JSON.parse(body);
      if (this.isOpenAiErrorResponse(parsed) && parsed.error?.message) {
        return parsed.error.message;
      }
    } catch {
      // Provider errors are not guaranteed to be JSON.
    }

    return body || 'No provider error message returned';
  }

  /** Maps upstream statuses to client-safe, actionable API responses. */
  private getProviderFailureMessage(status: number): string {
    if (status === 401 || status === 403) {
      return 'OpenAI authentication failed. Check OPENAI_API_KEY.';
    }

    if (status === 429) {
      return 'OpenAI rate limit or account quota has been reached.';
    }

    if (status === 400 || status === 413 || status === 422) {
      return 'OpenAI could not process the uploaded audio file.';
    }

    return 'Speech-to-text provider is temporarily unavailable.';
  }

  /** Validates the minimal shape needed from the OpenAI JSON response. */
  private isOpenAiTranscriptionResponse(
    payload: unknown,
  ): payload is IOpenAiTranscriptionResponse {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'text' in payload &&
      typeof payload.text === 'string'
    );
  }

  /** Validates the minimal shape of an OpenAI error response. */
  private isOpenAiErrorResponse(payload: unknown): payload is IOpenAiErrorResponse {
    return typeof payload === 'object' && payload !== null && 'error' in payload;
  }

  /**
   * Extract error message from unknown caught errors
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  /**
   * Extract error stack from unknown caught errors
   */
  private getErrorStack(error: unknown): string | undefined {
    return error instanceof Error ? error.stack : undefined;
  }

  /**
   * Create a new transcript and save to database
   * 
   * @param createTranscriptDto - Transcript creation payload
   * @returns {Promise<Transcript>} Created transcript record
   * 
   * @example
   * const transcript = await chatToTextService.create({
   *   conversationId: 'conv_123',
   *   rawText: 'Hello world',
   *   language: 'en'
   * });
   */
  async create(createTranscriptDto: CreateTranscriptDto): Promise<Transcript> {
    try {
      // Validate conversation exists
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: createTranscriptDto.conversationId },
      });

      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${createTranscriptDto.conversationId} not found`,
        );
      }

      // Normalize the transcribed text
      const normalizedText = this.normalizeText(createTranscriptDto.rawText);

      // Create transcript record
      const transcript = await this.prisma.transcript.create({
        data: {
          conversationId: createTranscriptDto.conversationId,
          audioUrl: createTranscriptDto.audioUrl,
          videoUrl: createTranscriptDto.videoUrl,
          duration: createTranscriptDto.duration,
          rawText: createTranscriptDto.rawText,
          normalizedText,
          language: createTranscriptDto.language || 'en',
          provider: createTranscriptDto.provider || 'web-speech-api',
          status: TranscriptStatus.COMPLETED,
          messages: {
            create: {
              content: normalizedText,
              conversation: {
                connect: { id: createTranscriptDto.conversationId },
              },
              sender: 'speech-to-text',
              type: MessageType.USER,
            },
          },
        },
      });

      this.logger.log(
        `✓ Transcript created: ${transcript.id} for conversation ${conversation.id}`,
      );

      return transcript;
    } catch (error) {
      this.logger.error(
        `Error creating transcript: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  /**
   * Retrieve all transcripts for a conversation
   * 
   * @param conversationId - ID of the conversation
   * @returns {Promise<Transcript[]>} Array of transcripts
   */
  async findByConversation(conversationId: string): Promise<Transcript[]> {
    try {
      // Verify conversation exists
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${conversationId} not found`,
        );
      }

      const transcripts = await this.prisma.transcript.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
      });

      return transcripts;
    } catch (error) {
      this.logger.error(
        `Error fetching transcripts for conversation ${conversationId}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  /**
   * Retrieve a single transcript by ID
   * 
   * @param id - Transcript ID
   * @returns {Promise<Transcript>} Transcript record
   */
  async findById(id: string): Promise<Transcript> {
    try {
      const transcript = await this.prisma.transcript.findUnique({
        where: { id },
        include: {
          conversation: true,
          messages: true,
        },
      });

      if (!transcript) {
        throw new NotFoundException(`Transcript with ID ${id} not found`);
      }

      return transcript;
    } catch (error) {
      this.logger.error(
        `Error fetching transcript ${id}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  /**
   * Update a transcript
   * 
   * @param id - Transcript ID
   * @param updateTranscriptDto - Partial update payload
   * @returns {Promise<Transcript>} Updated transcript record
   */
  async update(id: string, updateTranscriptDto: UpdateTranscriptDto): Promise<Transcript> {
    try {
      // Verify transcript exists
      const existingTranscript = await this.prisma.transcript.findUnique({
        where: { id },
      });

      if (!existingTranscript) {
        throw new NotFoundException(`Transcript with ID ${id} not found`);
      }

      // Normalize updated text if provided
      const normalizedText = updateTranscriptDto.rawText
        ? this.normalizeText(updateTranscriptDto.rawText)
        : undefined;

      const transcript = await this.prisma.transcript.update({
        where: { id },
        data: {
          ...updateTranscriptDto,
          normalizedText: normalizedText || existingTranscript.normalizedText,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`✓ Transcript updated: ${id}`);

      return transcript;
    } catch (error) {
      this.logger.error(
        `Error updating transcript ${id}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  /**
   * Delete a transcript
   * 
   * @param id - Transcript ID
   * @returns {Promise<Transcript>} Deleted transcript record
   */
  async delete(id: string): Promise<Transcript> {
    try {
      const transcript = await this.prisma.transcript.findUnique({
        where: { id },
      });

      if (!transcript) {
        throw new NotFoundException(`Transcript with ID ${id} not found`);
      }

      const deleted = await this.prisma.transcript.delete({
        where: { id },
      });

      this.logger.log(`✓ Transcript deleted: ${id}`);

      return deleted;
    } catch (error) {
      this.logger.error(
        `Error deleting transcript ${id}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  /**
   * Get conversation history with all transcripts and messages
   * 
   * @param conversationId - ID of the conversation
   * @returns {Promise<object>} Conversation with transcripts and messages
   */
  async getConversationHistory(conversationId: string) {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          transcripts: {
            orderBy: { createdAt: 'desc' },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${conversationId} not found`,
        );
      }

      return conversation;
    } catch (error) {
      this.logger.error(
        `Error fetching conversation history ${conversationId}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  /**
   * Normalize transcript text
   * - Remove extra whitespace
   * - Standardize punctuation
   * - Trim leading/trailing spaces
   * - Handle common speech-to-text errors
   * 
   * @param text - Raw transcript text
   * @returns {string} Normalized text
   * 
   * @example
   * const normalized = this.normalizeText('hello  world   !!!');
   * // Returns: 'Hello world!'
   */
  private normalizeText(text: string): string {
    if (!text) return '';

    // First trim and collapse whitespace
    const trimmed = text.trim().replace(/\s+/g, ' ');

    const normalized = trimmed
      // Capitalize first letter
      .charAt(0).toUpperCase() + trimmed.slice(1)
      // Fix double punctuation
      .replace(/([.!?])\1+/g, '$1')
      // Add space after punctuation if missing
      .replace(/([.!?])([a-zA-Z])/g, '$1 $2');

    return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
  }

  /**
   * Get transcript statistics
   * 
   * @param conversationId - ID of the conversation
   * @returns {Promise<object>} Statistics object
   */
  async getStatistics(conversationId: string) {
    try {
      const transcripts = await this.prisma.transcript.findMany({
        where: { conversationId },
      });

      return {
        totalTranscripts: transcripts.length,
        completedTranscripts: transcripts.filter((t) => t.status === TranscriptStatus.COMPLETED).length,
        failedTranscripts: transcripts.filter((t) => t.status === TranscriptStatus.FAILED).length,
        pendingTranscripts: transcripts.filter((t) => t.status === TranscriptStatus.PENDING).length,
        processingTranscripts: transcripts.filter((t) => t.status === TranscriptStatus.PROCESSING).length,
        totalDuration: transcripts.reduce((sum, t) => sum + (t.duration || 0), 0),
        languages: [...new Set(transcripts.map((t) => t.language))],
      };
    } catch (error) {
      this.logger.error(
        `Error fetching statistics for conversation ${conversationId}: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }
}
