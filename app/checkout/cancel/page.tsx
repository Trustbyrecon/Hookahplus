'use client';

import Link from 'next/link';

export default function Cancel() {
  return (
    <main style={{maxWidth:640,margin:'64px auto',padding:'0 16px'}}>
      <h1>Payment Canceled</h1>
      <p>No charges were made. You can try again or choose a different option.</p>
      <Link href="/">Back to Dashboard</Link>
    </main>
  );
}
