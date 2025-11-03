'use client';

import { useEffect, useState } from 'react';

const moments = [
  { y: 200, text: 'Whisper: Check table 5 heat.' },
  { y: 600, text: 'Whisper: Mango Dream memory ignited.' },
];

interface ActiveMoment {
  y: number;
  text: string;
}

export default function WhisperCatch() {
  const [active, setActive] = useState<ActiveMoment[]>([]);
  const [seen, setSeen] = useState<number[]>([]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      moments.forEach((m, idx) => {
        if (scrollY > m.y && !seen.includes(idx)) {
          setSeen((prev) => [...prev, idx]);
          setActive((prev) => [...prev, m]);
          setTimeout(() => {
            setActive((prev) => prev.filter((a) => a !== m));
          }, 4000);
        }
      });
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [seen]);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {active.map((m, idx) => (
        <div
          key={idx}
          className="absolute left-1/2 top-20 -translate-x-1/2 bg-deepMoss text-goldLumen px-4 py-2 rounded-full opacity-70"
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}
