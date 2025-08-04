import { useEffect, useState } from 'react';
import FlavorBadge from './FlavorBadge';

type ViewMode = 'staff' | 'manager' | 'owner';

export interface Session {
  id: number;
  table: string;
  flavors: string[];
  startTime: number; // ms timestamp
  refills: number;
  notes?: string[];
}

interface Props {
  session: Session;
  mode: ViewMode;
  onRefill: (id: number) => void;
  onAddNote: (id: number, note: string) => void;
  onBurnout: (id: number) => void;
}

// Moodbook classes are required; avoid overriding with default Tailwind colors.
function getStatus(elapsed: number) {
  if (elapsed >= 70) return { label: 'Burnt Out', tone: 'ring-ember' };
  if (elapsed >= 45) return { label: 'Shisha Low', tone: 'ring-mystic' };
  if (elapsed >= 25) return { label: 'Coal Low', tone: 'ring-charcoal' };
  return { label: 'Active', tone: 'ring-deepMoss' };
}

export default function SessionCard({ session, mode, onRefill, onAddNote, onBurnout }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const elapsedMin = (now - session.startTime) / 60000;
  const elapsedSec = Math.floor((now - session.startTime) / 1000) % 60;
  const status = getStatus(elapsedMin);

  useEffect(() => {
    if (status.label === 'Burnt Out') {
      onBurnout(session.id);
    }
  }, [status.label, onBurnout, session.id]);

  const price = session.flavors.length * 15 + session.refills * 5;

  return (
    <div
      className={`flex flex-col justify-between p-4 rounded-xl bg-charcoal/30 text-goldLumen font-sans ring-2 ${status.tone} shadow-lg mb-4 md:mb-0 transition-colors duration-300 hover:bg-charcoal/40`}
    >
      <h3 className="font-display font-bold text-lg mb-1">Table {session.table}</h3>
      <div className="mb-2">
        {session.flavors.map((f) => (
          <FlavorBadge key={f} flavor={f} />
        ))}
      </div>
      <div className="font-mono mb-2">
        Timer: {Math.floor(elapsedMin)}:{String(elapsedSec).padStart(2, '0')}
      </div>
      <div className="mb-2">Status: {status.label}</div>
      {mode === 'staff' && (
        <div className="space-x-2">
          <button
            onClick={() => onRefill(session.id)}
            className="bg-deepMoss/40 px-3 py-1 rounded disabled:opacity-50 hover:bg-deepMoss/60 transition-colors"
            disabled={status.label === 'Burnt Out'}
          >
            Refill
          </button>
          <button
            onClick={() => {
              const note = window.prompt('Session note');
              if (note) onAddNote(session.id, note);
            }}
            className="bg-deepMoss/40 px-3 py-1 rounded hover:bg-deepMoss/60 transition-colors"
          >
            Add Note
          </button>
        </div>
      )}
      {mode !== 'staff' && <div className="mb-1">Price: ${price.toFixed(2)}</div>}
      {mode === 'owner' && (
        <div className="text-xs">Loyalty Signal: {session.notes?.length || 0} notes</div>
      )}
    </div>
  );
}

