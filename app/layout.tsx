export const metadata = {
  title: 'Hookah+ — Session Reimagined',
  description: 'Premium lounge experience: flavor mixes, live session checkout, and loyalty.',
  metadataBase: new URL('https://hookahplus.net'),
  openGraph: {
    title: 'Hookah+ — Session Reimagined',
    description: 'Live sessions, premium flavors, and loyalty—brought together.',
    url: 'https://hookahplus.net',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
