import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function FlavorSelector({ value, onChange }: Props) {
  const flavors = ['Mint', 'Double Apple', 'Grape'];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Flavor</label>
      <select
        className="w-full p-2 bg-gray-800 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
