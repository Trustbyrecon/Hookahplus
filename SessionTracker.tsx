
import React, { useState, useEffect } from 'react';

export default function SessionTracker() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime !== null) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-2">Session Timer</h2>
      <p className="text-2xl">{elapsed}s</p>
      <button
        onClick={() => setStartTime(Date.now())}
        className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
      >
        Start Session
      </button>
    </div>
  );
}
