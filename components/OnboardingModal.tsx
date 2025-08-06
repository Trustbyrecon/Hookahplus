'use client';

import React, { useState } from 'react';
import FlavorSelector from './FlavorSelector';
import TimerControl from './TimerControl';

declare const reflex:
  | { logEvent: (event: string, payload: Record<string, unknown>) => void }
  | undefined;

interface Props {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const [flavor, setFlavor] = useState('Mint');
  const [timer, setTimer] = useState(60);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-charcoal/70">
      <div className="bg-charcoal text-goldLumen p-6 rounded shadow-xl w-80 font-sans">
        <h2 className="text-xl font-display font-bold mb-4">Set Up Session</h2>
        <FlavorSelector value={flavor} onChange={setFlavor} />
        <TimerControl value={timer} onChange={setTimer} />
        <button
          className="mt-4 w-full bg-ember hover:bg-mystic text-goldLumen py-2 px-4 rounded"
          onClick={() => {
            reflex?.logEvent('loyalty_triggered', {
              flavor,
              mix: { timer },
              epScore: 0,
              timestamp: Date.now(),
            });
            onComplete();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
