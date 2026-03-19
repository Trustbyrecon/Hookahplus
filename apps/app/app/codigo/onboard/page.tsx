'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Flame, ChevronRight, CheckCircle, Shield, User } from 'lucide-react';
import { codigoIntentPatchHasValues, intentFromSearchParams, writeStoredCodigoIntent } from '@/lib/codigo/intent';

const DEVICE_ID_KEY = 'hp_codigo_device_id_v1';
const MEMBER_ID_KEY = 'hp_codigo_member_id_v1';
const ONBOARDED_KEY = 'hp_codigo_onboarded_v1';

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

type Step = 1 | 2 | 3;

function CodigoOnboardInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [deviceId, setDeviceId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [portabilityOptIn, setPortabilityOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = intentFromSearchParams(sp);
    if (codigoIntentPatchHasValues(fromUrl)) {
      writeStoredCodigoIntent(fromUrl);
    }
  }, [sp]);

  useEffect(() => {
    const did = getOrCreateDeviceId();
    setDeviceId(did);
    const existing = (localStorage.getItem(MEMBER_ID_KEY) || '').trim();
    const alreadyOnboarded = localStorage.getItem(ONBOARDED_KEY) === 'true';
    if (existing) setMemberId(existing);
    if (alreadyOnboarded && existing) {
      router.replace('/codigo/resolve');
    }
  }, [router]);

  const canProceedStep1 = useMemo(() => firstName.trim().length > 0 && !isSubmitting, [firstName, isSubmitting]);

  async function handleStep1Submit(e: React.FormEvent) {
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
        setError('No member ID returned');
        return;
      }
      localStorage.setItem(MEMBER_ID_KEY, hid);
      setMemberId(hid);
      setStep(2);
    } catch (err: any) {
      setError(err?.message || 'Join failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/codigo/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, deviceId, portabilityOptIn }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to save');
      setStep(3);
    } catch (e: any) {
      setError(e?.message || 'Failed to save consent');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEnterExperience() {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    router.push('/codigo/resolve');
  }

  // Already has memberId from prior visit — skip to step 2 or 3
  useEffect(() => {
    if (memberId && step === 1) {
      setStep(2);
    }
  }, [memberId, step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step >= s ? 'bg-teal-600 text-white' : 'bg-zinc-800 text-zinc-500',
                ].join(' ')}
              >
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <ChevronRight className="w-4 h-4 text-zinc-600" />}
            </React.Fragment>
          ))}
        </div>

        <Card className="bg-zinc-900/60 border-zinc-700/60">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              {step === 1 && <User className="w-5 h-5 text-teal-400" />}
              {step === 2 && <Shield className="w-5 h-5 text-teal-400" />}
              {step === 3 && <Flame className="w-5 h-5 text-teal-400" />}
              {step === 1 && 'Step 1: Join'}
              {step === 2 && 'Step 2: Privacy'}
              {step === 3 && 'Step 3: Ready'}
            </CardTitle>
            <CardDescription className="text-zinc-300">
              {step === 1 && 'Create your CODIGO identity. One-time setup.'}
              {step === 2 && 'Control how your data is used across venues.'}
              {step === 3 && 'You’re all set. Enter the CODIGO experience.'}
            </CardDescription>
          </CardHeader>

          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
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
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={!canProceedStep1} className="w-full">
                  {isSubmitting ? 'Joining…' : 'Continue'}
                </Button>
              </CardFooter>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <CardContent className="space-y-4">
                <div className="text-xs text-zinc-500 break-all">memberId: {memberId}</div>
                <div className="rounded-md border border-zinc-700 bg-zinc-950/40 px-3 py-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={portabilityOptIn}
                      onChange={(e) => setPortabilityOptIn(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-teal-500"
                    />
                    <div>
                      <div className="text-sm text-zinc-100">Enable cross-lounge recognition (opt-in)</div>
                      <div className="text-xs text-zinc-400">
                        Off by default. If enabled, network-scoped memory can be used where supported.
                      </div>
                    </div>
                  </label>
                </div>
                {error && (
                  <div className="text-sm text-red-300 bg-red-950/30 border border-red-800/50 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Saving…' : 'Continue'}
                </Button>
              </CardFooter>
            </form>
          )}

          {step === 3 && (
            <>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-950/30 border border-teal-800/50">
                  <CheckCircle className="w-8 h-8 text-teal-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">You're all set</div>
                    <div className="text-sm text-zinc-300">
                      Your member ID is ready. This was a one-time setup.
                    </div>
                  </div>
                </div>
                <div className="text-xs text-zinc-500 break-all">memberId: {memberId}</div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleEnterExperience} className="w-full" size="lg">
                  <Flame className="w-4 h-4 mr-2" />
                  Enter CODIGO experience
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-zinc-500">
          <Link href="/codigo/privacy" className="hover:text-zinc-400 underline">
            Privacy & data controls
          </Link>
          {' · '}
          <Link href="/codigo/operator" className="hover:text-zinc-400 underline">
            Skip to Floor (staff)
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CodigoOnboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-sm">
          Loading…
        </div>
      }
    >
      <CodigoOnboardInner />
    </Suspense>
  );
}
