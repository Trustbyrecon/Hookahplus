"use client";
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Hookah+ Pricing Intelligence Board — Cursor-Agent Ready
 * -------------------------------------------------------
 * Drop into: apps/app/app/pricing/page.tsx (Next.js App Router)
 * Styling: TailwindCSS (no external styles required)
 * Icons: simple emoji + Tailwind (replace with lucide-react if desired)
 *
 * Agent Hooks (Cursor / Reflex):
 * - data-agent, data-event, data-payload attrs for low-friction event capture
 * - window.dispatchEvent(new CustomEvent("reflex:event", { detail })) on key interactions
 * - fetch("/api/reflex/track", { method: "POST", body: JSON.stringify(detail) }) — optional server sink
 *
 * Features:
 * - Dual pricing: Flavor Add-Ons + SaaS Subscriptions
 * - ROI Projection widget (sessions x avg add-ons)
 * - Tier highlight + annual toggle (+15% savings)
 * - Pulse/Trust bars for Reflex narrative
 * - Accessible, responsive, enterprise-clean
 */

// ---------- Types ----------

type AddOnTier = {
  id: "standard" | "medium" | "premium";
  name: string;
  priceMin: number; // USD
  priceMax: number; // USD
  examples: string[];
  experience: string;
  marginNote: string;
  color: string; // tailwind color key (e.g., "emerald", "amber", "rose")
};

type SubTier = {
  id: "starter" | "core" | "trust" | "enterprise";
  name: string;
  monthly: number | null; // null => custom
  includes: string[];
  ideal: string;
  reflex: string;
  pulse: number; // 0..100 visual intensity
  color: string;
};

// ---------- Data ----------

const ADDON_TIERS: AddOnTier[] = [
  {
    id: "standard",
    name: "Standard",
    priceMin: 2.0,
    priceMax: 2.5,
    examples: ["Mint", "Lemon", "Double Apple", "Peach"],
    experience: "Everyday classics — low friction, instant yes",
    marginNote: "High-volume upsell tier. 2–3 add-ons adds $4–$6 uplift/session.",
    color: "emerald",
  },
  {
    id: "medium",
    name: "Medium Grade",
    priceMin: 3.0,
    priceMax: 3.5,
    examples: ["House Blend", "Branded Mix", "Fruit Fusion"],
    experience: "Curated flavor experiences, slight luxury",
    marginNote: "+$1–$1.50 margin per bowl vs Standard.",
    color: "amber",
  },
  {
    id: "premium",
    name: "Premium",
    priceMin: 4.0,
    priceMax: 4.5,
    examples: ["Vodka-Infused", "Whiskey Barrel", "Boutique Import"],
    experience: "Signature 'premium moment' — indulgence, not default",
    marginNote: "+$2+ margin per bowl; ideal for 1 in 5 guests.",
    color: "rose",
  },
];

const SUB_TIERS: SubTier[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 49,
    includes: ["Session Timer", "QR Payments"],
    ideal: "New lounges",
    reflex: "Reflex Core Metrics",
    pulse: 45,
    color: "slate",
  },
  {
    id: "core",
    name: "Core",
    monthly: 99,
    includes: ["Add-On Tracking", "Loyalty"],
    ideal: "Busy lounges",
    reflex: "Reflex Mix Recommender",
    pulse: 65,
    color: "cyan",
  },
  {
    id: "trust",
    name: "Trust+",
    monthly: 199,
    includes: ["AI Memory", "Stripe Sync", "Reflex Logs"],
    ideal: "Growth-phase lounges",
    reflex: "TrustGraph + Smart Pricing",
    pulse: 85,
    color: "violet",
  },
  {
    id: "enterprise",
    name: "Enterprise+",
    monthly: null,
    includes: ["API Access", "Multi-Location Ops", "SLA & SSO"],
    ideal: "Franchises",
    reflex: "Full Reflex Chain Integration",
    pulse: 95,
    color: "emerald",
  },
];

// ---------- Utilities ----------

const currency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function fireAgent(detail: any) {
  try {
    window.dispatchEvent(new CustomEvent("reflex:event", { detail }));
  } catch {}
  // Optional: send to API sink if present
  try {
    fetch("/api/reflex/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detail),
      keepalive: true,
    });
  } catch {}
}

// ---------- Components ----------

function PulseBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ type: "spring", stiffness: 110, damping: 18 }}
        className={`h-full rounded-full bg-${color}-400`} />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur p-5 ${className}`}>{children}</div>
  );
}

function AddOnCard({ tier }: { tier: AddOnTier }) {
  return (
    <Card className="flex flex-col gap-3" >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs bg-${tier.color}-500/15 text-${tier.color}-300 border border-${tier.color}-500/30`}>{tier.priceMin.toFixed(2)}–{tier.priceMax.toFixed(2)} USD</span>
      </div>
      <p className="text-sm text-white/80">{tier.experience}</p>
      <ul className="text-sm list-disc pl-4 text-white/80">
        {tier.examples.map((e) => <li key={e}>{e}</li>)}
      </ul>
      <div className="text-xs text-white/60">{tier.marginNote}</div>
      <button
        data-agent
        data-event="click:addon-tier"
        data-payload={JSON.stringify({ tier: tier.id })}
        onClick={() => fireAgent({ type: "ui.addon.select", tier: tier.id })}
        className={`mt-2 inline-flex items-center justify-center rounded-xl border border-${tier.color}-400/40 bg-${tier.color}-500/10 px-3 py-2 text-sm hover:bg-${tier.color}-500/20 transition`}
      >
        Add to Mix
      </button>
    </Card>
  );
}

