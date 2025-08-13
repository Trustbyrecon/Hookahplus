from pathlib import Path
import textwrap

def run():
    landing_content = """
"use client";

import { useEffect, useState } from 'react';
import { reflex } from '../lib/reflex';

const topFlavors = ['Mint', 'Blue Mist', 'Peach'];

export default function Home() {
  const [showStarter, setShowStarter] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [showDrift, setShowDrift] = useState(false);
  const [heat, setHeat] = useState(0);

  useEffect(() => {
    reflex.logEvent?.('landing_patch_view');
    const visited = localStorage.getItem('hp_visited');
    if (visited) {
      setShowLoyalty(true);
    } else {
      setShowStarter(true);
      localStorage.setItem('hp_visited', '1');
    }
    const timer = setTimeout(() => {
      if (visited) setShowDrift(true);
    }, 15000);
    setHeat(Math.floor(Math.random() * 5));
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="container py-16">
      <div className="flex items-center gap-2">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Hookah+ — the lounge operator's edge
        </h1>
        <span className="ml-2 rounded bg-green-600 text-xs px-2 py-1">
          Verified Lounge
        </span>
        <span
          className={`ml-2 rounded text-xs px-2 py-1 ${heat > 3 ? 'bg-red-600' : 'bg-orange-500'}`}
        >
          Heat {heat}
        </span>
      </div>
      <p className="mt-4 text-white/80 max-w-2xl">
        Manage sessions, payments, and flavor flow with live telemetry. Built for speed. Designed for staff.
      </p>
      <div className="mt-4 flex gap-2">
        {topFlavors.map((flavor, i) => (
          <span key={flavor} className="bg-white/10 px-2 py-1 rounded text-sm">
            {i + 1}. {flavor}
          </span>
        ))}
      </div>
      <div className="mt-8 flex gap-3">
        <a href="/preorder" className="btn bg-accent text-black font-semibold">Pre-order</a>
        <a href="/pricing" className="btn border border-white/20">See pricing</a>
      </div>

      {showStarter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded shadow-xl">
            <p className="mb-4 font-semibold">Reserve Your Hookah</p>
            <button onClick={() => setShowStarter(false)} className="btn bg-accent text-black font-semibold">Start</button>
          </div>
        </div>
      )}

      {showLoyalty && !showStarter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded shadow-xl">
            <p className="mb-4 font-semibold">Welcome back! Ready for another session?</p>
            <button onClick={() => setShowLoyalty(false)} className="btn border border-black/20">Continue</button>
          </div>
        </div>
      )}

      {showDrift && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded shadow-xl">
            <p className="mb-4 font-semibold">Need help picking a flavor?</p>
            <a href="/flavors" className="btn bg-accent text-black font-semibold">Browse flavors</a>
          </div>
        </div>
      )}
    </section>
  );
}
"""

    target_path = Path("app/page.tsx")
    target_path.write_text(textwrap.dedent(landing_content).strip())
    print("✅ Landing patch deployed to app/page.tsx")
