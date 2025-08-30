import React from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{fontFamily:'ui-sans-serif',background:'#0b0c10',color:'#e9edf2'}}>
        {children}
      </body>
    </html>
  )
}
