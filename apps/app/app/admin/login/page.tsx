'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { clientClient, isSupabaseConfigured } from '../../../lib/supabase-client';
import { Shield, Mail, Loader2, Lock, ArrowLeft, Settings } from 'lucide-react';

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(errorParam || null);

  const supabaseConfigured = isSupabaseConfigured();

  // Use current origin for auth callback so magic link returns to same deployment (preview vs production)
  const getAuthCallbackOrigin = () => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) return 'http://localhost:3002';
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = clientClient();
      const callbackOrigin = getAuthCallbackOrigin();
      const callbackUrl = `${callbackOrigin}/auth/callback?admin_login=true&redirect=${encodeURIComponent(redirect)}`;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl,
        },
      });

      if (signInError) throw signInError;

      setMagicLinkSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send magic link';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = clientClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) throw signInError;

      // Redirect client-side after successful password sign-in
      window.location.href = redirect.startsWith('/') ? redirect : `/${redirect}`;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900/80 border border-amber-500/30 rounded-xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Settings className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Admin Login</h1>
                <p className="text-sm text-zinc-400">Supabase not configured</p>
              </div>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-sm space-y-2">
              <p>Add these environment variables in Vercel:</p>
              <ul className="list-disc list-inside font-mono text-xs">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
              <p className="pt-2 text-zinc-400">
                Get values from your Supabase project dashboard → Settings → API.
              </p>
            </div>
            <Link
              href="/"
              className="mt-6 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
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
              <Shield className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Admin Login</h1>
              <p className="text-sm text-zinc-400">Sign in to access the admin dashboard</p>
            </div>
          </div>

          {(error || errorParam) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {errorParam === 'insufficient_permissions'
                ? 'You do not have admin access. Contact your administrator.'
                : error || errorParam}
            </div>
          )}

          {useMagicLink ? (
            magicLinkSent ? (
              <div className="text-center py-6">
                <Mail className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                <p className="text-zinc-300 mb-2">
                  Magic link sent to <span className="font-medium text-white">{email}</span>
                </p>
                <p className="text-sm text-zinc-500 mb-6">
                  Check your email and click the link to sign in. You can close this tab after signing in.
                </p>
                <button
                  onClick={() => {
                    setMagicLinkSent(false);
                    setError(null);
                  }}
                  className="text-sm text-teal-400 hover:text-teal-300"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send magic link
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign in with password
                  </>
                )}
              </button>
            </form>
          )}

          {!magicLinkSent && (
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(!useMagicLink);
                setError(null);
              }}
              className="mt-4 w-full text-sm text-zinc-400 hover:text-zinc-300"
            >
              {useMagicLink ? 'Use password instead' : 'Use magic link instead'}
            </button>
          )}

          <Link
            href="/"
            className="mt-6 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
