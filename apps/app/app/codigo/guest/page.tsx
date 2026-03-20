'use client';

/**
 * Default landing when there’s no specific entry intent — guest choices without FSD.
 */

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { QrCode, ShoppingBag, Users, ArrowRight } from 'lucide-react';
import {
  appendIntentToPath,
  intentFromSearchParams,
  readStoredCodigoIntent,
  resolveCodigoIntent,
  intentToSearchParams,
} from '@/lib/codigo/intent';

function GuestHubInner() {
  const sp = useSearchParams();
  const intent = resolveCodigoIntent(readStoredCodigoIntent(), intentFromSearchParams(sp));
  const qs = intentToSearchParams(intent);
  const withIntent = (path: string) => appendIntentToPath(path, intent);
  const preorderResume = resolveCodigoIntent(readStoredCodigoIntent(), {
    ...intentFromSearchParams(sp),
    intent: 'preorder',
    tableId: intent.tableId || 'T-001',
    loungeId: intent.loungeId || 'CODIGO',
  });
  const preorderResolveHref = `/codigo/resolve?${intentToSearchParams(preorderResume)}`;

  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="border-zinc-700/60 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription className="text-zinc-300">
              Pick what you&apos;re here to do. Staff can use Floor from the bar above.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            {qs && (
              <p className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-500">
                Context from your link is saved for this visit.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href={withIntent('/codigo/join')}>
                <Users className="h-4 w-4 mr-2" />
                Join a table
                <ArrowRight className="h-4 w-4 ml-auto opacity-70" />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href={preorderResolveHref}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Start a pre-order
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-zinc-600 text-zinc-200">
              <Link href={withIntent('/codigo/join')}>
                <QrCode className="h-4 w-4 mr-2" />
                I have a QR / invite link
              </Link>
            </Button>
            <p className="text-xs text-zinc-500 text-center pt-1">
              Operators:{' '}
              <Link
                href="/fire-session-dashboard?lounge=CODIGO&loungeIds=CODIGO&tab=floor"
                className="text-teal-400 hover:underline"
              >
                Open Floor (Fire Session)
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function CodigoGuestHubPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center text-zinc-500 text-sm">Loading…</div>
      }
    >
      <GuestHubInner />
    </Suspense>
  );
}
