'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

type KpiResponse = any;

function isoDayStart(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

export default function CodigoKpisPage() {
  const [password, setPassword] = useState('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<KpiResponse | null>(null);

  useEffect(() => {
    const now = new Date();
    const endIso = now.toISOString();
    const startIso = isoDayStart(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    setStart(startIso);
    setEnd(endIso);
    try {
      const saved = sessionStorage.getItem('codigo_kpi_password_v1') || '';
      if (saved) setPassword(saved);
    } catch {
      // ignore
    }
  }, []);

  const canLoad = useMemo(() => Boolean(password.trim() && start && end) && !loading, [password, start, end, loading]);

  async function load() {
    if (!canLoad) return;
    setLoading(true);
    setError(null);
    try {
      try {
        sessionStorage.setItem('codigo_kpi_password_v1', password.trim());
      } catch {
        // ignore
      }

      const url = `/api/codigo/kpis/public-summary?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
      const resp = await fetch(url, {
        headers: {
          'x-codigo-kpi-password': password.trim(),
        },
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setData(null);
        setError(json?.error || `HTTP ${resp.status}`);
        return;
      }
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-zinc-900/60 border-zinc-700/60">
          <CardHeader>
            <CardTitle className="text-2xl">CODIGO KPIs</CardTitle>
            <CardDescription className="text-zinc-300">
              Password-protected pilot KPI view (read-only).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-200 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-teal-500"
                placeholder="Shared pilot password"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-zinc-200 mb-1">Start (ISO)</label>
                <input
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-teal-500 font-mono text-xs"
                  placeholder="2026-02-26T00:00:00.000Z"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-200 mb-1">End (ISO)</label>
                <input
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-teal-500 font-mono text-xs"
                  placeholder="2026-03-01T23:59:59.000Z"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-300 bg-red-950/30 border border-red-800/50 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {data && (
              <div className="rounded-md border border-zinc-700 bg-zinc-950/40 px-3 py-3 space-y-3">
                <div className="text-xs text-zinc-400 font-mono">
                  window: {data?.window?.start} → {data?.window?.end}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-zinc-400">Sessions</div>
                    <div className="text-lg font-semibold">{data?.sessions?.count ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Member capture</div>
                    <div className="text-lg font-semibold">
                      {typeof data?.sessions?.memberCaptureRate === 'number'
                        ? `${Math.round(data.sessions.memberCaptureRate * 100)}%`
                        : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Profile completion</div>
                    <div className="text-lg font-semibold">
                      {typeof data?.profiles?.completionRate === 'number'
                        ? `${Math.round(data.profiles.completionRate * 100)}%`
                        : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Repeat rate</div>
                    <div className="text-lg font-semibold">
                      {typeof data?.repeat?.repeatRate === 'number'
                        ? `${Math.round(data.repeat.repeatRate * 100)}%`
                        : '—'}
                    </div>
                  </div>
                </div>

                <details className="text-xs text-zinc-300">
                  <summary className="cursor-pointer text-zinc-200">Raw JSON</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-zinc-300">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button onClick={load} disabled={!canLoad} className="w-full">
              {loading ? 'Loading…' : 'Load KPIs'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

