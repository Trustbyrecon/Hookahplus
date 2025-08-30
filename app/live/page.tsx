"use client";

import { useEffect, useRef, useState } from 'react';

// Fallback font classes when Google Fonts are unavailable
const unifraktur = { className: 'font-serif font-bold' };
const raleway = { className: 'font-sans' };

interface LiveEvent {
  delta: number;
  trigger: string;
  sessionId: string;
  staffId: string;
  zone: string;
  flavor: string;
  latency: number;
  timestamp: number;
}

export default function LivePage() {
  const [status, setStatus] = useState('disconnected');
  const [trust, setTrust] = useState(7.9);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const eventQueue = useRef<LiveEvent[]>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);

  const SESSION_API = '/api/live/trust';
  const ANALYTICS_API = '/api/live/events';
  const STAFF_ID = 'staff-demo'; // replace with real staff id
  const SESSION_ID = 'session-demo'; // replace with real session id
  const ZONE_ID = 'main'; // replace with real zone
  const LS_KEY = 'hp.trust.score';


  useEffect(() => {
    const url =
      process.env.NEXT_PUBLIC_LIVE_SOCKET_URL || 'ws://localhost:3000/api/live';
    const ws = new WebSocket(url);

    ws.onopen = () => setStatus('connected');
    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    loadTrust();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setTrustDisplay(val: number) {
    setTrust(Number(val.toFixed(1)));
    localStorage.setItem(LS_KEY, val.toString());
  }

  async function loadTrust() {
    try {
      const res = await fetch(
        `${SESSION_API}?sessionId=${SESSION_ID}&staffId=${STAFF_ID}`,
        { credentials: 'include' }
      );
      if (
        res.ok &&
        res.headers.get('content-type')?.includes('application/json')
      ) {
        const data = await res.json();
        if (typeof data.trust === 'number') {
          setTrustDisplay(data.trust);
          return;
        }
      }
    } catch (e) {
      // ignore and fall back
    }
    const cached = parseFloat(localStorage.getItem(LS_KEY) || '7.9');
    setTrustDisplay(cached);
  }

  function queueEvent(event: LiveEvent) {
    const optimistic = trust + event.delta;
    setTrustDisplay(optimistic);
    setEvents((prev) => [...prev, event]);
    eventQueue.current.push(event);
    if (!flushTimer.current) {
      flushTimer.current = setTimeout(flushEvents, 1000);
    }
  }

  async function flushEvents() {
    const batch = eventQueue.current;
    eventQueue.current = [];
    flushTimer.current = null;
    try {
      const res = await fetch(SESSION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          staffId: STAFF_ID,
          sessionId: SESSION_ID,
          events: batch,
        }),
      });
      if (!res.ok) throw new Error('Bad status ' + res.status);
      const data = await res.json();
      if (typeof data.trust === 'number') {
        setTrustDisplay(data.trust);
      }
    } catch (err) {
      console.warn('Persist trust failed:', err);
    }
    try {
      await fetch(ANALYTICS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          staffId: STAFF_ID,
          sessionId: SESSION_ID,
          events: batch,
        }),
      });
    } catch (err) {
      console.warn('Persist analytics failed:', err);
    }
  }

  function pulseButton(btn: HTMLButtonElement) {
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Alie is speaking…';
    btn.style.opacity = '0.85';
    setTimeout(() => {
      btn.textContent = original ?? '';
      btn.disabled = false;
      btn.style.opacity = '1';
    }, 1800);
  }

  function playAudio(trigger: string, btn: HTMLButtonElement) {
    const audioMap: Record<string, string> = {
      intro: '/assets/audio/alie/intro.mp3',
      loyalty: '/assets/audio/alie/loyalty.mp3',
      custom: '/assets/audio/alie/custom.mp3',
    };
    const flavorMap: Record<string, string> = {
      intro: 'house-blend',
      loyalty: 'citrus-mint',
      custom: 'custom',
    };
    const src = audioMap[trigger] || audioMap.custom;
    const audio = new Audio(src);
    audio.volume = 0.85;
    const start = performance.now();
    audio.addEventListener('playing', () => {
      const latency = performance.now() - start;
      queueEvent({
        delta: 0.3,
        trigger,
        sessionId: SESSION_ID,
        staffId: STAFF_ID,
        zone: ZONE_ID,
        flavor: flavorMap[trigger] || 'custom',
        latency,
        timestamp: Date.now(),
      });
    });
    audio.addEventListener('error', () =>
      console.warn('Alie audio missing:', src)
    );
    audio.play().catch(() =>
      console.warn('Autoplay blocked. User interaction required.')
    );
    pulseButton(btn);
  }

  return (
    <main
      className="p-8 bg-charcoal text-goldLumen font-raleway"
    >
      <h1
        className="font-unifraktur text-3xl mb-2 text-ember"
      >
        Live Session
      </h1>
      <div className="text-lg text-ember/80 mb-4">
        Status: <span id="status">{status}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={(e) => playAudio('intro', e.currentTarget)}
          className="px-4 py-3 rounded-lg bg-mystic text-charcoal hover:bg-deepMoss transition"
        >
          🔊 Play Alie’s Intro
        </button>
        <button
          onClick={(e) => playAudio('loyalty', e.currentTarget)}
          className="px-4 py-3 rounded-lg bg-deepMoss text-charcoal hover:bg-mystic transition"
        >
          ✨ Ready to elevate loyalty?
        </button>
      </div>
      <div className="text-lg text-deepMoss mt-6">
        Trust: <strong>{trust.toFixed(1)}</strong>
      </div>
      {events.length > 0 && (
        <ul className="mt-6 space-y-2">
          {events.map((ev, idx) => (
            <li
              key={idx}
              className="border border-goldLumen/20 rounded bg-charcoal"
            >
              <button
                className="w-full flex justify-between items-center p-3 text-left text-mystic"
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }))
                }
              >
                <span>
                  {ev.trigger} @ {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
                <span>{expanded[idx] ? '▲' : '▼'}</span>
              </button>
              {expanded[idx] && (
                <div className="p-3 text-sm space-y-1">
                  <div>Session: {ev.sessionId}</div>
                  <div>Staff: {ev.staffId}</div>
                  <div>Zone: {ev.zone}</div>
                  <div>Flavor: {ev.flavor}</div>
                  <div>Latency: {Math.round(ev.latency)}ms</div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 p-6 rounded-lg border border-goldLumen/20 bg-charcoal">
        <p className="italic text-mystic">
          "Sometimes, all it takes is a spark. Let your service whisper the difference."
        </p>
      </div>
    </main>
  );
}
