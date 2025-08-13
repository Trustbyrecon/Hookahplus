 Trustbyrecon-patch-1
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://hookahplus.net"), // fixes Netlify OG/Twitter warning
  title: "HookahPlus — Lounge Operator Stack",
  description:
    "HookahPlus powers QR preorders, flavor mix tracking, session-based POS, loyalty, and Recon Refire reliability so your team serves faster—with fewer mistakes.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "HookahPlus — Lounge Operator Stack",
    description:
      "QR preorders, flavor mix tracking, POS, loyalty, and Refire reliability for modern lounges.",
    url: "https://hookahplus.net",
    siteName: "HookahPlus",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HookahPlus Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HookahPlus — Lounge Operator Stack",
    description:
      "QR preorders, flavor mix tracking, POS, loyalty, and Refire reliability for modern lounges.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HookahPlus Lounge Onboarding',
  description: 'Exclusive HookahPlus lounge owner onboarding experience',
  metadataBase: new URL('https://hookahplus.net'),
  openGraph: {
    title: 'HookahPlus Lounge Onboarding',
    description: 'Elevate your lounge with HookahPlus premium onboarding experience.',
    url: 'https://hookahplus.net',
    siteName: 'HookahPlus',
    images: [
      {
        url: '/favicon.ico',
        width: 256,
        height: 256,
        alt: 'HookahPlus Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} bg-gradient-to-b from-[#1e1e1e] to-[#121212] text-white`}>
        {children}
      </body>
 main
    </html>
  )
}
