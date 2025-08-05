"use client";

import { useState } from 'react';
import SessionCard, { Session } from '../../components/SessionCard';
import ViewModeToggle, { ViewMode } from '../../components/ViewModeToggle';
import TrustLog from '../../components/TrustLog';
import SessionAnalytics from '../../components/SessionAnalytics';
import OwnerMetrics from '../../components/OwnerMetrics';
import WhisperTrigger from '../../components/WhisperTrigger';

const initialSessions: Session[] = [
  {
    id: 1,
    table: 'A1',
    flavors: ['Mint', 'Lemon'],
    startTime: Date.now() - 50 * 60000,
    refills: 1,
    notes: ['likes iced water', 'extra lemon'],
  },
  {
    id: 2,
    table: 'B2',
    flavors: ['Grape'],
    startTime: Date.now() - 16 * 60000,
    refills: 0,
    notes: ['no mint requests', 'prefers corner booth', 'check id'],
  },
  {
    id: 3,
    table: 'C3',
    flavors: ['Watermelon'],
    startTime: Date.now() - 10 * 60000,
    refills: 0,
    notes: ['first time visitor'],
  },
  {
    id: 4,
    table: 'E5',
    flavors: ['Peach', 'Grape', 'Apple'],
    startTime: Date.now() - 70 * 60000,
    refills: 2,
    notes: ['watch heat', 'last bowl burnt'],
  },
];

export default function Dashboard() {
  const [mode, setMode] = useState<ViewMode>('staff');
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  const handleRefill = (id: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              startTime: Date.now(),
              refills: s.refills + 1,
              notes: [...(s.notes || []), 'refill'],
            }
          : s
      )
    );
  };

  const handleAddNote = (id: number, note: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, notes: [...(s.notes || []), note] } : s
      )
    );
  };

  const handleBurnout = (id: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id && !(s.notes || []).includes('burnout')
          ? { ...s, notes: [...(s.notes || []), 'burnout'] }
          : s
      )
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-charcoal via-deepMoss to-charcoal text-goldLumen font-sans p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-6 text-ember text-center">
          Flavor Flow Dashboard
        </h1>
        <ViewModeToggle mode={mode} onChange={setMode} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              mode={mode}
              onRefill={handleRefill}
              onAddNote={handleAddNote}
              onBurnout={handleBurnout}
            />
          ))}
        </div>
        {mode === 'manager' && (
          <div className="mt-8">
            <SessionAnalytics sessions={sessions} />
          </div>
        )}
        {mode === 'owner' && (
          <div className="mt-8">
            <OwnerMetrics sessions={sessions} />
          </div>
        )}
        <div className="mt-8">
          <TrustLog sessions={sessions} />
        </div>
        <div className="mt-8">
          <WhisperTrigger />
        </div>
      </div>
    </main>
  );
}
