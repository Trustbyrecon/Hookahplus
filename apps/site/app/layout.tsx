import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hookah+',
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
