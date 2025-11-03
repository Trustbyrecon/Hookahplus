'use client';

import React, { useEffect, useRef, useState } from 'react';
import FloatingEcho from './FloatingEcho';
import WhisperMemoryLink from './WhisperMemoryLink';
import { scrollTriggers, clickTriggers } from '../utils/WhisperTriggerMap';

interface Whisper {
  id: number;
  text: string;
}

let idCounter = 0;

export default function WhisperOverlayEngine() {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const triggeredScroll = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = Math.round((window.scrollY / scrollHeight) * 100);
      Object.entries(scrollTriggers).forEach(([threshold, text]) => {
        const t = Number(threshold);
        if (percent >= t && !triggeredScroll.current.has(t)) {
          triggeredScroll.current.add(t);
          pushWhisper(text);
        }
      });
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const key = target.dataset.whisper;
      if (key && clickTriggers[key]) {
        pushWhisper(clickTriggers[key]);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const pushWhisper = (text: string) => {
    const id = ++idCounter;
    setWhispers((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setWhispers((prev) => prev.filter((w) => w.id !== id));
    }, 4000);
  };

  return (
    <div className="whisper-overlay">
      {whispers.map((w) => (
        <div key={w.id}>
          <FloatingEcho message={w.text} />
          <WhisperMemoryLink moment={w.text} />
        </div>
      ))}
    </div>
  );
}
