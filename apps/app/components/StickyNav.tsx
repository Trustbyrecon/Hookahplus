'use client';

import React from 'react';
import Link from 'next/link';

interface StickyNavProps {
  onStartSession: () => void;
}

export default function StickyNav({ onStartSession }: StickyNavProps) {
  return (
    <nav className="sticky top-0 z-50 bg-charcoal text-goldLumen shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-display font-bold">
          Hookah+
        </Link>
        <div className="space-x-4">
          <Link
            href="/onboarding"
            className="px-4 py-2 bg-mystic text-charcoal rounded-md hover:bg-mystic/80"
          >
            Onboard
          </Link>
          <button
            onClick={onStartSession}
            className="px-4 py-2 bg-goldLumen text-charcoal rounded-md hover:bg-goldLumen/80"
          >
            Start Session
          </button>
        </div>
      </div>
    </nav>
  );
}

