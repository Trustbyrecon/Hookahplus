import React, { Suspense } from 'react'
import './globals.css'
import '../styles/mobile.css'
import '../styles/platform-optimizations.css'
import GlobalNavigation from '../components/GlobalNavigation'
import { CartProvider } from '../components/cart/CartProvider'
import AnalyticsScript from '../components/AnalyticsScript'
import ScrollManager from '../components/ScrollManager'
import { GuestSessionProvider } from '../contexts/GuestSessionContext'

export const metadata = {
  title: 'HookahPlus Guest Portal',
  description: 'Extend your session, request refills, and manage your hookah experience.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://placeholder.vercel.app'),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <AnalyticsScript />
      </head>
      <body className="min-h-screen bg-zinc-950 text-white mobile-content-container">
        <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
          <ScrollManager />
          <GuestSessionProvider>
            <CartProvider>
              <GlobalNavigation />
              {children}
            </CartProvider>
          </GuestSessionProvider>
        </Suspense>
      </body>
    </html>
  );
}