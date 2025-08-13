// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { baseMetadata } from './app/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/hookahplus-logo.png',
  },
  openGraph: {
    title: 'Hookah+ — Lounge Operator Stack',
    description: 'The Future of Lounge Management Starts Here',
    url: 'https://hookahplus.net',
    siteName: 'Hookah+',
    images: [
      {
        url: '/hookahplus-logo.png',
        width: 800,
        height: 800,
        alt: 'Hookah+ Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@YourTwitterHandle',
    images: ['/hookahplus-logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
