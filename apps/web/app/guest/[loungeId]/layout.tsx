// apps/web/app/guest/[loungeId]/layout.tsx
import { IdentityProvider } from "@/apps/web/components/guest/IdentityProvider";

export default function GuestLayout({ children, params }: { children: React.ReactNode; params: { loungeId: string } }) {
  return <IdentityProvider loungeId={params.loungeId}>{children}</IdentityProvider>;
}
