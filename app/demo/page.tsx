'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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
