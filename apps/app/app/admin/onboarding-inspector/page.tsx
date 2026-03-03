'use client';

import React, { useMemo, useState } from 'react';
import GlobalNavigation from '../../../components/GlobalNavigation';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { Search, ClipboardCopy, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function OnboardingInspectorPage() {
  const [token, setToken] = useState('');
  const [sid, setSid] = useState('');
  const [includeChecklist, setIncludeChecklist] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (token.trim()) params.set('token', token.trim());
    if (!token.trim() && sid.trim()) params.set('sid', sid.trim());
    if (includeChecklist) params.set('includeChecklist', '1');
    return params.toString();
  }, [token, sid, includeChecklist]);

  const runLookup = async () => {
    setError(null);
    setData(null);
    if (!token.trim() && !sid.trim()) {
      setError('Enter a SetupSession token or Stripe checkout session id (sid).');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`/api/admin/setup-session?${query}`);
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok || !json?.success) {
        throw new Error(json?.error || json?.details || `Request failed (${resp.status})`);
      }
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs className="mb-6" />

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Onboarding Inspector</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Lookup a LaunchPad `SetupSession` and see owner→locations mapping, provisioning status, and readiness.
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">SetupSession token</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950/40 border border-zinc-700 rounded text-sm text-white"
                placeholder="hex token"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Stripe checkout session id (sid)</label>
              <input
                value={sid}
                onChange={(e) => setSid(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950/40 border border-zinc-700 rounded text-sm text-white"
                placeholder="cs_..."
              />
              <div className="text-[11px] text-zinc-500 mt-1">If token is filled, sid is ignored.</div>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-300 mb-2 md:mb-0">
                <input
                  type="checkbox"
                  checked={includeChecklist}
                  onChange={(e) => setIncludeChecklist(e.target.checked)}
                  className="w-4 h-4"
                />
                Include checklist
              </label>
              <button
                onClick={runLookup}
                disabled={loading}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-700 rounded text-sm font-medium"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Searching…' : 'Lookup'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-600/40 rounded text-sm text-red-200 flex gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
        </div>

        {data?.success && (
          <div className="mt-6 space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-semibold text-white">Session</div>
                <span className="text-xs text-zinc-400">status: {data.session?.status || '—'}</span>
                <span className="text-xs text-zinc-400">source: {data.session?.source || '—'}</span>
                {data.derived?.isExpired ? (
                  <span className="text-xs px-2 py-0.5 rounded border bg-amber-900/20 border-amber-600/40 text-amber-200">expired</span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded border bg-green-900/20 border-green-600/40 text-green-200">active</span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">token</span>
                  <span className="font-mono break-all">{data.session?.token}</span>
                  <button
                    className="ml-auto text-zinc-400 hover:text-white"
                    onClick={() => copy(String(data.session?.token || ''))}
                    title="Copy token"
                  >
                    <ClipboardCopy className="w-4 h-4" />
                  </button>
                </div>
                <div><span className="text-zinc-500">expiresAt</span> {data.session?.expiresAt || '—'}</div>
                <div><span className="text-zinc-500">organizationSlug</span> {data.session?.organizationSlug || '—'}</div>
                <div><span className="text-zinc-500">multiLocationEnabled</span> {String(Boolean(data.session?.multiLocationEnabled))}</div>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <div className="font-semibold text-white mb-2">
                Locations ({data.derived?.draftLocationCount || 0} drafts / {data.derived?.provisionedLocationCount || 0} provisioned)
              </div>

              <div className="space-y-2">
                {(data.locations || []).map((loc: any, idx: number) => {
                  const score = loc.readiness?.score;
                  const ok = typeof score?.ok === 'number' ? score.ok : null;
                  const total = typeof score?.total === 'number' ? score.total : null;
                  const ready = ok !== null && total !== null && ok === total;

                  return (
                    <div key={`${idx}-${loc.loungeId || loc.name}`} className="bg-zinc-950/30 border border-zinc-800 rounded px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium text-white">{loc.name || `Location ${idx + 1}`}</div>
                        {loc.loungeId && (
                          <span className="text-[11px] px-2 py-0.5 rounded border bg-teal-900/20 border-teal-600/40 text-teal-200">
                            provisioned
                          </span>
                        )}
                        {ok !== null && total !== null && (
                          <span className={`text-[11px] px-2 py-0.5 rounded border ${ready ? 'bg-green-900/20 border-green-600/40 text-green-200' : 'bg-amber-900/20 border-amber-600/40 text-amber-200'}`}>
                            Ready {ok}/{total}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {loc.tablesCount ? `${loc.tablesCount} tables` : 'Tables: —'}
                        {typeof loc.sectionsCount === 'number' ? ` • ${loc.sectionsCount} sections` : ''}
                        {loc.loungeId ? ` • ${loc.loungeId}` : ''}
                      </div>

                      {includeChecklist && Array.isArray(loc.readiness?.checklist) && loc.readiness.checklist.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs">
                          {loc.readiness.checklist.map((c: any) => (
                            <li key={c.id} className="flex items-start gap-2 text-zinc-300">
                              <span className="mt-0.5">{c.ok ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <span className="w-4 h-4 inline-block" />}</span>
                              <div>
                                <div className="text-white">{c.label}</div>
                                <div className="text-zinc-500">{c.detail}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <details className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <summary className="cursor-pointer text-sm text-zinc-300">Raw progress JSON</summary>
              <pre className="mt-3 text-xs text-zinc-300 whitespace-pre-wrap break-words">
                {JSON.stringify(data.progress || {}, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

