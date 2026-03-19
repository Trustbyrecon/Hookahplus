'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

type HidProfile = {
  hid: string;
  consentLevel: string;
  tier?: string;
};

function CodigoPrivacyInner() {
  const sp = useSearchParams();
  const [deviceId, setDeviceId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [profile, setProfile] = useState<HidProfile | null>(null);
  const [portabilityOptIn, setPortabilityOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = intentFromSearchParams(sp);
    if (codigoIntentPatchHasValues(fromUrl)) {
      writeStoredCodigoIntent(fromUrl);
    }
  }, [sp]);

  const resolveHref = useMemo(() => {
    const intent = resolveCodigoIntent(readStoredCodigoIntent(), intentFromSearchParams(sp));
    const q = intentToSearchParams(intent);
    return q ? `/codigo/resolve?${q}` : '/codigo/resolve';
  }, [sp]);

  useEffect(() => {
    const did = (localStorage.getItem(DEVICE_ID_KEY) || '').trim();
    const hid = (localStorage.getItem(MEMBER_ID_KEY) || '').trim();
    setDeviceId(did);
    setMemberId(hid);
  }, []);

  const canAct = useMemo(() => Boolean(deviceId && memberId) && !loading, [deviceId, memberId, loading]);

  const loadProfile = async () => {
    if (!memberId) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/hid/resolve?hid=${encodeURIComponent(memberId)}&scope=network`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      const p = json?.profile as HidProfile | undefined;
      if (!p?.hid) throw new Error('Profile not found');
      setProfile(p);
      setPortabilityOptIn(p.consentLevel === 'network_shared');
    } catch (e: any) {
      setProfile(null);
      setError(e?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load after memberId is available.
    if (!memberId) return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const saveConsent = async () => {
    if (!canAct) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('/api/codigo/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, deviceId, portabilityOptIn }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setSuccess('Consent updated.');
      await loadProfile();
    } catch (e: any) {
      setError(e?.message || 'Failed to update consent');
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = () => {
    if (!canAct) return;
    const url = `/api/codigo/data/export?memberId=${encodeURIComponent(memberId)}&deviceId=${encodeURIComponent(deviceId)}`;
    window.location.assign(url);
  };

  const deleteData = async () => {
    if (!canAct) return;
    const ok = window.confirm('Delete your Hookah+ data for this CODIGO identity? This cannot be undone.');
    if (!ok) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('/api/codigo/data/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, deviceId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      localStorage.removeItem(MEMBER_ID_KEY);
      setProfile(null);
      setMemberId('');
      setSuccess('Deleted. You can re-join any time.');
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/60 border-zinc-700/60">
          <CardHeader>
            <CardTitle className="text-2xl">Privacy & Portability</CardTitle>
            <CardDescription className="text-zinc-300">
              You control whether you’re remembered across Hookah+ venues.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!memberId && (
              <div className="text-sm text-yellow-200 bg-yellow-950/30 border border-yellow-800/50 rounded-md px-3 py-2">
                No CODIGO member ID found on this device. Join first at <span className="font-mono">/codigo/join</span>.
              </div>
            )}

            {profile && (
              <div className="space-y-2">
                <div className="text-xs text-zinc-500 break-all">memberId: {profile.hid}</div>
                <div className="text-xs text-zinc-500">consent: {profile.consentLevel}</div>
              </div>
            )}

            <div className="rounded-md border border-zinc-700 bg-zinc-950/40 px-3 py-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={portabilityOptIn}
                  onChange={(e) => setPortabilityOptIn(e.target.checked)}
                  disabled={!memberId}
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

            {success && (
              <div className="text-sm text-teal-200 bg-teal-950/30 border border-teal-800/50 rounded-md px-3 py-2">
                {success}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-300 bg-red-950/30 border border-red-800/50 rounded-md px-3 py-2">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {memberId && (
              <Button asChild className="w-full">
                <Link href={resolveHref}>Continue your visit</Link>
              </Button>
            )}
            <Button onClick={saveConsent} disabled={!canAct} className="w-full">
              {loading ? 'Saving…' : 'Save consent'}
            </Button>
            <Button onClick={downloadExport} disabled={!canAct} variant="secondary" className="w-full">
              Download my data (JSON)
            </Button>
            <Button onClick={deleteData} disabled={!canAct} variant="destructive" className="w-full">
              Delete my data
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function CodigoPrivacyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-zinc-950 text-zinc-500 text-sm p-8">
          Loading…
        </div>
      }
    >
      <CodigoPrivacyInner />
    </Suspense>
  );
}

