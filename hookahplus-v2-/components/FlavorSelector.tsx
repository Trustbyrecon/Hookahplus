"use client";

import { useState } from "react";

interface FlavorSelectorProps {
  session: any;
  setSession: (prev: any) => void;
  onFlavorChange?: (flavor: string) => void;
}

const FlavorSelector = ({ session, setSession, onFlavorChange }: FlavorSelectorProps) => {
  const [selectedFlavor, setSelectedFlavor] = useState(session?.flavor || '');
  const flavors = ['Mint', 'Watermelon', 'Blueberry', 'Peach', 'Double Apple'];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFlavor = e.target.value;
    setSession(prev => ({ ...prev, flavor: newFlavor }));
    logFlavorChange(newFlavor);
  };

  const logFlavorChange = (flavor: string) => {
    console.log(`Flavor changed to: ${flavor}`);
    if (onFlavorChange) {
      onFlavorChange(flavor);
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="flavor" className="block text-sm font-medium text-gray-700 mb-2">
        Select Hookah Flavor
      </label>
      <select
        id="flavor"
        value={selectedFlavor}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Choose a flavor...</option>
        {flavors.map(flavor => (
          <option key={flavor} value={flavor}>
            {flavor}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FlavorSelector;