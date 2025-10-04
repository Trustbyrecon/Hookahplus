import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html>
      <body style={{fontFamily:'ui-sans-serif',background:'#0b0c10',color:'#e9edf2'}}>
        {children}
      </body>
    </html>
  );
}