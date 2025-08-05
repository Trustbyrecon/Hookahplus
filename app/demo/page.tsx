// app/demo/page.tsx

import Link from 'next/link';
import WhisperButton from './WhisperButton';
import {
  WhisperTrigger,
  TrustArcDisplay,
  ReflexPromptModal,
  MemoryPulseTracker,
} from '../../components/ReflexOverlay';

export default function DemoPage() {
  const features = [
    {
      title: '🕹️ Live Session Simulation',
      description: 'Preview how customers engage, order, and unlock flavor points.',
      href: '/live',
      cta: 'Launch Live Session →',
    },
    {
      title: '🌬️ Flavor Mix Journey',
      description: 'Explore dynamic flavor combinations and their loyalty effects.',
      href: '/flavors',
      cta: 'Try Flavor Flow →',
    },
    {
      title: '📈 Loyalty Dashboard Preview',
      description: 'View how Hookah+ tracks, scores, and rewards session behavior.',
      href: '/loyalty',
      cta: 'View Loyalty Portal →',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-charcoal via-deepMoss to-charcoal text-goldLumen px-6 py-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-extrabold tracking-tight text-center">🎬 Demo Preview Portal</h1>
        <div className="mt-2 h-1 w-32 bg-mystic mx-auto rounded-full animate-pulse" />
        <p className="mt-4 text-lg text-goldLumen/80 text-center">
          Explore what Hookah+ can unlock in your lounge. This preview simulates real-time session flow, flavor memory, and loyalty intelligence.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-mystic bg-charcoal p-6 shadow hover:shadow-xl transition">
              <h2 className="text-xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-goldLumen">{f.description}</p>
              <Link
                href={f.href}
                className="mt-4 inline-block text-ember transition-shadow hover:shadow-[0_0_8px_#E8D7B1]"
              >
                {f.cta}
              </Link>
            </div>
          ))}
          <div className="rounded-xl border border-mystic bg-charcoal p-6 shadow hover:shadow-xl transition">
            <h2 className="text-xl font-semibold">🧠 Alie Voice Reflex</h2>
            <p className="mt-2 text-goldLumen">Experience a whisper from Alie guiding session flow.</p>
            <WhisperButton />
          </div>
        </div>
        <div className="mt-8 space-y-4 text-center">
          <WhisperTrigger />
          <ReflexPromptModal />
        </div>
        <div className="mt-12 text-center text-mystic text-sm">
          ⌛ Demo Layer: Reflex Preview Mode | v1.0 | EP Score: 8.7 → awaiting session lock
        </div>
      </div>
      <TrustArcDisplay score={8.7} />
      <MemoryPulseTracker />
    </main>
  );
}

