import React from 'react';

export type ViewMode = 'staff' | 'manager' | 'owner';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: ViewMode[] = ['staff', 'manager', 'owner'];

// Moodbook classes are required; avoid overriding with default Tailwind colors.
export default function ViewModeToggle({ mode, onChange }: Props) {
  return (
    <div className="mb-4 flex space-x-2 rounded bg-charcoal p-2 text-goldLumen font-sans">
      {modes.map((m) => (
        <button
          key={m}
          className={`px-3 py-1 rounded ${
            m === mode ? 'bg-ember text-goldLumen' : 'bg-charcoal text-goldLumen/70'
          }`}
          onClick={() => onChange(m)}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
}
