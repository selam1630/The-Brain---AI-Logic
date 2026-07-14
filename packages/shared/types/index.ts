/**
 * Shared Types
 * Common type definitions used across backend and frontend
 */

/**
 * Transcript Status Enum
 * Represents the processing status of a transcript
 */
export enum TranscriptStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Transcript Type
 * Represents a transcribed audio/video segment
 */
export interface ITranscript {
  id: string;
  conversationId: string;
  audioUrl?: string;
  videoUrl?: string;
  duration?: number;
  rawText: string;
  normalizedText: string;
  language: string;
  confidence?: number;
  provider?: string;
  processingTime?: number;
  status: TranscriptStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation Type
 * Represents a collection of transcripts and messages
 */
export interface IConversation {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Type
 * Represents an application user
 */
export interface IUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  language: string;
  theme: 'light' | 'dark';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API Response Type
 * Standard response format for all API endpoints
 */
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