function SubTierCard({ t, annual, onSelect }: { t: SubTier; annual: boolean; onSelect: (id: string) => void }) {
  const price = useMemo(() => {
    if (t.monthly == null) return "Custom";
    const m = annual ? Math.round(t.monthly * 0.85) : t.monthly;
    return `${currency(m)}/${annual ? "mo (annual)" : "mo"}`;
  }, [t, annual]);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs bg-${t.color}-500/15 text-${t.color}-300 border border-${t.color}-500/30`}>{price}</span>
      </div>
      <ul className="text-sm list-disc pl-4 text-white/80">
        {t.includes.map((i) => <li key={i}>{i}</li>)}
      </ul>
      <div className="text-xs text-white/60">Ideal for: {t.ideal}</div>
      <div className="text-xs text-white/60">Reflex: {t.reflex}</div>
      <PulseBar value={t.pulse} color={t.color} />
      <button
        data-agent
        data-event="click:sub-tier"
        data-payload={JSON.stringify({ tier: t.id, annual })}
        onClick={() => { fireAgent({ type: "ui.sub.select", tier: t.id, annual }); onSelect(t.id);} }
        className={`mt-1 inline-flex items-center justify-center rounded-xl border border-${t.color}-400/40 bg-${t.color}-500/10 px-3 py-2 text-sm hover:bg-${t.color}-500/20 transition`}
      >
        Choose {t.name}
      </button>
    </Card>
  );
}

function RoiWidget() {
  const [sessions, setSessions] = useState(1000);
  const [avgAddOns, setAvgAddOns] = useState(2.2); // per session
  const [avgPrice, setAvgPrice] = useState(2.8); // USD per add-on

  const monthlyUplift = useMemo(() => Math.round(sessions * avgAddOns * avgPrice), [sessions, avgAddOns, avgPrice]);

  useEffect(() => {
    fireAgent({ type: "ui.roi.render" });
  }, []);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ROI Projection</h3>
        <span className="text-sm text-white/60">Flavor upsell model</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-white/60">Monthly Sessions</label>
          <input type="number" value={sessions} onChange={(e)=>setSessions(parseInt(e.target.value||"0",10))}
                 className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2" />
        </div>
        <div>
          <label className="text-xs text-white/60">Avg Add-Ons / Session</label>
          <input type="number" step="0.1" value={avgAddOns} onChange={(e)=>setAvgAddOns(parseFloat(e.target.value||"0"))}
                 className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2" />
        </div>
        <div>
          <label className="text-xs text-white/60">Avg Add-On Price (USD)</label>
          <input type="number" step="0.1" value={avgPrice} onChange={(e)=>setAvgPrice(parseFloat(e.target.value||"0"))}
                 className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2" />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <div className="text-3xl font-semibold">{currency(monthlyUplift)}</div>
        <div className="text-sm text-white/60">Projected monthly revenue uplift</div>
      </div>
    </Card>
  );
}

export default function PricingIntelligenceBoard() {
  const [annual, setAnnual] = useState(false);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  useEffect(() => {
    fireAgent({ type: "ui.pricing.render" });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0b0f12] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Pricing Intelligence Board</h1>
          <p className="text-white/70">Choose your <span className="text-emerald-300">session flavor tiers</span> and your <span className="text-violet-300">subscription power level</span>. Aliethia will tune for ROI. </p>
        </header>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={annual} onChange={(e)=>setAnnual(e.target.checked)} />
            <span>Annual billing (save 15%)</span>
          </label>
          {selectedSub && <span className="text-sm text-white/70">Selected: <b>{selectedSub}</b></span>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Add-Ons + ROI */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Flavor Add-On Tiers</h2>
                <span className="text-xs text-white/50">Psychology-first pricing for higher mix adoption</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ADDON_TIERS.map((t) => <AddOnCard key={t.id} tier={t} />)}
              </div>
            </section>
            <RoiWidget />
          </div>

          {/* Right: Subscriptions */}
          <section className="space-y-3">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Subscription Tiers</h2>
              <span className="text-xs text-white/50">Scale your Reflex power</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {SUB_TIERS.map((t) => (
                <SubTierCard key={t.id} t={t} annual={annual} onSelect={(id)=>setSelectedSub(id)} />
              ))}
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <button
            data-agent
            data-event="click:start-onboarding"
            onClick={() => fireAgent({ type: "ui.cta.startOnboarding", selectedSub })}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400 transition"
          >
            Start Operator Onboarding
          </button>
          <button
            data-agent
            data-event="click:demo"
            onClick={() => fireAgent({ type: "ui.cta.demo" })}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Watch 1‑min Demo
          </button>
          <button
            data-agent
            data-event="click:contact-sales"
            onClick={() => fireAgent({ type: "ui.cta.contactSales" })}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
