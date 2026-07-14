/**
 * Chat-to-Text Controller
 * Exposes REST API endpoints for speech-to-text transcription
 *
 * Routes:
 * - POST   /chat-to-text                          - Create new transcript
 * - GET    /chat-to-text/conversation/:id         - Get all transcripts for conversation
 * - GET    /chat-to-text/history/:id              - Get conversation history
 * - GET    /chat-to-text/stats/:id                - Get conversation statistics
 * - GET    /chat-to-text/:id                      - Get specific transcript
 * - PATCH  /chat-to-text/:id                      - Update transcript
 * - DELETE /chat-to-text/:id                      - Delete transcript
 */

import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Logger,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatToTextService } from './chat-to-text.service';
import { CreateTranscriptDto, TranscribeAudioDto, UpdateTranscriptDto } from './dtos';

interface IUploadedAudioFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

const MAX_AUDIO_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/aac',
  'audio/flac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'video/mp4',
  'video/webm',
];

@Controller('chat-to-text')
export class ChatToTextController {
  private readonly logger = new Logger(ChatToTextController.name);

  constructor(private readonly chatToTextService: ChatToTextService) {}

  /**
   * Converts an uploaded audio or video file to a persisted transcript.
   * The upload is held in memory only for the provider request and is not stored.
   */
  @Post('transcribe')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_AUDIO_FILE_SIZE_BYTES } }))
  async transcribeAudio(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
  fileType: /^(audio|video)\/(aac|flac|m4a|x-m4a|mpeg|mp4|ogg|wav|webm)$/,
})
        .addMaxSizeValidator({ maxSize: MAX_AUDIO_FILE_SIZE_BYTES })
        .build({ fileIsRequired: true }),
    )
    file: IUploadedAudioFile,
    @Body() transcribeAudioDto: TranscribeAudioDto,
  ) {
    if (!ALLOWED_AUDIO_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported audio or video file type');
    }

    const transcript = await this.chatToTextService.transcribeAudio(
      file,
      transcribeAudioDto,
    );

    return {
      success: true,
      data: transcript,
      message: 'Audio transcribed successfully',
    };
  }

  /**
   * Create a new transcript from raw audio/video text
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTranscriptDto: CreateTranscriptDto) {
    try {
      this.logger.log(
        `Creating transcript for conversation: ${createTranscriptDto.conversationId}`,
      );
      const transcript = await this.chatToTextService.create(createTranscriptDto);
      return {
        success: true,
        data: transcript,
        message: 'Transcript created successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error creating transcript: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Retrieve all transcripts for a specific conversation
   */
  @Get('conversation/:conversationId')
  async findByConversation(@Param('conversationId') conversationId: string) {
    try {
      this.logger.log(`Fetching transcripts for conversation: ${conversationId}`);
      const transcripts = await this.chatToTextService.findByConversation(conversationId);
      return {
        success: true,
        data: transcripts,
        count: transcripts.length,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching transcripts for conversation ${conversationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get complete conversation history with transcripts and messages
   */
  @Get('history/:conversationId')
  async getHistory(@Param('conversationId') conversationId: string) {
    try {
      this.logger.log(`Fetching conversation history: ${conversationId}`);
      const history = await this.chatToTextService.getConversationHistory(conversationId);
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching conversation history ${conversationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get conversation statistics
   */
  @Get('stats/:conversationId')
  async getStatistics(@Param('conversationId') conversationId: string) {
    try {
      this.logger.log(`Fetching statistics for conversation: ${conversationId}`);
      const statistics = await this.chatToTextService.getStatistics(conversationId);
      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching statistics for conversation ${conversationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Retrieve a specific transcript by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching transcript: ${id}`);
      const transcript = await this.chatToTextService.findById(id);
      return {
        success: true,
        data: transcript,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching transcript ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Update an existing transcript
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTranscriptDto: UpdateTranscriptDto,
  ) {
    try {
      this.logger.log(`Updating transcript: ${id}`);
      const transcript = await this.chatToTextService.update(id, updateTranscriptDto);
      return {
        success: true,
        data: transcript,
        message: 'Transcript updated successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error updating transcript ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Delete a transcript
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    try {
      this.logger.log(`Deleting transcript: ${id}`);
      await this.chatToTextService.delete(id);
      return {
        success: true,
        message: 'Transcript deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error deleting transcript ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
