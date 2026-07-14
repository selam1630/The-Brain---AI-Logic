/**
 * Create Transcript DTO
 * Data Transfer Object for creating new transcripts
 */

import { IsString, IsOptional, IsNumber, Min, IsEnum, IsNotEmpty } from 'class-validator';

export enum TranscriptProvider {
  OPENAI = 'openai',
  GOOGLE_CLOUD = 'google-cloud',
  WEB_SPEECH_API = 'web-speech-api',
  AZURE = 'azure',
}

export class CreateTranscriptDto {
  /**
   * Conversation ID this transcript belongs to
   */
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  /**
   * URL to audio file
   */
  @IsOptional()
  @IsString()
  audioUrl?: string;

  /**
   * URL to video file
   */
  @IsOptional()
  @IsString()
  videoUrl?: string;

  /**
   * Duration of audio/video in milliseconds
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  /**
   * ISO language code (e.g., 'en', 'es', 'fr')
   */
  @IsOptional()
  @IsString()
  language?: string;

  /**
   * Speech-to-Text provider to use
   */
  @IsOptional()
  @IsEnum(TranscriptProvider)
  provider?: TranscriptProvider;

  /**
   * Raw transcribed text
   */
  @IsString()
  @IsNotEmpty()
  rawText!: string;
}
