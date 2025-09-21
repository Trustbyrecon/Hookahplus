import './globals.css'
import GlobalNavigation from '@hookahplus/design-system/src/components/GlobalNavigation'

export const metadata = {
  title: 'HookahPlus Guest Portal',
  description: 'Extend your session, request refills, and manage your hookah experience.',
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