import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AnalyticsScript from '../components/AnalyticsScript'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hookah+ - The Future of Hookah Lounge Management',
  description: 'Experience the future of lounge sessions with AI-powered personalization, secure payments, and seamless ordering.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://placeholder.vercel.app')
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isPrettyTheme = process.env.NEXT_PUBLIC_PRETTY_THEME === '1';

  return (
    <html lang="en" className={isPrettyTheme ? 'pretty-theme' : ''}>
      <head>
        <AnalyticsScript />
      </head>
      <body className={`${inter.className} ${isPrettyTheme ? 'pretty-theme' : ''}`}>
        {/* Top Status Bar */}
        {isPrettyTheme && (
          <div className="status-bar">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-zinc-400">System Health</span>
                    <span className="text-sm font-semibold text-green-400">EXCELLENT</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-zinc-400">Trust Score</span>
                    <span className="text-sm font-semibold text-teal-400">87%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-zinc-400">Live Sessions</span>
                    <span className="text-sm font-semibold text-blue-400">0</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-sm text-zinc-400 hover:text-white transition-colors duration-300">
                    Auto-refresh: ON
                  </button>
                  <div className="w-px h-4 bg-zinc-600"></div>
                  <span className="text-xs text-zinc-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Container */}
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}