"use client";

import React, { useEffect, useMemo, useState } from "react";
import GlobalNavigation from "../../components/GlobalNavigation";
import { track } from "@/lib/analytics";

export default function RoiCalculatorPage() {
  const [sessionPrice, setSessionPrice] = useState<number>(30);
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(8);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(26);
  const [uplift, setUplift] = useState<number>(1.2); // 20% uplift
  const [tier, setTier] = useState<"starter" | "pro" | "trust">("pro");

  const tierCost = useMemo(() => ({ starter: 99, pro: 249, trust: 499 }[tier]), [tier]);
  const baseSessions = useMemo(() => sessionsPerDay * daysPerMonth, [sessionsPerDay, daysPerMonth]);
  const baseRevenue = useMemo(() => baseSessions * sessionPrice, [baseSessions, sessionPrice]);
  const revenueWithTrust = useMemo(() => baseRevenue * uplift, [baseRevenue, uplift]);
  const netGain = useMemo(() => revenueWithTrust - baseRevenue, [revenueWithTrust, baseRevenue]);
  const netAfterSub = useMemo(() => revenueWithTrust - tierCost, [revenueWithTrust, tierCost]);
  const roiPctOfSub = useMemo(
    () => (tierCost > 0 ? ((revenueWithTrust - baseRevenue - tierCost) / tierCost) * 100 : 0),
    [revenueWithTrust, baseRevenue, tierCost]
  );

  const fmt0 = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmt2 = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  useEffect(() => {
    track("roi_view");
  }, []);

  const onCalculate = () => {
    track("roi_calculate_click", { tier, sessionPrice, sessionsPerDay, daysPerMonth, uplift });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            ROI Calculator
            <span className="block text-teal-400">See what Hookah+ can unlock</span>
          </h1>
          <p className="mt-3 text-zinc-300 max-w-2xl">
            Model your monthly revenue uplift from tighter session workflow, faster turnover, and higher attachment (refills,
            add-ons, upgrades).
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#calc"
              onClick={() => track("roi_calculate_click", { tier })}
              className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-teal-400 transition-colors"
            >
              Calculate ROI
            </a>
            <a
              href="/pricing"
              onClick={() => track("roi_pricing_click")}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:border-teal-500/70 transition-colors"
            >
              View Pricing
            </a>
            <a
              href="/signup"
              onClick={() => track("roi_signup_click")}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:border-teal-500/70 transition-colors"
            >
              Start Setup
            </a>
          </div>
        </div>

        <div id="calc" className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="text-lg font-semibold text-zinc-100">Inputs</div>
            <p className="mt-1 text-sm text-zinc-400">Adjust to match your lounge today.</p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-400">Session price ($)</span>
                <input
                  type="number"
                  min={5}
                  value={sessionPrice}
                  onChange={(e) => setSessionPrice(Number(e.target.value))}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-400">Sessions / day</span>
                <input
                  type="number"
                  min={1}
                  value={sessionsPerDay}
                  onChange={(e) => setSessionsPerDay(Number(e.target.value))}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-400">Days / month</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-400">Uplift multiplier</span>
                <input
                  type="number"
                  step={0.01}
                  min={1}
                  value={uplift}
                  onChange={(e) => setUplift(Number(e.target.value))}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
              </label>
            </div>

            <div className="mt-6">
              <div className="text-xs text-zinc-400">Plan tier</div>
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
                      tier === t.key ? "border-teal-500/70 bg-teal-500/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                    aria-pressed={tier === t.key}
                  >
                    {t.label}
                    <div className="text-[11px] text-zinc-400">{fmt2(t.cost)} / mo</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onCalculate}
              className="mt-6 w-full rounded-xl bg-teal-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-teal-400 transition-colors"
            >
              Recalculate
            </button>

            <div className="mt-4 text-xs text-zinc-500">
              Uplift reflects workflow + retention effects. Actuals vary by hours, staffing, and local demand.
            </div>
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="text-lg font-semibold text-zinc-100">Projected results</div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-400">Base monthly revenue</div>
                <div className="mt-1 text-2xl font-semibold">{fmt0(baseRevenue)}</div>
                <div className="text-xs text-zinc-500">
                  {sessionsPerDay} × {daysPerMonth} × {fmt2(sessionPrice)}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-400">Revenue with uplift</div>
                <div className="mt-1 text-2xl font-semibold">{fmt0(revenueWithTrust)}</div>
                <div className="text-xs text-zinc-500">Uplift ×{uplift.toFixed(2)}</div>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-400">Monthly net gain (uplift)</div>
                <div className="mt-1 text-2xl font-semibold text-teal-400">{fmt0(netGain)}</div>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-400">After subscription ({fmt2(tierCost)}/mo)</div>
                <div className="mt-1 text-2xl font-semibold">{fmt0(netAfterSub)}</div>
                <div className="text-xs text-zinc-500">ROI vs sub: {roiPctOfSub.toFixed(0)}%</div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/pricing"
                onClick={() => track("roi_pricing_click")}
                className="flex-1 rounded-xl border border-zinc-700 px-5 py-3 text-center font-semibold hover:border-teal-500/70 transition-colors"
              >
                Compare plans
              </a>
              <a
                href="/signup"
                onClick={() => track("roi_signup_click")}
                className="flex-1 rounded-xl bg-teal-500 px-5 py-3 text-center font-semibold text-zinc-950 hover:bg-teal-400 transition-colors"
              >
                Start setup
              </a>
            </div>

            <div className="mt-6 text-xs text-zinc-500">
              This calculator is illustrative and not a guarantee of revenue.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

