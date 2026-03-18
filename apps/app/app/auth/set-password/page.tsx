'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clientClient, isSupabaseConfigured } from '../../../lib/supabase-client';
import { Flame, Lock, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

/**
 * Set new password after clicking "Forgot password" reset link.
 * User lands here from auth/callback after exchanging the recovery code.
 */
export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = clientClient();
    supabase.auth.getUser().then((res) => {
      const user = res.data.user;
      if (!user) {
        router.replace('/login?redirect=/fire-session-dashboard&error=Session expired. Please request a new reset link.');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const supabase = clientClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => router.push('/fire-session-dashboard'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
        <p className="text-zinc-400">Auth not configured.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Password set</h1>
          <p className="text-zinc-400 mb-4">Redirecting to dashboard...</p>
          <Link href="/fire-session-dashboard" className="text-teal-400 hover:text-teal-300">
            Go now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Flame className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Set new password</h1>
            <p className="text-sm text-zinc-400">Enter your new password below</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting password...</> : <><Lock className="w-4 h-4" /> Set password</>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/login" className="text-teal-400 hover:text-teal-300">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
