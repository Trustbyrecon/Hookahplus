import React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

// Moodbook classes are required; avoid overriding with default Tailwind colors.
export default function TimerControl({ value, onChange }: Props) {
  return (
 codex/add-moodbook-classes-to-reusable-components
    <div className="mb-4 rounded bg-charcoal p-2 text-goldLumen">

    <div className="mb-4 font-sans">
 main
      <label className="block text-sm font-medium mb-1">Session Timer (min)</label>
      <input
        type="number"
        min="0"
 codex/add-moodbook-classes-to-reusable-components
        className="w-full p-2 bg-deepMoss text-goldLumen"

 codex/add-moodbook-fonts-to-components
        className="w-full p-2 bg-gray-800 text-white font-sans"

        className="w-full p-2 bg-charcoal text-goldLumen"
 main
 main
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
    </div>
  );
}
