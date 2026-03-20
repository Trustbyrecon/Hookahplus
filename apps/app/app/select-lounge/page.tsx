'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Loader2, ArrowRight, Flame } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase-client';

const SELECT_ALL = '__all_locations__';

type LoungeRow = { loungeId: string; name: string; role: string };

/** Pilot venue — always offer in the picker even if not yet on operator-context API. */
const CODIGO_PILOT_LOUNGE: LoungeRow = {
  loungeId: 'CODIGO',
  name: 'District Hookah',
  role: 'CODIGO',
};

function withCodigoPilotOption(lounges: LoungeRow[]): LoungeRow[] {
  const hasCodigo = lounges.some((l) => l.loungeId === 'CODIGO');
  const merged = hasCodigo ? [...lounges] : [...lounges, CODIGO_PILOT_LOUNGE];
  return merged.length > 0 ? merged : [CODIGO_PILOT_LOUNGE];
}

function optionLabel(l: LoungeRow): string {
  if (l.loungeId === 'CODIGO') return 'District Hookah: CODIGO';
  return `${l.name} (${l.role})`;
}

function SelectLoungeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get('next') || '/fire-session-dashboard';
  const nextPath = nextRaw.startsWith('/') ? nextRaw : `/${nextRaw}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lounges, setLounges] = useState<LoungeRow[]>([]);
  const [allowOrgWide, setAllowOrgWide] = useState(false);
  const [choice, setChoice] = useState<string>(SELECT_ALL);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setError(null);
      setLounges([]);
      setAllowOrgWide(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/me/operator-context', { credentials: 'include' });
        if (res.status === 401) {
          const back = `/select-lounge?next=${encodeURIComponent(nextPath)}`;
          router.replace(`/login?redirect=${encodeURIComponent(back)}`);
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!data.success) {
          setError(data.error || 'Could not load locations');
          setLounges([]);
          setAllowOrgWide(true);
          return;
        }
        const rawList: LoungeRow[] = data.lounges || [];
        setLounges(rawList);
        const aw = Boolean(data.allowOrgWide);
        setAllowOrgWide(aw);
        const list = withCodigoPilotOption(rawList);
        if (list.length === 0) {
          setChoice(SELECT_ALL);
        } else if (list.length === 1) {
          setChoice(list[0].loungeId);
        } else if (aw) {
          setChoice(SELECT_ALL);
        } else {
          setChoice(list[0].loungeId);
        }
      } catch {
        if (!cancelled) {
          setError('Network error');
          setAllowOrgWide(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, nextPath]);

  const loungesForSelect = withCodigoPilotOption(lounges);

  const applyAndGo = () => {
    setSubmitting(true);
    try {
      if (typeof window !== 'undefined') {
        if (choice === SELECT_ALL) {
          localStorage.setItem('active_lounge', SELECT_ALL);
        } else {
          localStorage.setItem('active_lounge', choice);
        }
      }
      // District Hookah pilot → Fire Session Dashboard, Floor tab (not /codigo guest hub)
      if (choice === 'CODIGO') {
        router.replace('/fire-session-dashboard?lounge=CODIGO&loungeIds=CODIGO&tab=floor');
        return;
      }
      router.replace(nextPath);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-700 rounded-xl p-8 shadow-xl">
          <p className="text-zinc-300 text-sm mb-4">Auth is not configured. Continue without choosing a location.</p>
          <Link
            href={nextPath}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-medium"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <Flame className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Where are you working?</h1>
              <p className="text-sm text-zinc-400">Choose a location for this session. You can change it anytime in the dashboard.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-sm">
                  {error}
                </div>
              )}

              {loungesForSelect.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-400">
                    No locations available. Try again or contact support.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lounges.length === 0 && (
                    <p className="text-sm text-zinc-400">
                      No operator locations are linked to this account yet. You can still open the{' '}
                      <span className="text-zinc-300">District Hookah (CODIGO)</span> pilot below, or complete
                      LaunchPad to provision a lounge.
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-zinc-300 text-sm">
                    <Building2 className="w-4 h-4 text-teal-400" />
                    <span>Active location</span>
                  </div>
                  <select
                    value={choice}
                    onChange={(e) => setChoice(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {allowOrgWide && (
                      <option value={SELECT_ALL}>All locations (org-wide)</option>
                    )}
                    {loungesForSelect.map((l) => (
                      <option key={l.loungeId} value={l.loungeId}>
                        {optionLabel(l)}
                      </option>
                    ))}
                  </select>
                  {!allowOrgWide && loungesForSelect.length > 1 && (
                    <p className="text-xs text-zinc-500">Org-wide view unlocks when you have multiple locations or an owner/admin role.</p>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={applyAndGo}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 rounded-lg font-medium transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Continue
              </button>

              <p className="mt-4 text-xs text-zinc-500 text-center">
                After: <code className="text-zinc-400">{nextPath}</code>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SelectLoungePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      }
    >
      <SelectLoungeContent />
    </Suspense>
  );
}
