/**
 * Theme Toggle Component
 * Button to switch between light and dark modes
 * Smooth transitions with next-themes
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * ThemeToggle Component
 * Provides a button to toggle between light and dark themes
 * Includes smooth transitions and icon changes
 */
export const ThemeToggle: React.FC = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
        aria-label="Loading theme toggle"
        disabled
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        transition-colors duration-300 ease-in-out
        ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-gray-100 hover:bg-gray-200'
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}
        focus:ring-blue-500
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <svg
          className="w-5 h-5 text-yellow-400 transition-transform duration-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 00-1.414 0l-2.12 2.12a1 1 0 001.414 1.414L9 11.414l1.586 1.586a1 1 0 001.414-1.414zM15 11a1 1 0 100-2h-1a1 1 0 100 2h1zm2.657-5.657a1 1 0 00-1.414 0l-1.414 1.414a1 1 0 001.414 1.414l1.414-1.414a1 1 0 000-1.414zM5 9a1 1 0 100-2H4a1 1 0 100 2h1zm3.657-5.657a1 1 0 00-1.414 1.414L7.586 5a1 1 0 001.414-1.414L8.657 3.343z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-gray-700 transition-transform duration-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
