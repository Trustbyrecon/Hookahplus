import { CodigoAccessGate } from '../../../components/CodigoAccessGate';

export default function CodigoKpisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CodigoAccessGate>{children}</CodigoAccessGate>;
}
