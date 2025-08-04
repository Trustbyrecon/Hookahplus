"use client";

import { useState } from 'react';
import SessionCard, { Session } from '../components/SessionCard';
import ViewModeToggle, { ViewMode } from '../components/ViewModeToggle';
import TrustLog from '../components/TrustLog';
import SessionAnalytics from '../components/SessionAnalytics';
import OwnerMetrics from '../components/OwnerMetrics';

const initialSessions: Session[] = [
  {
    id: 1,
    table: 'A1',
    flavors: ['Mint', 'Lemon'],
    startTime: Date.now() - 5 * 60000,
    refills: 0,
    notes: [],
  },
  {
    id: 2,
    table: 'B2',
    flavors: ['Grape'],
    startTime: Date.now() - 30 * 60000,
    refills: 0,
    notes: [],
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
    <main className="p-4 bg-charcoal min-h-screen text-goldLumen">
      <h1 className="text-2xl font-bold mb-4 text-ember">Flavor Flow Dashboard</h1>
      <ViewModeToggle mode={mode} onChange={setMode} />
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
      {mode === 'manager' && <SessionAnalytics sessions={sessions} />}
      {mode === 'owner' && <OwnerMetrics sessions={sessions} />}
      <TrustLog sessions={sessions} />
    </main>
  );
}
