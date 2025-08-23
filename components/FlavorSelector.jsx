'use client';
import React from 'react';
import { useSession } from './SessionContext';
import { useReflexAgent } from './ReflexAgentContext';

export default function FlavorSelector() {
  const { session, setSession } = useSession();
  const { logFlavorChange } = useReflexAgent();

  const flavors = ['Mint', 'Watermelon', 'Blueberry', 'Peach', 'Double Apple'];

  const handleChange = (e) => {
    const newFlavor = e.target.value;
    setSession(prev => ({ ...prev, flavor: newFlavor }));
    logFlavorChange(newFlavor);
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-semibold">Flavor:</label>
      <select
        value={session.flavor}
        onChange={handleChange}
        className="p-2 bg-gray-800 text-white rounded w-full"
      >
        {flavors.map((flavor) => (
          <option key={flavor} value={flavor}>
            {flavor}
          </option>
        ))}
      </select>
    </div>
  );
}
