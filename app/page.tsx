'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

function getCookie(name: string) {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : '';
}

async function startHookahSession(payload:any) {
  const res = await fetch('/api/createCheckout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const { url } = await res.json();
  window.location.href = url;
}

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [ref, setRef] = useState('');
  const [autofire, setAutofire] = useState(false);

  useEffect(() => {
    // @ts-ignore
    setSessionId(crypto?.randomUUID?.() ?? `${Date.now()}`);
    const sp = new URLSearchParams(window.location.search);
    setAutofire(sp.get('autofire') === '1');
    const urlRef = sp.get('ref') || '';
    const cookieRef = getCookie('hp_ref');
    setRef(urlRef || cookieRef || '');
  }, []);

  const loungeId = useMemo(() => 'demo-lounge-001', []);

  const handleStart = async () => {
    await startHookahSession({
      sessionId,
      loungeId,
      flavorMix: ['Mint', 'Blue Mist'],
      basePrice: 3000,
      addOns: [{ name: 'Premium Flavor', amount: 500 }],
      notes: '',
      ref,
    });
  };

  // Auto-fire from homepage when explicitly requested
  useEffect(() => {
    if (sessionId && autofire) handleStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, autofire]);

  return (
    <main style={{
      maxWidth: 880, margin: '72px auto', padding: '0 16px',
      display: 'grid', gap: 20
    }}>
      <header style={{display:'grid',gap:8}}>
        <h1 style={{fontSize:36,margin:0}}>Hookah+</h1>
        <p style={{opacity:0.8,margin:0}}>
          Session-ready POS for lounges — Stripe checkout, flavor-mix metadata, referrals, and partner onboarding.
        </p>
      </header>

      <section style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <button onClick={handleStart}
          style={{padding:'10px 14px',border:'1px solid #333',borderRadius:10,cursor:'pointer'}}>
          Start Session (Stripe)
        </button>
        <Link href="/demo" style={{padding:'10px 14px',border:'1px solid #333',borderRadius:10,textDecoration:'none'}}>Run Demo</Link>
        <Link href="/partner" style={{padding:'10px 14px',border:'1px solid #333',borderRadius:10,textDecoration:'none'}}>Partner Onboarding</Link>
        <Link href="/referral" style={{padding:'10px 14px',border:'1px solid #333',borderRadius:10,textDecoration:'none'}}>Referral Program</Link>
      </section>

      <small style={{opacity:0.7}}>
        Tip: add <code>?autofire=1</code> to <code>/</code> or <code>/demo</code> to auto-launch a checkout for beacon testing.
      </small>
    </main>
  );
}
