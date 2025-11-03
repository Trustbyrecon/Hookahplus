'use client';

import { useState } from 'react';

const events = [
  { time: 0, label: 'Start' },
  { time: 30, label: 'Refill' },
  { time: 60, label: 'Burnout' },
  { time: 90, label: 'Feedback' },
];

export default function SessionReplayTimeline() {
  const [t, setT] = useState(0);
  const current = events.filter((e) => e.time <= t).slice(-1)[0] ?? events[0];

  return (
    <div className="mt-8">
      <input
        type="range"
        min={0}
        max={90}
        step={1}
        value={t}
        onChange={(e) => setT(parseInt(e.target.value, 10))}
        className="w-full"
      />
      <div className="mt-2 text-center text-goldLumen">
        {current.label} ({t}s)
      </div>
    </div>
  );
}
