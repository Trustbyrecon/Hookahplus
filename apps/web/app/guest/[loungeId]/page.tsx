// apps/web/app/guest/[loungeId]/page.tsx
"use client";
import { useIdentity } from "@/apps/web/components/guest/IdentityProvider";

export default function GuestHome() {
  const { loading, guestId } = useIdentity();
  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Welcome</h1>
      <p className="text-sm text-gray-500">Guest ID: {guestId}</p>
      <div className="space-y-2">
        <a className="underline" href="./menu">Open Menu</a><br />
        <a className="underline" href="./checkout">Checkout</a>
      </div>
    </main>
  );
}
