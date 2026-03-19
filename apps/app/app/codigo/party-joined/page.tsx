'use client';

/**
 * Emotional + context anchor after party intent — before pre-order / menu / arrival CTAs.
 */

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Sparkles, UtensilsCrossed, MapPin, ShoppingBag } from 'lucide-react';
import {
  intentFromSearchParams,
  intentToSearchParams,
  readStoredCodigoIntent,
  resolveCodigoIntent,
} from '@/lib/codigo/intent';

function PartyJoinedInner() {
  const sp = useSearchParams();
  const intent = resolveCodigoIntent(readStoredCodigoIntent(), intentFromSearchParams(sp));

  const host = intent.hostName || 'Your host';
  const section = intent.section || '—';
  const partyId = intent.partyId || '—';
  const tableId = intent.tableId || 'T-001';
  const lounge = intent.loungeId || 'CODIGO';
  const guestsLine = intent.guestsJoined || 'Party linked';

  const preorderHref = `/preorder/${encodeURIComponent(tableId)}?lounge=${encodeURIComponent(lounge)}&partyId=${encodeURIComponent(intent.partyId || '')}${intent.preorderId ? `&preorderId=${encodeURIComponent(intent.preorderId)}` : ''}${intent.hostMemberId ? `&hostMemberId=${encodeURIComponent(intent.hostMemberId)}` : ''}`;

  const intentQs = intentToSearchParams(intent);

  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="border-teal-500/30 bg-zinc-900/70">
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-300">
              <Sparkles className="h-7 w-7" />
              <CardTitle className="text-2xl">You&apos;re in</CardTitle>
            </div>
            <CardDescription className="text-zinc-300">
              You&apos;re linked to this party. Choose what to do next.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border border-zinc-700 bg-zinc-950/50 p-4 space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Host</span>
                <span className="font-medium text-white text-right">{host}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Section</span>
                <span className="text-zinc-200 text-right">{section}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Party</span>
                <span className="font-mono text-xs text-zinc-400 break-all text-right">{partyId}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Table (for pre-order)</span>
                <span className="text-teal-300 font-medium">{tableId}</span>
              </div>
              <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">{guestsLine}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href={preorderHref}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue to pre-order
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href={`/codigo/guest?${intentQs}`}>
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                View menu (guest hub)
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-zinc-600 text-zinc-200">
              <Link href="/codigo/operator">
                <MapPin className="h-4 w-4 mr-2" />
                I&apos;ve arrived — floor view
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function CodigoPartyJoinedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center text-zinc-500 text-sm">Loading…</div>
      }
    >
      <PartyJoinedInner />
    </Suspense>
  );
}
