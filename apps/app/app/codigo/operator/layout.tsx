import { CodigoAccessGate } from '../../../components/CodigoAccessGate';

export default function CodigoOperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CodigoAccessGate>{children}</CodigoAccessGate>;
}
