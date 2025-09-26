import './globals.css'
import GlobalNavigation from '../components/GlobalNavigation'

export const metadata = {
  title: 'HookahPlus Guest Portal',
  description: 'Extend your session, request refills, and manage your hookah experience.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://placeholder.vercel.app')
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