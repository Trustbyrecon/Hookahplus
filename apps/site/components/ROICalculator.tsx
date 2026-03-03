'use client';

import React, { useMemo, useState } from 'react';
import { Calculator, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import Card from './Card';
import Button from './Button';

export default function ROICalculator() {
  const [sessionPrice, setSessionPrice] = useState<number>(30);
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(8);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(26);
  const [uplift, setUplift] = useState<number>(1.2); // 20% uplift
  const [tier, setTier] = useState<"starter" | "pro" | "trust">("pro");

  const tierCost = useMemo(() => ({ starter: 79, pro: 249, trust: 499 }[tier]), [tier]);

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const fmt2 = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const baseSessions = useMemo(() => sessionsPerDay * daysPerMonth, [sessionsPerDay, daysPerMonth]);
  const baseRevenue = useMemo(() => baseSessions * sessionPrice, [baseSessions, sessionPrice]);
  const revenueWithTrust = useMemo(() => baseRevenue * uplift, [baseRevenue, uplift]);
  const netGain = useMemo(() => revenueWithTrust - baseRevenue, [revenueWithTrust, baseRevenue]);
  const netAfterSub = useMemo(() => revenueWithTrust - tierCost, [revenueWithTrust, tierCost]);
  const roiPctOfSub = useMemo(() => (tierCost > 0 ? ((revenueWithTrust - baseRevenue - tierCost) / tierCost) * 100 : 0), [revenueWithTrust, baseRevenue, tierCost]);

  return (
    <div className="mb-12 bg-gradient-to-r from-teal-900/20 to-green-900/20 rounded-xl p-8 border border-teal-500/30">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calculator className="w-6 h-6 text-teal-400" />
        ROI Calculator
      </h2>
      
      <p className="text-zinc-300 mb-6">
        Calculate your potential return on investment with Hookah+. Adjust the inputs to match your lounge's current performance.
      </p>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <Card className="border border-zinc-700 bg-zinc-800/50">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Your Business Metrics</h3>
              <p className="text-sm text-zinc-400 mb-6">Adjust the numbers to match your lounge, mobile operation, or pop-up location.</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-400">Session Price ($)</span>
                  <input
                    type="number"
                    min={5}
                    className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                    value={sessionPrice}
                    onChange={(e) => setSessionPrice(Number(e.target.value))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-400">Sessions / Day</span>
                  <input
                    type="number"
                    min={1}
                    className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
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
                    className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-400">Revenue Uplift</span>
                  <input
                    type="number"
                    step={0.01}
                    min={1.10}
                    max={1.30}
                    className={`rounded-lg bg-zinc-900 border px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors ${
                      uplift < 1.10 || uplift > 1.30
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-700'
                    }`}
                    value={uplift}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      // Clamp to acceptable range
                      const clampedValue = Math.max(1.10, Math.min(1.30, value));
                      setUplift(clampedValue);
                    }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${uplift < 1.10 || uplift > 1.30 ? 'text-red-400' : 'text-zinc-500'}`}>
                      {(uplift - 1) * 100}% increase
                    </span>
                    {uplift < 1.10 || uplift > 1.30 ? (
                      <span className="text-xs text-red-400">Range: 10-30%</span>
                    ) : null}
                  </div>
                  <span className="text-xs text-zinc-600 mt-0.5">Acceptable range: 10-30% (1.10-1.30x)</span>
                </label>
              </div>

              <div className="mb-6">
                <span className="text-xs text-zinc-400 mb-2 block">Plan Tier</span>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: "starter", label: "Starter", cost: 79 },
                    { key: "pro", label: "Pro", cost: 249 },
                    { key: "trust", label: "Trust+", cost: 499 },
                  ] as const).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTier(t.key)}
                      className={`rounded-lg px-3 py-2 border text-sm transition-colors ${
                        tier === t.key
                          ? "border-teal-500 bg-teal-500/10 text-teal-400"
                          : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {t.label}
                      <div className="text-xs mt-1">{fmt2(t.cost)}/mo</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-zinc-500">
                * Uplift reflects Reflex Scoring + Loyalty tools impact. Actuals vary by venue.
              </div>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <Card className="border border-zinc-700 bg-zinc-800/50">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-6">Projected Results</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Base Monthly Revenue</div>
                  <div className="text-2xl font-semibold text-white">{fmt(baseRevenue)}</div>
                  <div className="text-xs text-zinc-500 mt-1">{sessionsPerDay} × {daysPerMonth} × {fmt2(sessionPrice)}</div>
                </div>
                <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Revenue w/ Hookah+</div>
                  <div className="text-2xl font-semibold text-teal-400">{fmt(revenueWithTrust)}</div>
                  <div className="text-xs text-zinc-500 mt-1">Uplift ×{uplift.toFixed(2)}</div>
                </div>
                <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Monthly Net Gain</div>
                  <div className="text-2xl font-semibold text-green-400">{fmt(netGain)}</div>
                  <div className="text-xs text-zinc-500 mt-1">Additional revenue</div>
                </div>
                <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-4">
                  <div className="text-xs text-zinc-400 mb-1">After Subscription ({fmt2(tierCost)}/mo)</div>
                  <div className="text-2xl font-semibold text-white">{fmt(netAfterSub)}</div>
                  <div className="text-xs text-teal-400 mt-1">ROI: {roiPctOfSub.toFixed(0)}%</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => window.location.href = '/onboarding'}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/pricing'}
                >
                  See Pricing
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/contact'}
                >
                  Contact Sales
                </Button>
              </div>

              <div className="mt-6 text-xs text-zinc-500">
                Note: This calculator is illustrative and not a guarantee of revenue. Your results may vary based on hours, staffing, and locale.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

