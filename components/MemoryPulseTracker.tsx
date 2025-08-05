'use client';

import { useEffect } from 'react';

export default function MemoryPulseTracker() {
  useEffect(() => {
    const pulses = Number(localStorage.getItem('memory-pulses') || '0') + 1;
    localStorage.setItem('memory-pulses', pulses.toString());
  }, []);

  return <div className="hidden" aria-hidden />;
}
