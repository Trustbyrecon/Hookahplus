import { useEffect, useState } from 'react';

interface ReflexEvent {
  type: 'system' | 'whisper' | 'replay';
  trigger?: string;
  message: string;
  timestamp: string;
}

// Poll the ReflexLog and render events as cards.
export default function ReflexEventToCard() {
  const [events, setEvents] = useState<ReflexEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/reflex-log');
        const data: ReflexEvent[] = await res.json();
        setEvents(data.slice(-15));
      } catch (e) {
        console.error('Failed to load Reflex events', e);
      }
    };
    fetchEvents();
    const id = setInterval(fetchEvents, 5000);
    return () => clearInterval(id);
  }, []);

  const colorMap: Record<ReflexEvent['type'], string> = {
    system: 'reflex-system',
    whisper: 'reflex-whisper',
    replay: 'reflex-replay',
  };
  const iconMap: Record<ReflexEvent['type'], string> = {
    system: '🔥',
    whisper: '💬',
    replay: '🌀',
  };

  return (
    <div className="reflex-feed">
      {events.map((ev, idx) => (
        <div key={idx} className={`reflex-card ${colorMap[ev.type]}`}>
          <span className="reflex-icon">{iconMap[ev.type]}</span>
          <div className="reflex-content">
            <div className="reflex-message">{ev.message}</div>
            <div className="reflex-meta">
              {ev.trigger && <span className="reflex-trigger">{ev.trigger}</span>}
              <span className="reflex-time">
                {new Date(ev.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
