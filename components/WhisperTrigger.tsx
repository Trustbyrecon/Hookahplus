'use client';

import { useEffect, useState } from 'react';

export default function WhisperTrigger() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => {
        alert('Alie intro whisper pending.');
      }}
      className="mt-8 px-6 py-3 bg-mystic text-charcoal rounded-full animate-pulse hover:animate-none transition transform hover:scale-105 font-sans"
    >
      Play Alie’s Intro
    </button>
  );
}
