'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  codigoIntentPatchHasValues,
  intentFromSearchParams,
  readStoredCodigoIntent,
  resolveCodigoIntent,
  intentToSearchParams,
  writeStoredCodigoIntent,
} from '@/lib/codigo/intent';

const DEVICE_ID_KEY = 'hp_codigo_device_id_v1';
const MEMBER_ID_KEY = 'hp_codigo_member_id_v1';

function getOrCreateDeviceId(): string {
  try {
    const existing = (localStorage.getItem(DEVICE_ID_KEY) || '').trim();
    if (existing) return existing;
    const next =
      (globalThis.crypto as any)?.randomUUID?.() ??
      `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }
}

function CodigoJoinInner() {
  const sp = useSearchParams();
  const [deviceId, setDeviceId] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = intentFromSearchParams(sp);
    if (codigoIntentPatchHasValues(fromUrl)) {
      writeStoredCodigoIntent(fromUrl);
    }
  }, [sp]);

  const privacyHref = useMemo(() => {
    const intent = resolveCodigoIntent(readStoredCodigoIntent(), intentFromSearchParams(sp));
    const q = intentToSearchParams(intent);
    return q ? `/codigo/privacy?${q}` : '/codigo/privacy';
  }, [sp]);

  useEffect(() => {
    const did = getOrCreateDeviceId();
    setDeviceId(did);
    const existingMemberId = (localStorage.getItem(MEMBER_ID_KEY) || '').trim();
    if (existingMemberId) setMemberId(existingMemberId);
  }, []);

  const canSubmit = useMemo(() => firstName.trim().length > 0 && !isSubmitting, [firstName, isSubmitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/codigo/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          nickname: nickname.trim() || null,
          deviceId,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(data?.error || 'Join failed');
        return;
      }
      const hid = String(data?.memberId || '').trim();
      if (!hid) {
        setError('Join succeeded but no memberId returned');
        return;
      }
      localStorage.setItem(MEMBER_ID_KEY, hid);
      setMemberId(hid);
    } catch (err: any) {
      setError(err?.message || 'Join failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/60 border-zinc-700/60">
          <CardHeader>
            <CardTitle className="text-2xl">CODIGO</CardTitle>
            <CardDescription className="text-zinc-300">
              Join in seconds. No phone number required.
            </CardDescription>
          </CardHeader>

          {!memberId ? (
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-200 mb-1">First name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-teal-500"
                    placeholder="Your first name"
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-200 mb-1">Nickname (optional)</label>
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-teal-500"
                    placeholder="What should we call you?"
                    autoComplete="nickname"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-300 bg-red-950/30 border border-red-800/50 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="text-xs text-zinc-500">
                  Pilot identity is stored on this device. You can add contact info later.
                </div>
              </CardContent>

              <CardFooter className="flex gap-3">
                <Button type="submit" disabled={!canSubmit} className="w-full">
                  {isSubmitting ? 'Joining…' : 'Join'}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <>
              <CardContent className="space-y-3">
                <div className="text-lg font-semibold">You’re in.</div>
                <div className="text-sm text-zinc-300">
                  Your member ID is ready.
                </div>
                <div className="text-xs text-zinc-500 break-all">memberId: {memberId}</div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button asChild className="w-full" data-testid="add-to-wallet">
                  <a href={`/api/codigo/wallet-card?memberId=${encodeURIComponent(memberId || '')}`} download="CODIGO-wallet.png">
                    Add to Wallet
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href={privacyHref}>Privacy & continue</a>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function CodigoJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-zinc-950 text-zinc-500 text-sm p-8">
          Loading…
        </div>
      }
    >
      <CodigoJoinInner />
    </Suspense>
  );
}
