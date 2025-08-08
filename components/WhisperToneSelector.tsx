"use client";

import { useEffect, useState } from 'react';

interface Props {
  tone?: string;
}

export default function WhisperToneSelector({ tone }: Props) {
  const [currentTone, setCurrentTone] = useState('chill');

  useEffect(() => {
    const override = typeof window !== 'undefined' ? localStorage.getItem('whisperToneOverride') : null;
    if (override) {
      setCurrentTone(override);
    } else if (tone) {
      setCurrentTone(tone);
    }
  }, [tone]);

  return <div className="p-2">Whisper tone: {currentTone}</div>;
}
