/**
 * Home Page Component
 * Main landing page for The Brain AI & Logic platform
 */

import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * Home Page Component
 * Displays the main landing page with welcome message and navigation
 */
const Home: NextPage = () => {
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  /**
   * Check API health on component mount
   */
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/health`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        setApiStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        setApiStatus('offline');
      }
    };

    checkApiHealth();
  }, []);

  return (
    <>
      <Head>
        <title>The Brain - AI & Logic Platform</title>
        <meta name="description" content="Speech-to-Text and AI Logic Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container-main">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">TB</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                The Brain
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/chat-to-text"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Speech-to-Text
              </Link>
              <Link
                href="/about"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/docs"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Docs
              </Link>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              AI-Powered Speech-to-Text
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Convert audio and video streams into accurate, normalized transcripts.
              Powered by cutting-edge AI technology with enterprise-grade security.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/chat-to-text"
                className="btn-primary text-lg px-8 py-3 inline-flex justify-center"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="btn-secondary text-lg px-8 py-3 inline-flex justify-center"
              >
                Learn More
              </a>
            </div>

            {/* API Status */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`w-2 h-2 rounded-full ${
                  apiStatus === 'online'
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                API Status:{' '}
                {apiStatus === 'loading' && 'Checking...'}
                {apiStatus === 'online' && (
                  <span className="text-green-600 dark:text-green-400">Online</span>
                )}
                {apiStatus === 'offline' && (
                  <span className="text-red-600 dark:text-red-400">Offline</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Real-time Transcription
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Convert audio and video streams to text in real-time with high accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Smart Normalization
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automatically normalize and enhance transcripts for better readability.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Enterprise Security
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                End-to-end encryption with GDPR and privacy compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container-main py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 The Brain AI & Logic. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a
                href="#privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
              >
                Privacy
              </a>
              <a
                href="#terms"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
              >
                Terms
              </a>
              <a
                href="#contact"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
