import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
