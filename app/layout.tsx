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
    </html>
  )
}
