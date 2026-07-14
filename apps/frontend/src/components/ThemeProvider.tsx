/**
 * Theme Provider Component
 * Wraps the application with next-themes for dark/light mode support
 * Handles theme persistence to localStorage
 */

import React from 'react';
import { ThemeProvider } from 'next-themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeWrapper Component
 * Provides theme context to all child components
 * Manages theme switching and persistence
 */
export const ThemeWrapper: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      storageKey="the-brain-theme"
      forcedTheme={undefined}
      enableColorScheme={true}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
};

export default ThemeWrapper;
