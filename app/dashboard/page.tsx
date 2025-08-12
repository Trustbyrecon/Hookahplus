"use client";

import { useEffect, useState } from 'react';
import SessionCard from '../../components/SessionCard';
import { Session } from '../../components/sessionTypes';
import ViewModeToggle, { ViewMode } from '../../components/ViewModeToggle';
import TrustLog from '../../components/TrustLog';
import SessionAnalytics from '../../components/SessionAnalytics';
import OwnerMetrics from '../../components/OwnerMetrics';
import LoyaltyWallet from '../../components/LoyaltyWallet';
import MoodBookOverlay from '../../components/MoodBookOverlay';
import {
  WhisperTrigger,
  TrustArcDisplay,
  ReflexPromptModal,
  MemoryPulseTracker,
} from '../../components/ReflexOverlay';
import WhisperOverlayEngine from '../../components/WhisperOverlayEngine';
import StaffJournalModal from '../../components/StaffJournalModal';
import WhisperToneSelector from '../../components/WhisperToneSelector';

export default function Dashboard() {
  const [mode, setMode] = useState<ViewMode>('staff');
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data));
  }, []);

  const updateSession = async (updated: Session) => {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    await fetch('/api/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: updated.id,
        refills: updated.refills,
        notes: updated.notes,
        start_time: new Date(updated.startTime).toISOString(),
        end_time: updated.endTime ? new Date(updated.endTime).toISOString() : null,
      }),
    });
  };

  const handleRefill = async (id: number) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    const updated = {
      ...session,
      startTime: Date.now(),
      refills: session.refills + 1,
      notes: [...(session.notes || []), 'refill'],
    };
    await updateSession(updated);
  };

  const handleAddNote = async (id: number) => {
    const note = prompt('Enter note');
    if (!note) return;
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    const updated = {
      ...session,
      notes: [...(session.notes || []), note],
    };
    await updateSession(updated);
  };

  const handleBurnout = async (id: number) => {
    const session = sessions.find((s) => s.id === id);
    if (!session || (session.notes || []).includes('burnout')) return;
    const updated = {
      ...session,
      notes: [...(session.notes || []), 'burnout'],
    };
    await updateSession(updated);
  };

  const handleEnd = async (id: number) => {
    const session = sessions.find((s) => s.id === id);
    if (!session || session.endTime) return;
    const updated = {
      ...session,
      endTime: Date.now(),
    };
    await updateSession(updated);
    console.log('Session ended, triggering next steps', id);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-charcoal via-deepMoss to-charcoal text-goldLumen font-sans p-6">
      <WhisperOverlayEngine />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-6 text-ember text-center">
          Flavor Flow Dashboard
        </h1>
        <ViewModeToggle mode={mode} onChange={setMode} />
        <div className="mt-4 mb-6 flex justify-center">
          <LoyaltyWallet />
        </div>
        <MoodBookOverlay />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-[70vh] overflow-y-auto pr-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              sessionId={String(session.id)}
              tableLabel={session.table}
              flavorMix={session.flavors.join(', ')}
              payment={{ base: session.flavors.length * 15, status: 'paid' }}
              metrics={{ edr: 95, shr: 90 }}
              timers={{
                startedAt: new Date(session.startTime).toISOString(),
                lastRefillAt: new Date(session.startTime).toISOString(),
              }}
              actions={{
                onRefill: () => handleRefill(session.id),
                onAdd: () => handleAddNote(session.id),
                onRepair: () => handleBurnout(session.id),
                onClose: () => handleEnd(session.id),
              }}
              role={mode}
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
          <WhisperToneSelector />
        </div>
        <div className="mt-4">
          <StaffJournalModal />
        </div>
        <div className="mt-8 space-y-4">
          <WhisperTrigger />
          <ReflexPromptModal />
        </div>
      </div>
      <TrustArcDisplay score={9.2} />
      <MemoryPulseTracker />
    </main>
  );
}
