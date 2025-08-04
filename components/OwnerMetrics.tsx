import React from 'react';
import { Session } from './SessionCard';

export default function OwnerMetrics({ sessions }: { sessions: Session[] }) {
  const flavorRevenue: Record<string, number> = {};
  let burnouts = 0;
  let refills = 0;
  sessions.forEach((s) => {
    const price = s.flavors.length * 15 + s.refills * 5;
    s.flavors.forEach((f) => {
      flavorRevenue[f] = (flavorRevenue[f] || 0) + price / s.flavors.length;
    });
    burnouts += s.notes?.filter((n) => n === 'burnout').length || 0;
    refills += s.refills;
  });
  const totalRevenue = Object.values(flavorRevenue).reduce((a, b) => a + b, 0);
  const ratio = refills > 0 ? (burnouts / refills).toFixed(2) : '0';
  return (
 codex/update-component-styles-to-moodbook-palette
    <div className="p-4 bg-deepMoss rounded text-goldLumen mb-4">

 codex/add-moodbook-fonts-to-components
    <div className="p-4 bg-gray-900 rounded text-white mb-4 font-sans">
      <h2 className="font-display font-bold mb-2">Owner Metrics</h2>

    <div className="p-4 bg-charcoal rounded text-goldLumen mb-4">
 main
      <h2 className="font-bold mb-2">Owner Metrics</h2>
 main
      <div className="text-sm mb-2">Total Revenue: ${totalRevenue.toFixed(2)}</div>
      {Object.entries(flavorRevenue).map(([flavor, revenue]) => (
        <div key={flavor} className="text-sm">
          {flavor}: ${revenue.toFixed(2)}
        </div>
      ))}
      <div className="text-sm mt-2">Burnout/Refill Ratio: {ratio}</div>
    </div>
  );
}
