import './globals.css'

export const metadata = {
  title: 'HookahPlus - The Future of Hookah Lounge Management',
  description: 'Automated session management, smart refills, and reservation holds for modern hookah lounges.',
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
