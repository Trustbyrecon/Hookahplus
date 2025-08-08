// at top of app/demo/page.tsx
import type { Metadata } from "next";

export async function generateMetadata(
  { searchParams }: { searchParams: { [k: string]: string | string[] | undefined } }
): Promise<Metadata> {
  const ref = typeof searchParams.ref === "string" ? searchParams.ref : "";
  const mix = typeof searchParams.mix === "string" ? searchParams.mix : "";
  const qs = new URLSearchParams();
  if (ref) qs.set("ref", ref);
  if (mix) qs.set("mix", mix);

  const ogUrl = qs.toString()
    ? `/demo/opengraph-image?${qs.toString()}`
    : `/demo/opengraph-image`;

  return {
    title: "Hookah+ Demo — Live Session",
    openGraph: { images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter:   { images: [ogUrl], card: "summary_large_image" }
  };
}

feat/stripe-live
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SecurePaymentNotice from '../../components/SecurePaymentNotice';

async function startHookahSession(payload:any) {
  const res = await fetch('/api/createCheckout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const { url } = await res.json();
  window.location.href = url;
}

async function saveSessionNotes({ sessionId, loungeId, notes }: { sessionId:string; loungeId:string; notes:string }) {
  await fetch('/api/sessionNotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, loungeId, notes }),
  });
}

export default function Demo() {
  const sp = useSearchParams();
  const [sessionId, setSessionId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [pin, setPin] = useState('');
  const [pinOk, setPinOk] = useState(false);

  const wantsStaff = sp.get('staff') === '1';

  useEffect(() => {
    // @ts-ignore
    setSessionId(crypto?.randomUUID?.() ?? `${Date.now()}`);
  }, []);

  const loungeId = useMemo(() => 'demo-lounge-001', []);

  const handleStart = async () => {
    await startHookahSession({
      sessionId,
      loungeId,
      flavorMix: ['Mint', 'Blue Mist'],
      basePrice: 3000,
      addOns: [{ name: 'Premium Flavor', amount: 500 }],
      notes, // saved privately in metadata + our notes endpoint
    });
  };

  const handleSaveNotes = async () => {
    if (!notes.trim()) return;
    await saveSessionNotes({ sessionId, loungeId, notes });
    alert('SessionNotes saved (demo).');
  };

  const checkPin = () => {
    const envPin = process.env.NEXT_PUBLIC_STAFF_DEMO_PIN || '735911';
    setPinOk(pin === envPin);
  };

  return (
    <main style={{maxWidth:760,margin:'48px auto',padding:'0 16px',display:'grid',gap:24}}>
      <section style={{border:'1px solid #333',padding:16,borderRadius:12}}>
        <h2>Hookah+ Demo Checkout</h2>
        <p><b>Session:</b> <code>{sessionId}</code></p>
        <button onClick={handleStart} style={{padding:12,borderRadius:8,marginTop:8}}>
          Start Session (Stripe)
        </button>
        <SecurePaymentNotice />
      </section>

      {wantsStaff && (
        <section style={{border:'1px dashed #666',padding:16,borderRadius:12}}>
          <h3>Staff Panel (Demo)</h3>

          {!pinOk ? (
            <div style={{display:'grid',gap:8}}>
              <label>Enter Staff PIN</label>
              <input
                value={pin}
                onChange={(e)=>setPin(e.target.value)}
                placeholder="PIN"
                style={{padding:8,borderRadius:8}}
              />
              <button onClick={checkPin} style={{padding:8,borderRadius:8}}>Unlock</button>
              <small>Hint: set <code>NEXT_PUBLIC_STAFF_DEMO_PIN</code> in env; default is 735911.</small>
            </div>
          ) : (
            <div style={{display:'grid',gap:8}}>
              <label>Session Notes (private)</label>
              <textarea
                value={notes}
                onChange={(e)=>setNotes(e.target.value)}
                placeholder="VIP booth, heat preference, staff reminders…"
                rows={4}
                style={{padding:8,borderRadius:8}}
              />
              <button onClick={handleSaveNotes} style={{padding:8,borderRadius:8}}>Save Notes (private)</button>
              <small>Notes go to <code>/api/sessionNotes</code> and are never shown to customers.</small>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

// app/demo/page.tsx

import Link from 'next/link';
import WhisperButton from './WhisperButton';
import {
  WhisperTrigger,
  TrustArcDisplay,
  ReflexPromptModal,
  MemoryPulseTracker,
} from '../../components/ReflexOverlay';
import SessionReplayTimeline from '../../components/SessionReplayTimeline';

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
        <SessionReplayTimeline />
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

 main
