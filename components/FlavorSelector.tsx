import React from 'react';

declare const reflex:
  | { logEvent: (event: string, payload: Record<string, unknown>) => void }
  | undefined;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function FlavorSelector({ value, onChange }: Props) {
  const flavors = ['Mint', 'Double Apple', 'Grape'];

  const handleChange = (newValue: string) => {
    reflex?.logEvent('flavor_selected', {
      flavor: newValue,
      timestamp: Date.now(),
    });
    onChange(newValue);
  };

  return (
    <div className="mb-4 font-sans">
      <label className="block text-sm font-medium mb-1">Flavor</label>
      <select
 codex/add-moodbook-fonts-to-components
        className="w-full p-2 bg-gray-800 text-white font-sans"

        className="w-full p-2 bg-charcoal text-goldLumen"
 main
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
