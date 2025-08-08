'use client';
import { useState } from 'react';

/** Bump this to force Netlify/CDN to fetch fresh CSS every deploy */
const CACHE_BUST = 'v=2025-08-08-01';

export default function Landing(){
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState<string>('');

  async function handleCheckout() {
    try {
      setBusy(true); setErr('');
      const res = await fetch('/.netlify/functions/createCheckout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `hp_${Date.now()}`,
          loungeId: 'demo-lounge-001',
          flavorMix: ['Mint', 'Blue Mist'],
          basePrice: 3000,
          addOns: [{ name: 'Premium Flavor', amount: 500 }],
          ref: 'LANDING-CHECKOUT'
        })
      });
      const data = await res.json();
      if (res.ok && data.url) window.location.href = data.url;
      else setErr(data.error || 'Unable to start checkout');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Cache-busted CSS to break any stale edge content */}
      <link rel="stylesheet" href={`/landing.css?${CACHE_BUST}`} />

      <div className="nav">
        <div className="brand">Hookah<span>+</span></div>
        <nav>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a className="cta" href="/demo">See a Demo</a>
        </nav>
      </div>

      <section className="hero">
        <div className="hero-inner">
          <h1>Session Reimagined. <br className="br-sm" />Loyalty Reinforced.</h1>
          <p>Hookah+ gives lounges a premium, modern experience: flavor mixes, live session checkout, and loyalty—beautifully tied together.</p>
          <div className="actions">
            <button className="btn primary" onClick={handleCheckout} disabled={busy}>
              {busy ? 'Starting…' : 'Checkout (Test)'}
            </button>
            <a className="btn ghost" href="/dashboard/notes">Operator Dashboard</a>
          </div>
          {err && <div style={{ color:'tomato', marginTop:8 }}>{err}</div>}
          <div className="badges">
            <span>Fast checkout</span>
            <span>Flavor memory</span>
            <span>Loyalty built-in</span>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Why lounges choose Hookah+</h2>
        <div className="grid">
          <article className="card">
            <h3>Premium Flavor Mix</h3>
            <p>Create, save, and replay your lounge’s signature blends—customers come back for the exact taste they love.</p>
          </article>
          <article className="card">
            <h3>Live Session Checkout</h3>
            <p>Frictionless payments with Stripe. Quick upsells, add-ons, and a smooth end to every session.</p>
          </article>
          <article className="card">
            <h3>Loyalty that Grows</h3>
            <p>Built-in rewards and visit memory—delight regulars and recognize VIPs instantly.</p>
          </article>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <h2>Simple pricing</h2>
        <div className="tiers">
          <div className="tier">
            <h3>Starter</h3>
            <p className="price">$0<span>/mo</span></p>
            <ul>
              <li>1 Lounge</li>
              <li>Flavor Memory</li>
              <li>Basic Checkout</li>
            </ul>
            <a className="btn small" href="/demo">Try it</a>
          </div>
          <div className="tier featured">
            <h3>Pro</h3>
            <p className="price">$99<span>/mo</span></p>
            <ul>
              <li>Up to 3 Lounges</li>
              <li>Upsells & Add-ons</li>
              <li>Loyalty & Perks</li>
            </ul>
            <a className="btn small primary" href="/demo">Go Pro</a>
          </div>
          <div className="tier">
            <h3>Enterprise</h3>
            <p className="price">Custom</p>
            <ul>
              <li>Unlimited Lounges</li>
              <li>SLA & White-label</li>
              <li>Priority Support</li>
            </ul>
            <a className="btn small" href="mailto:team@hookahplus.net">Talk to us</a>
          </div>
        </div>
      </section>

      <section className="cta-wide">
        <h2>Ready to elevate your lounge?</h2>
        <a className="btn primary" href="/demo">See a Demo</a>
      </section>

      <footer className="footer">
        <div>© {new Date().getFullYear()} Hookah+. All rights reserved.</div>
        <div className="links">
          <a href="/press">Press</a>
          <a href="/onboarding">Onboard</a>
          <a href="/live-session">Live Session</a>
        </div>
      </footer>
    </div>
  );
}
