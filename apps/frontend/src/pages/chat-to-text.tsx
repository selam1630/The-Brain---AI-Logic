/**
 * Chat-to-Text Page Component
 * Provides interface for speech-to-text transcription
 * Includes recording controls and transcript display
 */

import React, { useState, useRef, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

const CONVERSATION_ID_STORAGE_KEY = 'the-brain.chat-to-text.conversation-id';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

interface ITranscript {
  id: string;
  conversationId: string;
  rawText: string | null;
  normalizedText: string | null;
  status: string;
  createdAt: string;
  language: string;
}

interface IApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

interface IApiErrorResponse {
  message?: string | string[];
}

/** Returns a user-friendly message from an API error payload. */
const getApiErrorMessage = (payload: unknown): string | undefined => {
  if (typeof payload !== 'object' || payload === null || !('message' in payload)) {
    return undefined;
  }

  const message = (payload as IApiErrorResponse).message;
  return Array.isArray(message) ? message.join(', ') : message;
};

/** Narrows an unknown response to the API transcript response contract. */
const isTranscriptResponse = (payload: unknown): payload is IApiSuccessResponse<ITranscript> => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    (payload as { success: unknown }).success === true &&
    'data' in payload
  );
};

/**
 * Chat-to-Text Page Component
 * Main interface for speech-to-text functionality
 */
const ChatToText: NextPage = () => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<ITranscript[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  /** Restores the last valid conversation ID selected by the user. */
  useEffect(() => {
    setConversationId(localStorage.getItem(CONVERSATION_ID_STORAGE_KEY) ?? '');
  }, []);

  /** Persists the selected conversation so the user does not need to re-enter it on refresh. */
  const handleConversationIdChange = (value: string) => {
    setConversationId(value);
    const trimmedValue = value.trim();

    if (trimmedValue) {
      localStorage.setItem(CONVERSATION_ID_STORAGE_KEY, trimmedValue);
    } else {
      localStorage.removeItem(CONVERSATION_ID_STORAGE_KEY);
    }
  };

  /**
   * Start audio recording
   */
  const startRecording = async () => {
    if (!conversationId.trim()) {
      setError('Enter an existing conversation ID before recording.');
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        await handleTranscription();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  /**
   * Stop audio recording
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * Handle transcription of recorded audio
   */
  const handleTranscription = async () => {
    const currentConversationId = conversationId.trim();
    if (!currentConversationId || audioChunksRef.current.length === 0) {
      setError('No audio was recorded or no conversation ID was provided.');
      return;
    }

    setIsLoading(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('conversationId', currentConversationId);
      formData.append('language', selectedLanguage);

      const response = await fetch(`${API_BASE_URL}/api/v1/chat-to-text/transcribe`, {
        method: 'POST',
        body: formData,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload) ?? 'The transcription request failed.');
      }

      if (!isTranscriptResponse(payload)) {
        throw new Error('The transcription service returned an invalid response.');
      }

      setTranscripts((previousTranscripts) => [payload.data, ...previousTranscripts]);
      audioChunksRef.current = [];
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to transcribe the recorded audio.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a transcript
   */
  const deleteTranscript = (id: string) => {
    setTranscripts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Copy transcript text to clipboard
   */
  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  return (
    <>
      <Head>
        <title>Speech-to-Text | The Brain</title>
        <meta name="description" content="Convert audio to text with AI" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container-main">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TB</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  The Brain
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Speech-to-Text
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 py-12">
        <div className="container-main max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Speech-to-Text
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Record audio and convert it to text with AI
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Recording Section */}
          <div className="card mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Record Audio
            </h2>

            <div className="mb-6">
              <label
                htmlFor="conversation-id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Conversation ID
              </label>
              <input
                id="conversation-id"
                type="text"
                value={conversationId}
                onChange={(event) => handleConversationIdChange(event.target.value)}
                disabled={isRecording || isLoading}
                className="input-field"
                placeholder="Paste an existing conversation ID"
                aria-describedby="conversation-id-help"
              />
              <p id="conversation-id-help" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                The ID must belong to a conversation already saved in the database.
              </p>
            </div>

            {/* Language Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isRecording}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="am">Amharic</option>
              </select>
            </div>

            {/* Recording Controls */}
            <div className="flex gap-4 mb-6">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isLoading}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  🎤 Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="btn-primary px-8 py-3 text-lg bg-red-600 hover:bg-red-700 active:bg-red-800"
                >
                  ⏹ Stop Recording
                </button>
              )}

              {isRecording && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                  <div className="w-3 h-3 bg-red-600 dark:bg-red-400 rounded-full animate-pulse" />
                  Recording...
                </div>
              )}
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                Processing audio...
              </div>
            )}
          </div>

          {/* Transcripts Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Transcripts ({transcripts.length})
            </h2>

            {transcripts.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No transcripts yet. Start recording to create one!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transcripts.map((transcript) => (
                  <div
                    key={transcript.id}
                    className="card hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                            {transcript.status}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transcript.createdAt).toLocaleString()}
                          </span>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            [{transcript.language.toUpperCase()}]
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(transcript.normalizedText ?? '')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => deleteTranscript(transcript.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                          title="Delete transcript"
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    {/* Raw Text */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Raw Text:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        {transcript.rawText ?? 'No raw text available.'}
                      </p>
                    </div>

                    {/* Normalized Text */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Normalized Text:
                      </h4>
                      <p className="text-gray-700 dark:text-gray-200 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                        {transcript.normalizedText ?? 'No normalized text available.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ChatToText;
