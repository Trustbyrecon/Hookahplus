import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
