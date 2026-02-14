import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <body style={{fontFamily:'ui-sans-serif',background:'#0b0c10',color:'#e9edf2'}}>
        {children}
      </body>
    </html>
  );
}
