'use client';

import Heatmap from './Heatmap';
import FlavorMemory from './FlavorMemory';
import PublicTrustArcs from './PublicTrustArcs';
import SessionReplayTimeline from './SessionReplayTimeline';

export default function SessionReplaySection() {
  return (
    <section className="mt-20 max-w-5xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-goldLumen text-center">
        Replay this Session
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="bg-charcoal/60 p-4 rounded">
          <Heatmap />
          <SessionReplayTimeline />
        </div>
        <div className="bg-charcoal/60 p-4 rounded">
          <FlavorMemory />
          <PublicTrustArcs />
        </div>
      </div>
    </section>
  );
}
