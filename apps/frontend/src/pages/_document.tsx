/**
 * _document.tsx
 * Next.js Document Component - HTML structure and document setup
 */

import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Document Component
 * Configures the HTML structure and prevents flash of unstyled content (FOUC)
 * during theme transitions
 */
export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        {/* Prevent flash of light theme when dark mode preference exists */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('the-brain-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = theme === 'dark' || (!theme && prefersDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
