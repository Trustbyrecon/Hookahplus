"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import GlobalNavigation from "@/components/GlobalNavigation";
import {
  Download,
  Play,
  Pause,
  Zap,
  RefreshCcw,
  ShieldCheck,
  Activity,
  TrendingUp,
  Settings,
  CornerDownLeft,
  ArrowLeft,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  ListChecks,
  Server,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";


// -----------------------------------------------------------------------------
// Admin Control Center — Hookah+ (Agent-Ready v0.4)
// Tabs:
//  - Overview (system status, quick stats, recent activity)
//  - Reflex Monitoring (moved here)
//  - Analytics & Insights (Profit margins + transparency)
//  - MVP Control (deploy + readiness)
//  - Agent Consensus (real-time agent coordination)
//
// Agent readiness:
//  - Exposes a lightweight client-side AgentRegistry with callable actions
//  - Command Launcher snippet included at bottom for server-side bindings
//  - 5s auto-refresh loop for Reflex Monitoring
//  - All API endpoints are placeholders — wire to your backend
// -----------------------------------------------------------------------------

// ---------------------------------
// Types
// ---------------------------------
export type KPIs = {
  sessions: number;
  revenue: number; // USD
  avgMarginPct: number; // 0..100
  trustScore: number; // 0..100
};

export type MarginRow = {
  id: string;
  item: string; // flavor / product name
  price: number; // selling price
  cost: number; // unit cost
  sold: number; // count in period
};

export type TrustPoint = { t: string; score: number };

export type DeployState = {
  env: "dev" | "staging" | "prod";
  buildStatus: "idle" | "queued" | "building" | "success" | "failed";
  lastDeployedAt?: string;
  version?: string;
};

// ---------------------------------
// Mock data (fallbacks)
// ---------------------------------
const MOCK_KPIS: KPIs = { sessions: 182, revenue: 5430, avgMarginPct: 41.7, trustScore: 83 };
const MOCK_MARGINS: MarginRow[] = [
  { id: "m1", item: "Mint Storm", price: 32, cost: 11, sold: 58 },
  { id: "m2", item: "Blue Mist", price: 30, cost: 10, sold: 46 },
  { id: "m3", item: "Double Apple", price: 34, cost: 13, sold: 39 },
  { id: "m4", item: "Grape Burst", price: 28, cost: 9, sold: 27 },
  { id: "m5", item: "Peach Wave", price: 33, cost: 12, sold: 24 },
];
const MOCK_TRUST: TrustPoint[] = [
  { t: "Mon", score: 78 },
  { t: "Tue", score: 81 },
  { t: "Wed", score: 79 },
  { t: "Thu", score: 85 },
  { t: "Fri", score: 88 },
  { t: "Sat", score: 84 },
  { t: "Sun", score: 83 },
];

// Utils
const usd = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function useMarginTable(rows: MarginRow[]) {
  const withComputed = useMemo(
    () =>
      rows.map((r) => {
        const margin = r.price - r.cost;
        const marginPct = r.price > 0 ? (margin / r.price) * 100 : 0;
        const gross = r.sold * r.price;
        const profit = r.sold * margin;
        return { ...r, margin, marginPct, gross, profit };
      }),
    [rows]
  );
  const totals = useMemo(() => withComputed.reduce((acc, r) => ({ gross: acc.gross + r.gross, profit: acc.profit + r.profit, sold: acc.sold + r.sold }), { gross: 0, profit: 0, sold: 0 }), [withComputed]);
  return { rows: withComputed, totals };
}

// Lightweight fetch helper
async function apiGet<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as T;
  } catch (e) {
    console.warn("API fallback:", url, e);
    return fallback;
  }
}

