
import React from 'react';

export default function EndSessionModal({ onEnd }: { onEnd: () => void }) {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-md mt-4">
      <h2 className="text-xl font-bold">End Session</h2>
      <button
        onClick={onEnd}
        className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
      >
        End Now
      </button>
    </div>
  );
}
