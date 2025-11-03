import React from 'react';

interface Flavor {
  name: string;
  sales: number;
  loyalty: number;
  burnout: number;
}

interface Props {
  flavors: Flavor[];
}

export default function FlavorLeaderboard({ flavors }: Props) {
  const top = [...flavors].sort((a, b) => b.sales - a.sales).slice(0, 20);
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {top.map((flavor, idx) => (
        <li
          key={flavor.name}
          className="border border-mystic p-4 rounded bg-charcoal text-goldLumen"
        >
          <div className="font-display font-bold">
            {idx + 1}. {flavor.name}
          </div>
          <div className="text-sm text-goldLumen/80">Sales: {flavor.sales}</div>
          <div className="mt-1 text-sm">
            {flavor.loyalty > 8 && <span className="mr-2">🔥 High Loyalty</span>}
            {flavor.burnout < 4 && <span>🧠 Low Burnout</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
