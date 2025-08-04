import React, { useState } from 'react';
import FlavorSelector from './FlavorSelector';
import TimerControl from './TimerControl';

interface Props {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const [flavor, setFlavor] = useState('Mint');
  const [timer, setTimer] = useState(60);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 p-6 rounded shadow-xl w-80">
        <h2 className="text-xl font-bold mb-4">Set Up Session</h2>
        <FlavorSelector value={flavor} onChange={setFlavor} />
        <TimerControl value={timer} onChange={setTimer} />
        <button
          className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
          onClick={onComplete}
        >
          Save
        </button>
      </div>
    </div>
  );
}
