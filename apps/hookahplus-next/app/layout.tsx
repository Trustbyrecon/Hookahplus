// ✅ All imports first
import './globals.css'
import type { Metadata } from 'next'
import { inter } from '../lib/fonts'

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

// ✅ HTML & BODY are allowed here in app router layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-gradient-to-b from-[#1e1e1e] to-[#121212] text-white`}>
        {children}
      </body>
    </html>
  )
}
