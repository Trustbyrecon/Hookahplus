import '../styles/globals.css';
import '../styles/whisper.css';
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata = {
  title: 'Hookah+',
  description: 'Hookah+ portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen bg-charcoal text-goldLumen">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
