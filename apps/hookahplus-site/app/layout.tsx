import './globals.css'
import type { Metadata } from 'next'
import { inter } from '../lib/fonts'

export const metadata: Metadata = {
  title: 'HookahPlus - Premium Hookah Lounge Platform',
  description: 'Elevate your hookah lounge experience with HookahPlus premium platform',
}

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