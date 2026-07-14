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

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTranscriptDto, UpdateTranscriptDto } from './dtos';
import { TranscriptStatus, Transcript, Conversation } from '@prisma/client';

@Injectable()
export class ChatToTextService {
  private readonly logger = new Logger(ChatToTextService.name);

  constructor(private readonly prisma: PrismaService) {}

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
