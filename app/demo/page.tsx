// app/demo/page.tsx

import Link from 'next/link';
import WhisperButton from './WhisperButton';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-800 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">
          🎬 Demo Preview Portal
        </h1>
        <p className="mt-4 text-lg text-zinc-300">
          Explore what Hookah+ can unlock in your lounge. This preview simulates real-time session flow, flavor memory, and loyalty intelligence.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-6 shadow hover:shadow-xl transition">
            <h2 className="text-xl font-semibold">🕹️ Live Session Simulation</h2>
            <p className="mt-2 text-zinc-400">Preview how customers engage, order, and unlock flavor points.</p>
            <Link href="/live" className="mt-4 inline-block text-cyan-400 hover:underline">
              Launch Live Session →
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-6 shadow hover:shadow-xl transition">
            <h2 className="text-xl font-semibold">🌬️ Flavor Mix Journey</h2>
            <p className="mt-2 text-zinc-400">Explore dynamic flavor combinations and their loyalty effects.</p>
            <Link href="/flavors" className="mt-4 inline-block text-cyan-400 hover:underline">
              Try Flavor Flow →
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-6 shadow hover:shadow-xl transition">
            <h2 className="text-xl font-semibold">📈 Loyalty Dashboard Preview</h2>
            <p className="mt-2 text-zinc-400">View how Hookah+ tracks, scores, and rewards session behavior.</p>
            <Link href="/loyalty" className="mt-4 inline-block text-cyan-400 hover:underline">
              View Loyalty Portal →
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-6 shadow hover:shadow-xl transition">
            <h2 className="text-xl font-semibold">🧠 Alie Voice Reflex</h2>
            <p className="mt-2 text-zinc-400">Experience a whisper from Alie guiding session flow.</p>
            <WhisperButton />
          </div>
        </div>

        <div className="mt-12 text-center text-zinc-400 text-sm">
          ⌛ Demo Layer: Reflex Preview Mode | v1.0 | EP Score: 8.7 → awaiting session lock
        </div>
      </div>
    </main>
  );
}
