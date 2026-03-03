import './globals.css'
import GlobalNavigation from '../components/GlobalNavigation'
import Footer from '../components/Footer'
import AnalyticsScript from '../components/AnalyticsScript'

export const metadata = {
  title: 'Hookah+ | Session-Based Lounge Software That Remembers Guests',
  description: 'Great hospitality is built on memory, not transactions. Hookah+ is session-based hookah lounge management software that remembers guests, tracks sessions, and powers loyalty above Square, Clover, and Toast.',
  keywords: 'hookah lounge software, session management, guest memory, loyalty software, Square integration, Clover integration, Toast integration, hookah lounge POS, table management, flavor tracking',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'),
  openGraph: {
    title: 'Hookah+ | Session-Based Lounge Software That Remembers Guests',
    description: 'Great hospitality is built on memory, not transactions. Hookah+ remembers guests, tracks sessions, and powers loyalty above your POS.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hookah+ | Session-Based Lounge Software That Remembers Guests',
    description: 'Great hospitality is built on memory, not transactions. Hookah+ remembers guests, tracks sessions, and powers loyalty.',
  },
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
      <body className="min-h-screen bg-zinc-950 text-white">
        <GlobalNavigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}