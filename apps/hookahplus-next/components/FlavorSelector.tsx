'use client';

import React from 'react';
import { reflex } from '../lib/reflex';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// Moodbook classes are required; avoid overriding with default Tailwind colors.
export default function FlavorSelector({ value, onChange }: Props) {
  const flavors = ['Mint', 'Double Apple', 'Grape'];

  const handleChange = (newValue: string) => {
    reflex.logEvent?.('flavor_selected', {
      flavor: newValue,
      timestamp: Date.now(),
    });
    onChange(newValue);
  };

  return (
    <div className="mb-4 rounded bg-charcoal p-2 text-goldLumen font-sans">
      <label className="block text-sm font-medium mb-1">Flavor</label>
      <select
        className="w-full p-2 bg-charcoal text-goldLumen"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      >
        {flavors.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>
  );
}
