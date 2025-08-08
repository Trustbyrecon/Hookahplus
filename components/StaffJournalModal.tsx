"use client";

import { useState } from 'react';
import useAutosave from '../utils/useAutosave';

export default function StaffJournalModal() {
  const [entry, setEntry] = useState('');
  const [whisper, setWhisper] = useState<string | null>(null);

  const saveEntry = async (content: string) => {
    try {
      const res = await fetch('/api/journal-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-token': 'demo-token',
        },
        body: JSON.stringify({ entry: content }),
      });

      if (!res.ok) {
        console.warn('Journal save failed', await res.text());
        return;
      }

      const data = await res.json();
      if (data.whisper) {
        setWhisper(data.whisper);
      }
    } catch (err) {
      console.error('Autosave error', err);
    }
  };

  useAutosave(entry, saveEntry);

  return (
    <div className="p-4">
      <textarea
        className="w-full p-2 rounded"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Log your shift reflection..."
      />
      {whisper && <p className="mt-2 italic">{whisper}</p>}
    </div>
  );
}
