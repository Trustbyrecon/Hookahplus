'use client';

import { useEffect, useState } from 'react';

export default function MemoryPulseTracker() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const pulses = Number(localStorage.getItem('memory-pulses') || '0') + 1;
    localStorage.setItem('memory-pulses', pulses.toString());
  }, []);

  if (!mounted) return null;

  return <div className="hidden" aria-hidden />;
}
