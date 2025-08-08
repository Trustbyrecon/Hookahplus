"use client";

import { useEffect, useState } from 'react';
import { UnifrakturCook, Raleway } from 'next/font/google';

const unifraktur = UnifrakturCook({ weight: '700', subsets: ['latin'] });
const raleway = Raleway({ weight: ['300', '600'], subsets: ['latin'] });

export default function LivePage() {
  const [status, setStatus] = useState('disconnected');

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

  const playIntro = () => alert("Playing Alie’s Intro...");
  const elevateLoyalty = () => alert('Initiating Loyalty Elevation Path...');

  return (
    <main
      className={`p-8 bg-charcoal text-goldLumen ${raleway.className}`}
    >
      <h1
        className={`${unifraktur.className} text-3xl mb-2 text-ember`}
      >
        Live Session
      </h1>
      <div className="text-lg text-ember/80 mb-4">
        Status: <span id="status">{status}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={playIntro}
          className="px-4 py-3 rounded-lg bg-mystic text-charcoal hover:bg-deepMoss transition"
        >
          🔊 Play Alie’s Intro
        </button>
        <button
          onClick={elevateLoyalty}
          className="px-4 py-3 rounded-lg bg-deepMoss text-charcoal hover:bg-mystic transition"
        >
          ✨ Ready to elevate loyalty?
        </button>
      </div>
      <div className="text-lg text-deepMoss mt-6">
        Trust: <strong>7.9</strong>
      </div>
      <div className="mt-8 p-6 rounded-lg border border-goldLumen/20 bg-charcoal">
        <p className="italic text-mystic">
          "Sometimes, all it takes is a spark. Let your service whisper the difference."
        </p>
      </div>
    </main>
  );
}
