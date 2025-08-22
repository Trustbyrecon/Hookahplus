"use client";
<<<<<<< HEAD
import { useState, useEffect } from "react";
import { track } from "@/lib/analytics";

export default function ROICalculatorPage() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(15000);
  const [sessionPrice, setSessionPrice] = useState(30);
  const [sessionsPerDay, setSessionsPerDay] = useState(20);
  const [operatingCosts, setOperatingCosts] = useState(8000);
  const [roi, setRoi] = useState(0);

  useEffect(() => {
    track("roi_view");
  }, []);

  const calculateROI = () => {
    const monthlySessions = sessionsPerDay * 30;
    const totalRevenue = monthlySessions * sessionPrice;
    const profit = totalRevenue - operatingCosts;
    const roiPercentage = ((profit / operatingCosts) * 100);
    setRoi(roiPercentage);
    
    track("roi_calculate_click", { 
      monthlyRevenue: totalRevenue,
      sessionsPerDay,
      sessionPrice 
    });
  };

  const handlePricingClick = () => {
    track("roi_pricing_click");
  };

  const handleSignupClick = () => {
    track("roi_signup_click");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hookah+ ROI Calculator
          </h1>
          <p className="text-xl text-gray-300">
            Calculate your potential return on investment with Trust Core
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Business Metrics</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Monthly Revenue
                </label>
                <input
                  type="number"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Price ($)
                </label>
                <input
                  type="number"
                  value={sessionPrice}
                  onChange={(e) => setSessionPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sessions per Day
                </label>
                <input
                  type="number"
                  value={sessionsPerDay}
                  onChange={(e) => setSessionsPerDay(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Operating Costs
                </label>
                <input
                  type="number"
                  value={operatingCosts}
                  onChange={(e) => setOperatingCosts(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="8000"
                />
              </div>

              <button
                onClick={calculateROI}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                Calculate ROI
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Results</h2>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-400 mb-2">
                  {roi > 0 ? `+${roi.toFixed(1)}%` : `${roi.toFixed(1)}%`}
                </div>
                <p className="text-gray-300">Return on Investment</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Trust Core Benefits</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Automated session tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Real-time analytics dashboard
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Customer loyalty management
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Inventory optimization
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePricingClick}
                  className="w-full bg-white/20 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/30 transition-colors"
                >
                  View Pricing Plans
                </button>
                <button
                  onClick={handleSignupClick}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            * ROI calculations are estimates based on industry averages. Actual results may vary.
          </p>
        </div>
      </div>
=======

import React, { useMemo, useState, useEffect } from "react";
import GlobalNavigation from "../../components/GlobalNavigation";

// Hookah+ ROI Calculator Page
// Drop this file at: app/roi-calculator/page.tsx (Next.js App Router)
// Tailwind required. Optional: add your analytics to the handleCtaClick().
export default function RoiCalculatorPage() {
  const [sessionPrice, setSessionPrice] = useState<number>(30);
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(8);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(26);
  const [uplift, setUplift] = useState<number>(1.2); // 20% uplift
  const [tier, setTier] = useState<"starter" | "pro" | "trust">("pro");

  const tierCost = useMemo(() => ({ starter: 99, pro: 249, trust: 499 }[tier]), [tier]);

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const fmt2 = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const baseSessions = useMemo(() => sessionsPerDay * daysPerMonth, [sessionsPerDay, daysPerMonth]);
  const baseRevenue = useMemo(() => baseSessions * sessionPrice, [baseSessions, sessionPrice]);
  const revenueWithTrust = useMemo(() => baseRevenue * uplift, [baseRevenue, uplift]);
  const netGain = useMemo(() => revenueWithTrust - baseRevenue, [revenueWithTrust, baseRevenue]);
  const netAfterSub = useMemo(() => revenueWithTrust - tierCost, [revenueWithTrust, tierCost]);
  const roiMultiple = useMemo(() => (tierCost > 0 ? (netAfterSub - baseRevenue) / tierCost + 1 : 0), [netAfterSub, baseRevenue, tierCost]);
  const roiPctOfSub = useMemo(() => (tierCost > 0 ? ((revenueWithTrust - baseRevenue - tierCost) / tierCost) * 100 : 0), [revenueWithTrust, baseRevenue, tierCost]);

  const handleCtaClick = (label: string) => {
    // TODO: replace with Plausible/GA/Segment. Example GA4 event:
    // window.gtag?.("event", "cta_click", { label, page: "roi_calculator" });
    try {
      const evt = new CustomEvent("hp_roi_cta", { detail: { label, tier } });
      window.dispatchEvent(evt);
    } catch {}
    console.log("CTA:", label, { tier });
  };

  useEffect(() => {
    // Basic pageview hook for your analytics (replace with your provider)
    console.log("ROI Calculator Viewed", { tierDefault: tier });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <GlobalNavigation />
      
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(16,185,129,0.25),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
              See the ROI of
              <span className="block bg-gradient-to-br from-teal-400 to-cyan-400 bg-clip-text text-transparent"> Hookah+ in Your Lounge</span>
            </h1>
            <p className="mt-5 text-zinc-300 max-w-xl">
              With Trust Core features, lounges typically see a <span className="text-teal-400 font-medium">20% revenue uplift</span> in the first month.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#calc"
                onClick={() => handleCtaClick("hero_calculate")}
                className="rounded-xl bg-teal-500 px-5 py-3 font-medium text-zinc-950 hover:bg-teal-400 transition-colors"
              >
                Calculate Your ROI
              </a>
              <a
                href="/pricing"
                onClick={() => handleCtaClick("hero_pricing")}
                className="rounded-xl border border-zinc-700 px-5 py-3 font-medium hover:border-teal-500/70 transition-colors"
              >
                See Pricing
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="rounded-xl bg-zinc-950 p-6 border border-zinc-800">
              <div className="text-sm text-zinc-300">ROI Snapshot (using defaults)</div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                  <div className="text-xs text-zinc-400">Base Monthly</div>
                  <div className="text-lg font-semibold">{fmt(baseRevenue)}</div>
                </div>
                <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                  <div className="text-xs text-zinc-400">With Trust Core</div>
                  <div className="text-lg font-semibold">{fmt(revenueWithTrust)}</div>
                </div>
                <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                  <div className="text-xs text-zinc-400">Net Gain</div>
                  <div className="text-lg font-semibold text-teal-400">{fmt(netGain)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Core Value Pitch */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-400 mb-4">Why Trust Core Pays for Itself</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Our comprehensive suite of tools designed to maximize your lounge's revenue potential
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-teal-300 mb-3">Revenue Boost</h3>
            <p className="text-zinc-400 text-sm">
              Reflex Scoring + Loyalty tools increase customer retention and average order value
            </p>
          </div>
          
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-teal-300 mb-3">Smarter Operations</h3>
            <p className="text-zinc-400 text-sm">
              QR Pay + Session Insights streamline operations and reduce staff overhead
            </p>
          </div>
          
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-teal-300 mb-3">High ROI</h3>
            <p className="text-zinc-400 text-sm">
              Average +$1,248 net gain monthly after subscription costs
            </p>
          </div>
        </div>
        
        <div className="mt-8 bg-teal-900/20 border border-teal-500/30 rounded-xl p-6 text-center max-w-2xl mx-auto">
          <div className="text-teal-400 font-bold text-lg mb-2">Even after the $249/month subscription</div>
          <div className="text-teal-300 text-sm">
            Lounges average $7,239 in extra monthly ROI with Trust Core
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calc" className="mx-auto max-w-7xl px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-400 mb-4">Your Lounge ROI Snapshot</h2>
          <p className="text-zinc-400">Adjust the numbers to match your lounge's current performance</p>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold text-teal-300">Your Inputs</h2>
            <p className="text-sm text-zinc-400 mt-1">Adjust the numbers to match your lounge.</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-400">Session Price ($)</span>
                <input
                  type="number"
                  min={5}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                  value={sessionPrice}
                  onChange={(e) => setSessionPrice(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-400">Sessions / Day</span>
                <input
                  type="number"
                  min={1}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                  value={sessionsPerDay}
                  onChange={(e) => setSessionsPerDay(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-400">Days / Month</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-400">Uplift Multiplier</span>
                <input
                  type="number"
                  step={0.01}
                  min={1}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                  value={uplift}
                  onChange={(e) => setUplift(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="mt-6">
              <span className="text-xs text-zinc-400">Plan Tier</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([
                  { key: "starter", label: "Starter", cost: 99 },
                  { key: "pro", label: "Pro", cost: 249 },
                  { key: "trust", label: "Trust+", cost: 499 },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTier(t.key)}
                    className={`rounded-xl px-4 py-2 border text-sm transition-colors ${
                      tier === t.key
                        ? "border-teal-500/70 bg-teal-500/10"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                    aria-pressed={tier === t.key}
                  >
                    {t.label} · {fmt2(t.cost)} / mo
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-xs text-zinc-500">
              * Uplift reflects Reflex Scoring + Loyalty tools impact. Actuals vary by venue.
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold text-teal-300">Projected Results</h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-400">Base Monthly Revenue</div>
                <div className="mt-1 text-2xl font-semibold">{fmt(baseRevenue)}</div>
                <div className="text-xs text-zinc-500">{sessionsPerDay} × {daysPerMonth} × {fmt2(sessionPrice)}</div>
              </div>
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-400">Revenue w/ Trust Core</div>
                <div className="mt-1 text-2xl font-semibold">{fmt(revenueWithTrust)}</div>
                <div className="text-xs text-zinc-500">Uplift ×{uplift.toFixed(2)}</div>
              </div>
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-400">Monthly Net Gain (Uplift)</div>
                <div className="mt-1 text-2xl font-semibold text-teal-400">{fmt(netGain)}</div>
              </div>
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-400">After Subscription ({fmt2(tierCost)}/mo)</div>
                <div className="mt-1 text-2xl font-semibold">{fmt(netAfterSub)}</div>
                <div className="text-xs text-zinc-500">ROI vs. sub: {roiPctOfSub.toFixed(0)}%</div>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
              <a
                href="/signup"
                onClick={() => handleCtaClick("roi_signup")}
                className="rounded-xl bg-teal-500 px-5 py-3 font-medium text-zinc-950 text-center hover:bg-teal-400 transition-colors"
              >
                Get Started
              </a>
              <a
                href="/pricing"
                onClick={() => handleCtaClick("roi_pricing")}
                className="rounded-xl border border-zinc-700 px-5 py-3 font-medium text-center hover:border-teal-500/70 transition-colors"
              >
                See Pricing
              </a>
              <a
                href="/contact"
                onClick={() => handleCtaClick("roi_contact")}
                className="rounded-xl border border-zinc-700 px-5 py-3 font-medium text-center hover:border-teal-500/70 transition-colors"
              >
                Talk to Sales
              </a>
            </div>

            <div className="mt-8 text-xs text-zinc-500">
              Note: This calculator is illustrative and not a guarantee of revenue. Your results may vary based on hours, staffing, and locale.
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Plans Preview */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-400 mb-4">Pricing & Plans</h2>
          <p className="text-zinc-400">Choose the plan that fits your lounge's needs</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Starter", price: 99, features: ["Basic QR Pay", "Session Tracking", "Email Support"] },
            { name: "Pro", price: 249, features: ["Trust Core", "Reflex Scoring", "Priority Support"], recommended: true },
            { name: "Trust+", price: 499, features: ["Advanced Analytics", "Custom Integrations", "Dedicated Support"] },
            { name: "Enterprise+", price: "Custom", features: ["White Label", "API Access", "24/7 Support"] }
          ].map((plan) => (
            <div key={plan.name} className={`rounded-xl border p-6 text-center ${
              plan.recommended 
                ? 'border-teal-500 bg-teal-500/10' 
                : 'border-zinc-800 bg-zinc-900'
            }`}>
              {plan.recommended && (
                <div className="text-xs text-teal-400 font-medium mb-2">⭐ Recommended</div>
              )}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-teal-400 mb-4">
                {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                {typeof plan.price === 'number' && <span className="text-sm text-zinc-400">/mo</span>}
              </div>
              <ul className="text-sm text-zinc-400 space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
              <a
                href="/pricing"
                className={`w-full rounded-xl px-4 py-2 font-medium transition-colors ${
                  plan.recommended
                    ? 'bg-teal-500 text-zinc-950 hover:bg-teal-400'
                    : 'border border-zinc-700 hover:border-teal-500/70'
                }`}
              >
                {plan.recommended ? 'Get Started' : 'Learn More'}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-teal-400 mb-4">
            Ready to Multiply Your Lounge's Revenue?
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of lounge owners who have already transformed their business with Hookah+
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/signup"
              onClick={() => handleCtaClick("final_signup")}
              className="rounded-xl bg-teal-500 px-8 py-4 font-medium text-zinc-950 hover:bg-teal-400 transition-colors text-lg"
            >
              Get Started with Trust Core
            </a>
            <a
              href="/contact"
              onClick={() => handleCtaClick("final_contact")}
              className="rounded-xl border border-zinc-700 px-8 py-4 font-medium hover:border-teal-500/70 transition-colors text-lg"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </section>
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
    </div>
  );
}
