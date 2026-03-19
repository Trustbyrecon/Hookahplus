'use client';

/**
 * Intent resolver — runs after trust gates (/join, /privacy).
 * Reads session intent + URL, then continues the visit (party / preorder / guest hub).
 */

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  codigoIntentPatchHasValues,
  intentFromSearchParams,
  readStoredCodigoIntent,
  resolveCodigoIntent,
  writeStoredCodigoIntent,
  intentToSearchParams,
} from '@/lib/codigo/intent';

function ResolveInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [note, setNote] = useState('Resuming where you left off…');

  useEffect(() => {
    const fromUrl = intentFromSearchParams(sp);
    if (codigoIntentPatchHasValues(fromUrl)) {
      writeStoredCodigoIntent(fromUrl);
    }
    const stored = readStoredCodigoIntent();
    const intent = resolveCodigoIntent(stored, intentFromSearchParams(sp));

    if (intent.intent === 'party') {
      setNote('Joining your party…');
      router.replace(`/codigo/party-joined?${intentToSearchParams(intent)}`);
      return;
    }

    if (intent.intent === 'preorder') {
      setNote('Opening pre-order…');
      const table = intent.tableId || 'T-001';
      const lounge = intent.loungeId || 'CODIGO';
      const q = new URLSearchParams();
      q.set('lounge', lounge);
      if (intent.partyId) q.set('partyId', intent.partyId);
      if (intent.preorderId) q.set('preorderId', intent.preorderId);
      if (intent.hostMemberId) q.set('hostMemberId', intent.hostMemberId);
      router.replace(`/preorder/${encodeURIComponent(table)}?${q.toString()}`);
      return;
    }

    if (intent.intent === 'table' && intent.tableId) {
      setNote('Taking you to your table…');
      const lounge = intent.loungeId || 'CODIGO';
      router.replace(
        `/preorder/${encodeURIComponent(intent.tableId)}?lounge=${encodeURIComponent(lounge)}`
      );
      return;
    }

    setNote('Welcome — opening guest home…');
    router.replace('/codigo/guest');
  }, [router, sp]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-zinc-300">
      <Loader2 className="h-10 w-10 animate-spin text-teal-400" aria-hidden />
      <p className="text-sm">{note}</p>
    </div>
  );
}

export default function CodigoResolvePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        </div>
      }
    >
      <ResolveInner />
    </Suspense>
  );
}
