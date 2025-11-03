'use client';
import { useState } from 'react';

export default function StaffNotesPage(){
  const [pin, setPin] = useState('');
  const [ok, setOk] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [checkoutSessionId, setCheckoutSessionId] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string>('');

  const requiredPin = process.env.NEXT_PUBLIC_STAFF_DEMO_PIN || '735911';
  const verify = () => setOk(pin === requiredPin);

  const submit = async () => {
    setStatus('Saving…');
    try{
      const res = await fetch('/.netlify/functions/sessionNotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          checkoutSessionId: checkoutSessionId || undefined,
          notes
        })
      });
      const data = await res.json();
      if (res.ok) setStatus('Saved ✓');
      else setStatus('Error: ' + (data.error || 'unknown'));
    } catch (e:any){
      setStatus('Error: ' + e.message);
    }
  };

  return (
    <main style={{maxWidth:760,margin:'48px auto',padding:'0 16px',display:'grid',gap:16}}>
      <h1>Staff Notes (Private)</h1>
      {!ok ? (
        <section style={{display:'grid',gap:8}}>
          <label htmlFor="pin">Enter Staff PIN</label>
          <input id="pin" type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN" style={{padding:8,borderRadius:8}} />
          <button onClick={verify} style={{padding:10,borderRadius:8}}>Unlock</button>
          <small>Set <code>NEXT_PUBLIC_STAFF_DEMO_PIN</code> in Netlify env (default 735911).</small>
        </section>
      ) : (
        <section style={{display:'grid',gap:12}}>
          <label htmlFor="sid">Hookah+ Session ID (hp_session_id)</label>
          <input id="sid" value={sessionId} onChange={e=>setSessionId(e.target.value)} placeholder="hp_..." style={{padding:8,borderRadius:8}} />

          <div style={{textAlign:'center',opacity:.6}}>— or —</div>

          <label htmlFor="csid">Checkout Session ID</label>
          <input id="csid" value={checkoutSessionId} onChange={e=>setCheckoutSessionId(e.target.value)} placeholder="cs_test_..." style={{padding:8,borderRadius:8}} />

          <label htmlFor="notes">Private Notes</label>
          <textarea id="notes" rows={6} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="VIP booth, heat preference, reminders…" style={{padding:8,borderRadius:8}} />

          <button onClick={submit} style={{padding:12,borderRadius:10}}>Save Notes</button>
          <div style={{opacity:.8}}>{status}</div>
        </section>
      )}
    </main>
  );
}