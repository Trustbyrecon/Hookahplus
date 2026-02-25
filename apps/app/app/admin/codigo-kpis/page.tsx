'use client';

import React, { useEffect, useMemo, useState } from 'react';
import GlobalNavigation from '../../../components/GlobalNavigation';
import { RefreshCw } from 'lucide-react';

type CodigoKpiSummary = {
  loungeId: string;
  window: { start: string; end: string };
  sessions: { count: number; withMember: number; memberCaptureRate: number | null };
  premium: {
    definition: string | null;
    premiumSessions: number | null;
    attachmentRate: number | null;
  };
  duration: { method: string; avgSeconds: number | null; coverageSessions: number };
  idleTime: { method: string; avgSeconds: number | null; medianSeconds: number | null; samples: number };
  profiles: { capturedMembers: number; completed: number; completionRate: number | null };
  repeat: { members: number; repeaters: number; repeatRate: number | null };
};

function toDateInputValue(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function percentOrDash(v: number | null): string {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return `${(v * 100).toFixed(1)}%`;
}

function minutesOrDashFromSeconds(v: number | null): string {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return `${(v / 60).toFixed(1)} min`;
}

export default function CodigoKpisAdminPage() {
  const now = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)));
  const [endDate, setEndDate] = useState(() => toDateInputValue(now));
  const [data, setData] = useState<CodigoKpiSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const startIso = new Date(`${startDate}T00:00:00.000Z`).toISOString();
      const endIso = new Date(`${endDate}T23:59:59.999Z`).toISOString();

      const res = await fetch(`/api/codigo/kpis/summary?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      setData(json as CodigoKpiSummary);
    } catch (err) {
      console.error('[Admin CODIGO KPIs] Failed to load:', err);
      setError(err instanceof Error ? err.message : 'Failed to load KPIs');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">CODIGO — Pilot KPIs</h1>
            <p className="text-sm text-zinc-400">Minimal KPI summary for the pilot window.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">End</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm border border-zinc-700 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!data && !error && (
          <div className="py-12 text-center text-zinc-400">
            {loading ? 'Loading KPIs…' : 'No data available yet.'}
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-lg font-semibold">Core</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Sessions</div>
                  <div className="text-2xl font-bold">{data.sessions.count}</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Window: {new Date(data.window.start).toLocaleDateString()} – {new Date(data.window.end).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Member capture rate</div>
                  <div className="text-2xl font-bold">{percentOrDash(data.sessions.memberCaptureRate)}</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {data.sessions.withMember} of {data.sessions.count} sessions linked
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Profile completion</div>
                  <div className="text-2xl font-bold">{percentOrDash(data.profiles.completionRate)}</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {data.profiles.completed} of {data.profiles.capturedMembers} captured members
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Repeat rate</div>
                  <div className="text-2xl font-bold">{percentOrDash(data.repeat.repeatRate)}</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {data.repeat.repeaters} repeaters of {data.repeat.members} members
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Operational</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Avg session duration</div>
                  <div className="text-2xl font-bold">{minutesOrDashFromSeconds(data.duration.avgSeconds)}</div>
                  <p className="mt-1 text-xs text-zinc-500">{data.duration.coverageSessions} sessions with durationSecs</p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Idle time (avg)</div>
                  <div className="text-2xl font-bold">{minutesOrDashFromSeconds(data.idleTime.avgSeconds)}</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    median: {minutesOrDashFromSeconds(data.idleTime.medianSeconds)} • samples: {data.idleTime.samples}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">Premium attachment</div>
                  <div className="text-2xl font-bold">{percentOrDash(data.premium.attachmentRate)}</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {data.premium.definition ? data.premium.definition : 'Not configured'}
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

