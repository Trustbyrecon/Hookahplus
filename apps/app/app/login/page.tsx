'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clientClient } from '../../lib/supabase-client';

export default function LoginPage() {
  const router = useRouter();
  const [redirect, setRedirect] = useState('/sessions'); // Default to sessions, not admin
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMagicLink, setIsMagicLink] = useState(false);

  // Read redirect param from URL on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      if (redirectParam) {
        setRedirect(redirectParam);
      }
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = clientClient();
      
      if (isMagicLink) {
        // Magic link login
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          (typeof window !== 'undefined' ? window.location.origin : '');

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(
              redirect
            )}&onboarding_flow=true`, // Flag for onboarding flow
          },
        });

        if (error) throw error;

        alert('Check your email for the magic link!');
      } else {
        // Password login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // After login, set active tenant
        if (data.user) {
          // Fetch user's memberships to get first tenant
          const { data: memberships } = await supabase
            .from('memberships')
            .select('tenant_id, role')
            .eq('user_id', data.user.id)
            .limit(1)
            .single();

          if (memberships) {
            // Set tenant_id in user metadata (will be in JWT)
            await supabase.auth.updateUser({
              data: {
                tenant_id: memberships.tenant_id,
                role: memberships.role,
              },
            });
          }
        }

        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-800 rounded-lg p-8 border border-zinc-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Hookah+</h1>
            <p className="text-zinc-400">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            {!isMagicLink && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                id="magic-link"
                type="checkbox"
                checked={isMagicLink}
                onChange={(e) => setIsMagicLink(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <label htmlFor="magic-link" className="ml-2 text-sm text-zinc-300">
                Use magic link (passwordless)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : isMagicLink ? 'Send Magic Link' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Don't have an account?{' '}
              <a href="/signup" className="text-teal-400 hover:text-teal-300">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

