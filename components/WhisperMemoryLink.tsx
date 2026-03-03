'use client';

import { useEffect } from 'react';

interface WhisperMemoryLinkProps {
  moment: string;
}

export default function WhisperMemoryLink({ moment }: WhisperMemoryLinkProps) {
  useEffect(() => {
    // Placeholder for linking to SessionNotes, ReflexLog.json, LoyaltyBadgeHistory.yaml
    console.log('Whisper moment linked:', moment);
  }, [moment]);

  return null;
}
