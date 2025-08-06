'use client';

import { useEffect, useState } from 'react';

export default function FlavorMemory() {
  const [flavors, setFlavors] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('flavor-memory');
    if (stored) {
      try {
        setFlavors(JSON.parse(stored));
        return;
      } catch {
        // ignore malformed memory
      }
    }
    setFlavors(['Mint Blast', 'Double Apple', 'Blueberry Mist']);
  }, []);

  return (
    <div>
      <h3 className="font-display text-xl text-goldLumen mb-2">Flavor Memory</h3>
      <ul className="space-y-1">
        {flavors.map((f) => (
          <li key={f} className="text-goldLumen/80 font-sans">
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
