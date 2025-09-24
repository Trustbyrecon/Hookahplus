import './globals.css'
import { GlobalNavigation } from '@hookahplus/design-system'

export const metadata = {
  title: 'HookahPlus Operator Dashboard',
  description: 'Manage sessions, refills, and reservations for your hookah lounge.',
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