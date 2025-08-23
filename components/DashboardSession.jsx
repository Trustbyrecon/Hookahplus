import React, { useEffect, useState } from 'react';

export default function DashboardSession() {
  const [seconds, setSeconds] = useState(17); // Starting at 17 like in image

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec) => {
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Hookah+ Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Session Card */}
        <div className="bg-[#1f1f1f] rounded-2xl p-5 shadow-md border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-green-400 flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-400 mr-2" />
              Active
            </span>
            <span className="text-sm">{formatTime(seconds)}</span>
          </div>

          <div className="text-2xl font-semibold mb-4">Mint</div>

          <div className="flex gap-3">
            <button className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700">
              🔽 Drop
            </button>
            <button className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700">
              💧 Refill
            </button>
            <button className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700">
              📜 Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
