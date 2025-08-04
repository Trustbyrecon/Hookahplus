import React from 'react';
import { Session } from './SessionCard';

export default function SessionAnalytics({ sessions }: { sessions: Session[] }) {
  const now = Date.now();
  const flavorDurations: Record<string, number[]> = {};
  sessions.forEach((s) => {
    const duration = (now - s.startTime) / 60000;
    s.flavors.forEach((f) => {
      if (!flavorDurations[f]) flavorDurations[f] = [];
      flavorDurations[f].push(duration);
    });
  });
  const avgFlavorDurations = Object.entries(flavorDurations).map(([flavor, list]) => ({
    flavor,
    avg: list.reduce((a, b) => a + b, 0) / list.length,
  }));
  const avgRefills =
    sessions.reduce((sum, s) => sum + (s.refills || 0), 0) / sessions.length;
  return (
 codex/add-moodbook-fonts-to-components
    <div className="p-4 bg-gray-900 rounded text-white mb-4 font-sans">
      <h2 className="font-display font-bold mb-2">Manager Analytics</h2>

    <div className="p-4 bg-charcoal rounded text-goldLumen mb-4">
      <h2 className="font-bold mb-2">Manager Analytics</h2>
 main
      <div className="text-sm mb-2">
        Avg Refills/Session: {avgRefills.toFixed(1)}
      </div>
      {avgFlavorDurations.map(({ flavor, avg }) => (
        <div key={flavor} className="text-sm">
          {flavor}: {avg.toFixed(1)} mins avg
        </div>
      ))}
    </div>
  );
}
