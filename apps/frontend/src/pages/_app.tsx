/**
 * _app.tsx
 * Next.js App Component - Entry point for the application
 * Initializes theme provider and global styles
 */

import type { AppProps } from 'next/app';
import { ThemeWrapper } from '@/components/ThemeProvider';
import '@/styles/globals.css';

/**
 * App Component
 * Root component that wraps all pages with providers and global styles
 */
function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeWrapper>
      <Component {...pageProps} />
    </ThemeWrapper>
  );
}

export default App;
