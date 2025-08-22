
import React, { useState } from 'react';

export default function SessionNotes() {
  const [notes, setNotes] = useState("");

  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-2">Session Notes (Staff Only)</h2>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Flavor pref, seating style, vibe notes..."
        className="w-full h-24 p-2 rounded bg-gray-800"
      />
    </div>
  );
}
