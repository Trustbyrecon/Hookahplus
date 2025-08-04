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
 codex/add-moodbook-classes-to-reusable-components
    <div className="mb-4 flex space-x-2 rounded bg-charcoal p-2 text-goldLumen">
      {modes.map((m) => (
        <button
          key={m}
          className={`rounded px-3 py-1 ${
            m === mode ? 'bg-ember text-charcoal' : 'bg-deepMoss text-goldLumen'
          }`}

    <div className="mb-4 flex space-x-2 font-sans">
      {modes.map((m) => (
        <button
          key={m}
 codex/add-moodbook-fonts-to-components
          className={`px-3 py-1 rounded font-sans ${
            m === mode ? 'bg-ember text-white' : 'bg-gray-800 text-gray-300'
          }`}

          className={`px-3 py-1 rounded ${m === mode ? 'bg-ember text-goldLumen' : 'bg-charcoal text-goldLumen/70'}`}
 main
 main
          onClick={() => onChange(m)}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
}
