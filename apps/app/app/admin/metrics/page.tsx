"use client";

import React, { useEffect, useState } from 'react';
import GlobalNavigation from '../../../components/GlobalNavigation';
import { Flame, DollarSign, Clock, RefreshCw, Coffee, Percent, Zap } from 'lucide-react';

interface AnalyticsResponse {
  success: boolean;
  metrics: {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    revenue: number;
    extensionCount: number;
    refillCount: number;
    avgDurationMinutes: number;
    windowDays: number;
    timeBasedSessions: number;
    timeBasedShare: number;
    timeBasedAvgDurationMinutes: number;
    refillSessionCount: number;
    globalRefillRate: number;
  };
}

export default function MetricsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/analytics/sessions?windowDays=7');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setData(json);
    } catch (err) {
      console.error('[MetricsPage] Failed to load analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const metrics = data?.metrics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Pilot Metrics</h1>
            <p className="text-sm text-zinc-400">
              Operator-first view of sessions, time-based adoption, and refills (last 7 days).
            </p>
          </div>
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm border border-zinc-700 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!metrics && !error && (
          <div className="py-12 text-center text-zinc-400">
            {loading ? 'Loading metrics…' : 'No data available yet.'}
          </div>
        )}

        {metrics && (
          <div className="space-y-8">
            {/* Core session engine health */}
            <section>
              <h2 className="mb-3 text-lg font-semibold">Session Engine</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Total Sessions</span>
                    <Flame className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold">{metrics.totalSessions}</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Active: {metrics.activeSessions} • Closed: {metrics.completedSessions}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Revenue (captured)</span>
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold">
                    ${metrics.revenue.toFixed(2)}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Based on sessions with succeeded payments.
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Avg Session Length</span>
                    <Clock className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.avgDurationMinutes.toFixed(1)} min
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Closed sessions only, last {metrics.windowDays} days.
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Reflex Events</span>
                    <Zap className="h-4 w-4 text-teal-400" />
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.extensionCount + metrics.refillCount}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Extensions + refills tracked by Reflex.
                  </p>
                </div>
              </div>
            </section>

            {/* Time-based vs flat & refills */}
            <section>
              <h2 className="mb-3 text-lg font-semibold">Time-Based & Refills</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Time-Based Share</span>
                    <Percent className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold">
                    {(metrics.timeBasedShare * 100).toFixed(1)}%
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {metrics.timeBasedSessions} of {metrics.totalSessions} sessions.
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Avg Time-Based Length</span>
                    <Clock className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.timeBasedAvgDurationMinutes.toFixed(1)} min
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Closed TIME_BASED sessions.
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Refill Rate</span>
                    <Coffee className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="text-2xl font-bold">
                    {(metrics.globalRefillRate * 100).toFixed(1)}%
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {metrics.refillSessionCount} sessions had at least one refill.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}


