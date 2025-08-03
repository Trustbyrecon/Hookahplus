import React from 'react';

export const metadata = {
  title: 'Hookah+',
  description: 'Hookah+ dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
