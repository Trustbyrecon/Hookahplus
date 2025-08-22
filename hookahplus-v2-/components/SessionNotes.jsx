'use client';
import React from 'react';
import { useSession } from './SessionContext';
import { useReflexAgent } from './ReflexAgentContext';

export default function SessionNotes() {
  const { session, setSession } = useSession();
  const { logSessionNote } = useReflexAgent();

  const handleNote = (e) => {
    const newNote = e.target.value;
    setSession(prev => ({ ...prev, notes: newNote }));
    logSessionNote(newNote);
  };

  return (
    <div className="mt-4">
      <label className="block mb-1 font-semibold">Session Notes:</label>
      <textarea
        value={session.notes}
        onChange={handleNote}
        className="w-full h-24 p-2 bg-gray-900 text-white rounded"
        placeholder="Private staff-only notes..."
      />
    </div>
  );
}
