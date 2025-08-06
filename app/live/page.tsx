"use client";

import { useEffect, useState } from 'react';
import {
  WhisperTrigger,
  TrustArcDisplay,
  ReflexPromptModal,
  MemoryPulseTracker,
} from '../../components/ReflexOverlay';

interface LiveMessage {
  message: string;
  timestamp: string;
}

export default function LivePage() {
  const [status, setStatus] = useState('connecting');
  const [messages, setMessages] = useState<LiveMessage[]>([]);

  useEffect(() => {
    const url =
      process.env.NEXT_PUBLIC_LIVE_SOCKET_URL || 'ws://localhost:3000/api/live';
    const ws = new WebSocket(url);

    ws.onopen = () => setStatus('connected');
    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          {
            message: data.message ?? event.data,
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { message: event.data, timestamp: new Date().toISOString() },
        ]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-display font-bold">Live Session</h1>
      <p className="mt-2 font-sans">Status: {status}</p>
      <ul className="mt-4 space-y-2">
        {messages.map((msg, idx) => (
          <li
            key={idx}
            className="text-sm text-goldLumen/80 border-b border-goldLumen/20 pb-2"
          >
            <span className="font-mono">
              {new Date(msg.timestamp).toLocaleTimeString()}:
            </span>{' '}
            {msg.message}
          </li>
        ))}
      </ul>
      <div className="mt-8 space-y-4">
        <WhisperTrigger />
        <ReflexPromptModal />
      </div>
      <TrustArcDisplay score={7.9} />
      <MemoryPulseTracker />
    </main>
  );
}
