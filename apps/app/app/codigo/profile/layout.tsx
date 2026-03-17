import { CodigoAccessGate } from '../../../components/CodigoAccessGate';

export default function CodigoProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CodigoAccessGate>{children}</CodigoAccessGate>;
}
