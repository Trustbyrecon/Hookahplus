import React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function TimerControl({ value, onChange }: Props) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Session Timer (min)</label>
      <input
        type="number"
        min="0"
        className="w-full p-2 bg-charcoal text-goldLumen"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
    </div>
  );
}
