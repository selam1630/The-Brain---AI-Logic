/**
 * Transcribe Audio DTO
 * Metadata supplied alongside an uploaded audio or video file.
 */

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TranscribeAudioDto {
  /** Conversation that will own the completed transcript. */
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  /** Optional BCP 47 language hint for the transcription provider. */
  @IsOptional()
  @IsString()
  language?: string;
}
