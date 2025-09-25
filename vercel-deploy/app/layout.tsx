import './globals.css'
import GlobalNavigation from '../components/GlobalNavigation'

export const metadata = {
  title: 'HookahPlus - The Future of Hookah Lounge Management',
  description: 'Experience the future of lounge sessions with AI-powered personalization, secure payments, and seamless ordering.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-white">
        <GlobalNavigation />
        {children}
      </body>
    </html>
  )
}