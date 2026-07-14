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

interface Transcript {
  id: string;
  conversationId: string;
  rawText: string;
  normalizedText: string;
  status: string;
  createdAt: string;
  language: string;
}

/**
 * Chat-to-Text Page Component
 * Main interface for speech-to-text functionality
 */
const ChatToText: NextPage = () => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * Initialize conversation on component mount
   */
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // In a real app, this would create a new conversation
        // For now, we'll use a demo ID
        const demoId = `conv_${Date.now()}`;
        setConversationId(demoId);
      } catch (err) {
        setError('Failed to initialize conversation');
      }
    };

    initializeConversation();
  }, []);

  /**
   * Start audio recording
   */
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        await handleTranscription();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
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
    if (!conversationId || audioChunksRef.current.length === 0) {
      setError('No audio recorded or conversation not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          // For demo purposes, we'll create a transcript with dummy data
          // In production, this would send to your speech-to-text API
          const mockTranscript: Transcript = {
            id: `transcript_${Date.now()}`,
            conversationId,
            rawText: 'This is a demo transcription of your recording',
            normalizedText: 'This is a demo transcription of your recording.',
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
            language: selectedLanguage,
          };

          setTranscripts((prev) => [mockTranscript, ...prev]);
          audioChunksRef.current = [];
        } catch (err) {
          setError('Failed to process audio');
          console.error('Transcription error:', err);
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsArrayBuffer(audioBlob);
    } catch (err) {
      setError('Failed to transcribe audio');
      setIsLoading(false);
      console.error('Error:', err);
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
    navigator.clipboard.writeText(text);
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
                          onClick={() => copyToClipboard(transcript.normalizedText)}
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
                        {transcript.rawText}
                      </p>
                    </div>

                    {/* Normalized Text */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Normalized Text:
                      </h4>
                      <p className="text-gray-700 dark:text-gray-200 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                        {transcript.normalizedText}
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
