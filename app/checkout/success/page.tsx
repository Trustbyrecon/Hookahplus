'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Success() {
  const sp = useSearchParams();
  const sid = sp.get('sid') || 'unknown';
  return (
    <main style={{maxWidth:640,margin:'64px auto',padding:'0 16px'}}>
      <h1>Payment Successful ✅</h1>
      <p>Checkout Session ID: <code>{sid}</code></p>
      <p>Your hookah session is confirmed. Staff will get your setup started.</p>
      <Link href="/">Back to Dashboard</Link>
    </main>
  );
}
