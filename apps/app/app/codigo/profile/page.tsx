'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

const MEMBER_ID_KEY = 'hp_codigo_member_id_v1';

export default function CodigoProfilePage() {
  const [memberId, setMemberId] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hid = (localStorage.getItem(MEMBER_ID_KEY) || '').trim();
    setMemberId(hid);
  }, []);

  const canSubmit = useMemo(() => {
    if (!memberId) return false;
    if (isSubmitting) return false;
    const hasPhone = phone.trim().length > 0;
    const hasEmail = email.trim().length > 0;
    return hasPhone || hasEmail;
  }, [memberId, isSubmitting, phone, email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/codigo/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          phone: phone.trim() || null,
          email: email.trim() || null,
          instagramHandle: instagramHandle.trim() || null,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(data?.error || 'Update failed');
        return;
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/60 border-zinc-700/60">
          <CardHeader>
            <CardTitle className="text-2xl">Complete your profile</CardTitle>
            <CardDescription className="text-zinc-300">
              Add a phone or email (one required). This is optional and won’t affect your sessions.
            </CardDescription>
          </CardHeader>

          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {!memberId && (
                <div className="text-sm text-yellow-200 bg-yellow-950/30 border border-yellow-800/50 rounded-md px-3 py-2">
                  No CODIGO member ID found on this device. Join first at <span className="font-mono">/codigo/join</span>.
                </div>
              )}

              <div>
                <label className="block text-sm text-zinc-200 mb-1">Phone (optional)</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-teal-500"
                  placeholder="+1 555 123 4567"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-200 mb-1">Email (optional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-teal-500"
                  placeholder="you@example.com"
                  inputMode="email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-200 mb-1">Instagram handle (optional)</label>
                <input
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full rounded-md bg-zinc-950/60 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-teal-500"
                  placeholder="@yourhandle"
                  autoComplete="off"
                />
              </div>

              {success && (
                <div className="text-sm text-teal-200 bg-teal-950/30 border border-teal-800/50 rounded-md px-3 py-2">
                  Profile updated.
                </div>
              )}

              {error && (
                <div className="text-sm text-red-300 bg-red-950/30 border border-red-800/50 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button type="submit" disabled={!canSubmit} className="w-full">
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

