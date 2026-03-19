"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Flame,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react";
import GlobalNavigation from "../../../components/GlobalNavigation";
import { SELECT_ALL_LOCATIONS } from "../../../lib/admin-lounge-scope";

type AnalyticsSummary = {
  success: boolean;
  overview: {
    revenueCents: number;
    revenueChangePct: number | null;
    sessionCount: number;
    sessionChangePct: number | null;
    distinctGuests: number;
    avgDurationMinutes: number;
    activeSessionsNow: number;
  };
  revenue: { totalCents: number; avgPerSessionCents: number; dailyAvgCents: number };
  sessions: { total: number; avgDurationMinutes: number };
  users: { totalDistinctGuests: number; activeInRange: number; inactive: number };
  topFlavors: Array<{ name: string; count: number; revenueCents: number }>;
  tablePerformance: Array<{
    table: string;
    sessions: number;
    revenueCents: number;
    avgDurationMinutes: number;
  }>;
  error?: string;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [viewMode, setViewMode] = useState("overview");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeRanges = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "1y", label: "1 Year" },
  ];

  const viewModes = [
    { value: "overview", label: "Overview" },
    { value: "revenue", label: "Revenue" },
    { value: "sessions", label: "Sessions" },
    { value: "users", label: "Users" },
    { value: "performance", label: "Performance" },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("active_lounge") : null;
      const params = new URLSearchParams({ range: timeRange });
      if (raw && raw !== SELECT_ALL_LOCATIONS) params.set("loungeId", raw);
      const r = await fetch(`/api/admin/analytics-summary?${params.toString()}`);
      const j = await r.json();
      if (!r.ok || !j.success) {
        setError(j.error || "Failed to load analytics");
        setData(null);
        return;
      }
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    load();
  }, [load]);

  const fmtMoney = (cents: number) =>
    `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const fmtPct = (p: number | null) => {
    if (p == null) return "—";
    const sign = p >= 0 ? "+" : "";
    return `${sign}${p}%`;
  };

  const o = data?.overview;
  const rev = data?.revenue;
  const sess = data?.sessions;
  const usr = data?.users;

  const renderOverview = () => (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">
                {loading ? "…" : fmtMoney(rev?.totalCents ?? 0)}
              </div>
              <div className="text-sm text-zinc-400">Revenue ({timeRange})</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-sm text-zinc-400">vs prior period: {fmtPct(o?.revenueChangePct ?? null)}</div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{loading ? "…" : sess?.total ?? 0}</div>
              <div className="text-sm text-zinc-400">Sessions</div>
            </div>
            <Flame className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-sm text-zinc-400">vs prior: {fmtPct(o?.sessionChangePct ?? null)}</div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{loading ? "…" : usr?.totalDistinctGuests ?? 0}</div>
              <div className="text-sm text-zinc-400">Distinct guests (HID)</div>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-sm text-zinc-400">Active on floor now: {o?.activeSessionsNow ?? 0}</div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">
                {loading ? "…" : `${o?.avgDurationMinutes ?? 0} min`}
              </div>
              <div className="text-sm text-zinc-400">Avg duration</div>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-pretty p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue trend</h3>
          <div className="h-64 bg-zinc-800/50 rounded-lg flex items-center justify-center">
            <div className="text-center text-zinc-400 text-sm px-4">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              Totals for selected range are shown above. Granular charts can be added from event data.
            </div>
          </div>
        </div>
        <div className="card-pretty p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Session activity</h3>
          <div className="h-64 bg-zinc-800/50 rounded-lg flex items-center justify-center">
            <div className="text-center text-zinc-400 text-sm px-4">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              {loading ? "Loading…" : `${sess?.total ?? 0} sessions in range`}
            </div>
          </div>
        </div>
      </div>

      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top flavors (paid sessions)</h3>
        <div className="space-y-3">
          {(data?.topFlavors?.length ? data.topFlavors : []).map((flavor, index) => (
            <div key={flavor.name + index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-teal-400">#{index + 1}</span>
                </div>
                <div>
                  <div className="text-white font-medium">{flavor.name}</div>
                  <div className="text-sm text-zinc-400">{flavor.count} sessions</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{fmtMoney(flavor.revenueCents)}</div>
                <div className="text-sm text-zinc-400">revenue</div>
              </div>
            </div>
          ))}
          {!loading && (!data?.topFlavors || data.topFlavors.length === 0) && (
            <p className="text-zinc-500 text-sm">No flavor breakdown in this range yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{fmtMoney(rev?.totalCents ?? 0)}</div>
            <div className="text-sm text-zinc-400">Total ({timeRange})</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              {fmtMoney(rev?.avgPerSessionCents ?? 0)}
            </div>
            <div className="text-sm text-zinc-400">Avg per paid session</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{fmtMoney(rev?.dailyAvgCents ?? 0)}</div>
            <div className="text-sm text-zinc-400">Daily average (in range)</div>
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-500">vs prior period: {fmtPct(o?.revenueChangePct ?? null)}</p>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-2xl font-bold text-white mb-2">{sess?.total ?? 0}</div>
            <div className="text-sm text-zinc-400">Sessions in range</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-2">{sess?.avgDurationMinutes ?? 0} min</div>
            <div className="text-sm text-zinc-400">Average duration (where recorded)</div>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-400">Live floor sessions now: {o?.activeSessionsNow ?? 0}</p>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Guest reach</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-white mb-2">{usr?.totalDistinctGuests ?? 0}</div>
            <div className="text-sm text-zinc-400">Distinct guests (HID) in range</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400 mb-2">{usr?.activeInRange ?? 0}</div>
            <div className="text-sm text-zinc-400">Same as distinct (pilot metric)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400 mb-2">{usr?.inactive ?? 0}</div>
            <div className="text-sm text-zinc-400">Reserved</div>
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Staff accounts are listed under Admin → User Management (tenant members).
        </p>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Table performance (paid sessions)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Table</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Sessions</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Revenue</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Avg duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {(data?.tablePerformance ?? []).map((row) => (
                <tr key={row.table} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-white font-medium">{row.table}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.sessions}</td>
                  <td className="px-4 py-3 text-zinc-300">{fmtMoney(row.revenueCents)}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.avgDurationMinutes} min</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && (!data?.tablePerformance || data.tablePerformance.length === 0) && (
            <p className="p-4 text-zinc-500 text-sm">No table-level paid sessions in this range yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case "overview":
        return renderOverview();
      case "revenue":
        return renderRevenue();
      case "sessions":
        return renderSessions();
      case "users":
        return renderUsers();
      case "performance":
        return renderPerformance();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-xl text-zinc-400">Live metrics from your database (scoped by active lounge when set)</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => load()} className="btn-pretty-secondary inline-flex items-center">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button type="button" className="btn-pretty-outline inline-flex items-center opacity-50 cursor-not-allowed" disabled title="Export coming soon">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setViewMode(mode.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode.value ? "bg-teal-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
