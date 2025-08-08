'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function testCheckout() {
    try {
      setLoading(true); setMsg('');
      const res = await fetch('/.netlify/functions/createCheckout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `hp_${Date.now()}`,
          loungeId: 'demo-lounge-001',
          flavorMix: ['Mint','Blue Mist'],
          basePrice: 3000,
          addOns: [{ name: 'Premium Flavor', amount: 500 }],
          ref: 'HOMEPAGE-TEST'
        })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setMsg(data.error || 'Unknown error');
      }
    } catch (e:any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{maxWidth:880,margin:'64px auto',padding:'0 16px'}}>
      <h1>Hookah+</h1>
      <p>Session reimagined. Loyalty reinforced.</p>

      <button onClick={testCheckout} disabled={loading}
        style={{padding:'12px 16px',border:'1px solid #333',borderRadius:10}}>
        {loading ? 'Starting…' : 'Test Checkout'}
      </button>
      {msg && <div style={{marginTop:8,color:'tomato'}}>{msg}</div>}

      <ul style={{lineHeight:1.8, marginTop:16}}>
        <li><a href="/staff/notes">Staff Notes</a></li>
        <li><a href="/dashboard/notes">Notes Dashboard</a></li>
      </ul>
    </main>
  );
}