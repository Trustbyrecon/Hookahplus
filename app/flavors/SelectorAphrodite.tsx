'use client';

import { useEffect, useState } from 'react';

interface Flavor {
  name: string;
  notes: string;
}

interface Props {
  flavors: Flavor[];
}

export default function SelectorAphrodite({ flavors }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem('flavor-metrics');
    if (stored) {
      setMetrics(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('flavor-metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    if (selected.length > 0) {
      alert('Session memory secured.');
    }
  }, [selected]);

  const toggleFlavor = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
    setMetrics((prev) => ({
      ...prev,
      [name]: (prev[name] || 0) + 1,
    }));
  };


  return (
    <div className="mt-4">
      <ul className="space-y-2">
        {flavors.map((flavor) => (
          <li key={flavor.name}>
            <button
              onClick={() => toggleFlavor(flavor.name)}
              className={`px-4 py-2 border rounded ${
                selected.includes(flavor.name)
                  ? 'bg-cyan-600 text-white'
                  : 'bg-zinc-800 text-zinc-200'
              }`}
            >
              {flavor.name}
            </button>
            <span className="ml-2 text-sm text-zinc-400">{flavor.notes}</span>
          </li>
        ))}
      </ul>

      {selected.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-mystic">Your loyalty flavor has been saved.</p>
        </div>
      )}
    </div>
  );
}