// ---------------------------------
// Main
// ---------------------------------
export default function AdminControlCenter() {
  const [lounge, setLounge] = useState<string>("Pilot #001");
  const [range, setRange] = useState<string>("Last 7 days");
  const [autoMonitor, setAutoMonitor] = useState<boolean>(true);
  const [env, setEnv] = useState<DeployState["env"]>("staging");
  const [activeTab, setActiveTab] = useState<'overview' | 'reflex' | 'analytics' | 'mvp' | 'agents'>('overview');

  const [kpis, setKpis] = useState<KPIs>(MOCK_KPIS);
  const [margins, setMargins] = useState<MarginRow[]>(MOCK_MARGINS);
  const [trustSeries, setTrustSeries] = useState<TrustPoint[]>(MOCK_TRUST);
  const [consensus, setConsensus] = useState<number>(78); // MVP readiness consensus score
  const [deploy, setDeploy] = useState<DeployState>({ env: "staging", buildStatus: "idle", version: "0.0.1" });
  const { rows, totals } = useMarginTable(margins);

  const intervalRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    try {
      refreshAll();
    } catch (err) {
      console.error('Error in initial load:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lounge, range]);

  // 5s auto-refresh for reflex monitoring
  useEffect(() => {
    if (autoMonitor) {
      startAuto();
      return stopAuto;
    } else {
      stopAuto();
    }
  }, [autoMonitor, lounge, range]);

  function startAuto() {
    stopAuto();
    intervalRef.current = window.setInterval(() => {
      fetchReflex();
    }, 5000);
  }

  function stopAuto() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function refreshAll() {
    // Wire these endpoints on your backend
    const [k, m] = await Promise.all([
      apiGet<KPIs>(`/api/admin/kpis?lounge=${encodeURIComponent(lounge)}&range=${encodeURIComponent(range)}`, MOCK_KPIS),
      apiGet<MarginRow[]>(`/api/orders?lounge=${encodeURIComponent(lounge)}&range=${encodeURIComponent(range)}`, MOCK_MARGINS),
    ]);
    setKpis(k);
    setMargins(m);
    fetchReflex();
    fetchConsensus();
  }

  async function fetchReflex() {
    const data = await apiGet<TrustPoint[]>(`/api/reflex-monitoring?lounge=${encodeURIComponent(lounge)}&range=${encodeURIComponent(range)}`, MOCK_TRUST);
    setTrustSeries(data);
  }

  async function fetchConsensus() {
    const c = await apiGet<number>(`/api/mvp/status?env=${env}`, 78);
    setConsensus(c);
  }

  // Actions
  async function runReflexScan() {
    await fetch(`/api/reflex/scan`, { method: "POST", body: JSON.stringify({ lounge, range }) });
  }

  async function startCalibration() {
    await fetch(`/api/reflex/calibration/start`, { method: "POST", body: JSON.stringify({ lounge }) });
  }

  async function stopCalibration() {
    await fetch(`/api/reflex/calibration/stop`, { method: "POST", body: JSON.stringify({ lounge }) });
  }

  async function triggerDeploy() {
    setDeploy((d) => ({ ...d, buildStatus: "queued" }));
    const res = await fetch(`/api/deploy`, { method: "POST", body: JSON.stringify({ env }) });
    if (res.ok) setDeploy((d) => ({ ...d, buildStatus: "building" }));
  }

  async function triggerRollback() {
    await fetch(`/api/deploy/rollback`, { method: "POST", body: JSON.stringify({ env }) });
  }

  const exportCSV = () => {
    const header = ["Item", "Sold", "Price", "Cost", "Margin", "Margin%", "Gross", "Profit"].join(",");
    const body = rows
      .map((r) => [r.item, r.sold, r.price.toFixed(2), r.cost.toFixed(2), r.margin.toFixed(2), r.marginPct.toFixed(2), r.gross.toFixed(2), r.profit.toFixed(2)].join(","))
      .join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hookahplus_margins_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Trust Lock — display only (wire to validator output)
  const trustLockEngaged = true;

  // Expose minimal agent registry for external callers (optional)
  useEffect(() => {
    // @ts-ignore
    window.AgentRegistry = {
      "admin.dev": () => fetch("/api/admin/dev", { method: "POST" }),
      "admin.build": () => fetch("/api/admin/build", { method: "POST" }),
      "admin.reflex.scan": runReflexScan,
      "admin.reflex.calibrate.start": startCalibration,
      "admin.reflex.calibrate.stop": stopCalibration,
      "admin.deploy": triggerDeploy,
      "admin.rollback": triggerRollback,
      "admin.mvp.status": fetchConsensus,
    };
  }, [env, lounge, range]);

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen w-full bg-black text-zinc-100 p-6">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">⚠️ Admin Control Center Error</h1>
          <p className="text-zinc-400">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 p-6 space-y-6">
      <GlobalNavigation />
      <AdminNavHeader env={env} onEnvChange={setEnv} />

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={<Activity className="w-5 h-5" />} label="Sessions" value={kpis.sessions.toLocaleString()} />
        <KPI icon={<TrendingUp className="w-5 h-5" />} label="Revenue" value={usd(kpis.revenue)} />
        <KPI icon={<Zap className="w-5 h-5" />} label="Avg Margin" value={`${kpis.avgMarginPct.toFixed(1)}%`} />
        <KPI icon={<ShieldCheck className="w-5 h-5" />} label="Trust Score" value={`${kpis.trustScore}`} />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'overview' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('reflex')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'reflex' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Reflex Monitoring
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'analytics' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Analytics & Insights
        </button>
        <button
          onClick={() => setActiveTab('mvp')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'mvp' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          MVP Control
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'agents' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <Users className="w-4 h-4 mr-2 inline" />
          Agent Consensus
        </button>
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* EP Agent & MOAT Analytics Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-3">EP Agent Launch</h2>
              <p className="text-sm text-zinc-400 mb-4">Launch and manage EP agents</p>
              <button 
                onClick={() => window.location.href = '/ep-agent-launch'} 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg gap-2 flex items-center w-full justify-center"
              >
                <Rocket className="w-4 h-4" /> Launch EP Agent
              </button>
            </div>
            
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-3">MOAT Analytics</h2>
              <p className="text-sm text-zinc-400 mb-4">Advanced analytics and insights</p>
              <button 
                onClick={() => window.location.href = '/moat-analytics'} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg gap-2 flex items-center w-full justify-center"
              >
                <TrendingUp className="w-4 h-4" /> View Analytics
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 lg:col-span-2">
              <h2 className="text-lg font-medium mb-3">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusPill label="API" value="Healthy" intent="ok" />
                <StatusPill label="DB" value="Operational" intent="ok" />
                <StatusPill label="Reflex Loop" value={autoMonitor ? "Auto" : "Manual"} intent={autoMonitor ? "ok" : "warn"} />
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-3">Recent Activity</h2>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✔️ Reflex scan queued for {lounge}</li>
                <li>✔️ Profit CSV exported</li>
                <li>✔️ Deploy prepared for {env}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* REFLEX MONITORING */}
      {activeTab === 'reflex' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Reflex Monitoring</h2>
                <p className="text-sm text-zinc-400">Live trust pulses, calibration, and scans</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="auto-monitor" className="text-sm">Auto-Monitor</label>
                  <input
                    type="checkbox"
                    id="auto-monitor"
                    checked={autoMonitor}
                    onChange={(e) => setAutoMonitor(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-zinc-800 border-zinc-700 rounded focus:ring-purple-500 focus:ring-2"
                  />
                </div>
                <button onClick={runReflexScan} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg gap-2 flex items-center">
                  <Play className="w-4 h-4" /> Run Scan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800 p-4">
                <h3 className="text-sm font-medium mb-3">Trust Pulses</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trustSeries} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="t" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                      <YAxis domain={[60, 100]} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a" }} />
                      <Line type="monotone" dataKey="score" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800 p-4 space-y-3">
                <h3 className="text-sm font-medium">Controls</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg gap-2 flex items-center" onClick={startCalibration}>
                    <Zap className="w-4 h-4" /> Start Calibration
                  </button>
                  <button className="border border-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg gap-2 flex items-center" onClick={stopCalibration}>
                    <Pause className="w-4 h-4" /> Stop Calibration
                  </button>
                  <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg gap-2 flex items-center">
                    <RefreshCcw className="w-4 h-4" /> Replay Trust Echo
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">{trustLockEngaged ? "Trust Lock engaged. Payloads bound to verified state." : "Trust Lock inactive."}</p>
                  <div className={`px-3 py-1 rounded-full text-xs ${trustLockEngaged ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-700 text-zinc-100"}`}>{trustLockEngaged ? "ENGAGED" : "INACTIVE"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS & INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Profit Margins & Transparency</h2>
                <p className="text-sm text-zinc-400">Price vs. cost analytics, drift detection, and export</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="border border-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg gap-2 flex items-center" onClick={exportCSV}>
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl bg-zinc-950/40 border border-zinc-800 p-4">
                <h3 className="text-sm font-medium mb-3">Margin % by Item</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="item" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} contentStyle={{ background: "#09090b", border: "1px solid #27272a" }} />
                      <Bar dataKey="marginPct" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800 p-4 space-y-2">
                <h3 className="text-sm font-medium">Summary</h3>
                <p className="text-sm text-zinc-400">Total sold: <span className="text-zinc-200 font-medium">{totals.sold}</span></p>
                <p className="text-sm text-zinc-400">Gross: <span className="text-zinc-200 font-medium">{usd(totals.gross)}</span></p>
                <p className="text-sm text-zinc-400">Profit: <span className="text-zinc-200 font-medium">{usd(totals.profit)}</span></p>
                <div className="pt-2 text-xs text-zinc-400">Transparency: base price, add-ons, and lounge margin should be injected into Stripe metadata for auditability.</div>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900 text-zinc-300">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Item</th>
                    <th className="text-right px-4 py-2 font-medium">Sold</th>
                    <th className="text-right px-4 py-2 font-medium">Price</th>
                    <th className="text-right px-4 py-2 font-medium">Cost</th>
                    <th className="text-right px-4 py-2 font-medium">Margin</th>
                    <th className="text-right px-4 py-2 font-medium">Margin %</th>
                    <th className="text-right px-4 py-2 font-medium">Gross</th>
                    <th className="text-right px-4 py-2 font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                      <td className="px-4 py-2">{r.item}</td>
                      <td className="px-4 py-2 text-right">{r.sold}</td>
                      <td className="px-4 py-2 text-right">{usd(r.price)}</td>
                      <td className="px-4 py-2 text-right">{usd(r.cost)}</td>
                      <td className="px-4 py-2 text-right">{usd(r.margin)}</td>
                      <td className="px-4 py-2 text-right">{r.marginPct.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right">{usd(r.gross)}</td>
                      <td className="px-4 py-2 text-right">{usd(r.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MVP CONTROL */}
      {activeTab === 'mvp' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">MVP Control</h2>
                <p className="text-sm text-zinc-400">Deployment, readiness consensus, and environment controls</p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={env} 
                  onChange={(e) => setEnv(e.target.value as DeployState["env"])}
                  className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg"
                >
                  <option value="dev">Dev</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Prod</option>
                </select>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg gap-2 flex items-center" onClick={triggerDeploy}>
                  <Rocket className="w-4 h-4" /> Deploy
                </button>
                <button className="border border-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg gap-2 flex items-center" onClick={triggerRollback}>
                  <CornerDownLeft className="w-4 h-4" /> Rollback
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800 p-4">
                <h3 className="text-sm font-medium mb-2">Readiness Consensus</h3>
                <Gauge value={consensus} />
              </div>
              <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800 p-4 space-y-2">
                <h3 className="text-sm font-medium mb-2">Build Status</h3>
                <StatusPill label="Env" value={env.toUpperCase()} intent="ok" />
                <StatusPill label="Pipeline" value={deploy.buildStatus} intent={deploy.buildStatus === "failed" ? "error" : deploy.buildStatus === "success" ? "ok" : "warn"} />
                <StatusPill label="Version" value={deploy.version ?? "-"} intent="neutral" />
              </div>
              <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800 p-4">
                <h3 className="text-sm font-medium mb-2">Feature Checklist</h3>
                <ul className="space-y-2 text-sm">
                  <ChecklistItem label="Reflex Monitoring moved" checked />
                  <ChecklistItem label="Profit Margin Analysis moved" checked />
                  <ChecklistItem label="AdminNavHeader injected" checked />
                  <ChecklistItem label="Command Launcher wired" />
                  <ChecklistItem label="Stripe metadata transparency" />
                  <ChecklistItem label="Agent Consensus System" checked />
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AGENT CONSENSUS */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Agent Consensus System</h2>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚡</div>
              <p className="text-zinc-400 mb-4">Agent Consensus Dashboard</p>
              <p className="text-sm text-zinc-500">Real-time agent coordination and Reflex Score monitoring</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer quick actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <select 
            value={lounge} 
            onChange={(e) => setLounge(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg"
          >
            <option value="Pilot #001">Pilot #001</option>
            <option value="Pilot #002">Pilot #002</option>
            <option value="Pilot #003">Pilot #003</option>
          </select>
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg"
          >
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="This quarter">This quarter</option>
            <option value="Year to date">Year to date</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg gap-2 flex items-center" onClick={() => fetch("/api/admin/build", { method: "POST" })}>
            Build
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg gap-2 flex items-center" onClick={() => fetch("/api/admin/dev", { method: "POST" })}>
            Dev Run
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------
        Command Launcher / Agent Bindings (server side suggestion)
        cmd.register("admin.dev",     () => run("pnpm dev"));
        cmd.register("admin.build",   () => run("pnpm build"));
        cmd.register("admin.reflex.scan", (args) => http.post("/api/reflex/scan", args));
        cmd.register("admin.reflex.calibrate.start", (args) => http.post("/api/reflex/calibration/start", args));
        cmd.register("admin.reflex.calibrate.stop",  (args) => http.post("/api/reflex/calibration/stop", args));
        cmd.register("admin.deploy",   (args) => http.post("/api/deploy", args));
        cmd.register("admin.rollback", (args) => http.post("/api/deploy/rollback", args));
        cmd.register("admin.mvp.status", (args) => http.get("/api/mvp/status", args));
      ------------------------------------------------------------------ */}
    </div>
  );
}

// ---------------------------------
// Subcomponents
// ---------------------------------
function AdminNavHeader({ env, onEnvChange }: { env: DeployState["env"]; onEnvChange: (e: DeployState["env"]) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          className="border border-zinc-600 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg gap-2 flex items-center text-sm" 
          onClick={() => (window.location.href = "/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5" /> Admin Control Center
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <select 
          value={env} 
          onChange={(e) => onEnvChange(e.target.value as DeployState["env"])}
          className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm"
        >
          <option value="dev">Dev</option>
          <option value="staging">Staging</option>
          <option value="prod">Prod</option>
        </select>
        <button 
          className="bg-zinc-700 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg gap-2 flex items-center text-sm" 
          onClick={() => (window.location.href = "/admin")}
        >
          ⚙️ Admin
        </button>
      </div>
    </div>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-zinc-950 p-2 border border-zinc-800">{icon}</div>
        <div>
          <div className="text-xs text-zinc-400">{label}</div>
          <div className="text-lg font-semibold tracking-tight">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ label, value, intent = "neutral" as "ok" | "warn" | "error" | "neutral" }) {
  const map = {
    ok: "bg-emerald-500/15 text-emerald-300 border-emerald-700/30",
    warn: "bg-amber-500/15 text-amber-300 border-amber-700/30",
    error: "bg-rose-500/15 text-rose-300 border-rose-700/30",
    neutral: "bg-zinc-800 text-zinc-300 border-zinc-700",
  } as const;
  // @ts-ignore
  const cls = map[intent];
  return (
    <div className={`flex items-center justify-between border rounded-xl px-3 py-2 ${cls}`}>
      <span className="text-xs">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ChecklistItem({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {checked ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
      <span>{label}</span>
    </li>
  );
}

function Gauge({ value }: { value: number }) {
  // simple text gauge; replace with radial later
  const intent = value >= 80 ? "ok" : value >= 60 ? "warn" : "error";
  return <StatusPill label="Consensus" value={`${value}%`} intent={intent as any} />;
}
