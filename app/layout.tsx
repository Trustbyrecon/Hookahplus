import '../styles/globals.css';
import React from 'react';

export const metadata = {
  title: 'Hookah+',
  description: 'Hookah+ portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
