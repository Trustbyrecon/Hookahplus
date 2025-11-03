import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hookah+ Guest',
};

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
