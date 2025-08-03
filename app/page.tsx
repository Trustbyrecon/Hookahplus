import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Welcome to Hookah+</h1>
      <p className="mt-2">Your command center for flavor, flow, and loyalty intelligence.</p>
      <div className="mt-4 space-x-4">
        <Link href="/onboarding">Start Onboarding</Link>
        <Link href="/demo">See a Demo</Link>
        <Link href="/live">Join Live Session</Link>
      </div>
    </main>
  );
}
