// import './globals.css' // Temporarily disabled
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hookah+ - The Future of Hookah Lounge Management',
  description: 'Experience the future of lounge sessions with AI-powered personalization, secure payments, and seamless ordering.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.vercel.app')
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}