import React from 'react';

export type ViewMode = 'staff' | 'manager' | 'owner';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: ViewMode[] = ['staff', 'manager', 'owner'];

export default function ViewModeToggle({ mode, onChange }: Props) {
  return (
    <div className="mb-4 flex space-x-2">
      {modes.map((m) => (
        <button
          key={m}
          className={`px-3 py-1 rounded ${m === mode ? 'bg-ember text-white' : 'bg-gray-800 text-gray-300'}`}
          onClick={() => onChange(m)}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
}
