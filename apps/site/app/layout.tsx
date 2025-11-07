import './globals.css'
import GlobalNavigation from '../components/GlobalNavigation'
import Footer from '../components/Footer'
import AnalyticsScript from '../components/AnalyticsScript'

export const metadata = {
  title: 'HookahPlus - The Future of Hookah Lounge Management',
  description: 'Experience the future of lounge sessions with AI-powered personalization, secure payments, and seamless ordering.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://placeholder.vercel.app')
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