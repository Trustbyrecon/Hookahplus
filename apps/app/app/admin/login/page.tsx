'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clientClient } from '../../../lib/supabase-client';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';

/**
 * Admin Login Page - For Founder/CEO and Admin Access
 * Separate from operator onboarding flow
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [redirect, setRedirect] = useState('/admin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = clientClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user has admin/owner role
          const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .in('role', ['admin', 'owner'])
            .limit(1)
            .single();

          if (membership) {
            // Already authenticated as admin - redirect to admin
            router.push('/admin');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();

    // Read redirect param from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      if (redirectParam) {
        setRedirect(redirectParam);
      }
    }
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = clientClient();

      if (isMagicLink) {
        // Magic link login - ALWAYS route to app, not site
        // For local dev, explicitly use localhost:3002 (app port)
        // For production, use NEXT_PUBLIC_APP_URL
        let appUrl: string;
        if (typeof window !== 'undefined') {
          // Client-side: check if we're on localhost
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (isLocal) {
            // Force app port (3002) for local development
            appUrl = `http://localhost:3002`;
          } else {
            // Production: use env var or current origin (should be app domain)
            appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
          }
        } else {
          // Server-side: use env var or default to localhost:3002
          appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        }

        console.log('[Admin Login] Magic link redirect URL:', `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}&admin_login=true`);

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}&admin_login=true`,
          },
        });

        if (error) throw error;

        setMagicLinkSent(true);
        alert('Check your email for the magic link!');
      } else {
        // Password login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // After login, verify admin role and redirect
        if (data.user) {
          // Fetch user's memberships to check for admin/owner role
          const { data: memberships } = await supabase
            .from('memberships')
            .select('tenant_id, role')
            .eq('user_id', data.user.id)
            .in('role', ['admin', 'owner'])
            .limit(1)
            .single();

          if (memberships) {
            // Set admin_verified flag
            await supabase.auth.updateUser({
              data: {
                tenant_id: memberships.tenant_id,
                role: memberships.role,
                admin_verified: true,
                active_role: 'admin',
                role_verified_at: new Date().toISOString(),
              },
            });

            router.push(redirect);
          } else {
            throw new Error('You do not have admin access. Please contact support.');
          }
        }
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
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-zinc-400">Founder/CEO & Administrator Login</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {magicLinkSent ? (
            <div className="text-center">
              <Mail className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <p className="text-zinc-300 mb-2">
                Magic link sent to <span className="font-medium text-white">{email}</span>
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                Click the link in your email to access the admin dashboard.
              </p>
              <button
                onClick={() => {
                  setMagicLinkSent(false);
                  setIsMagicLink(false);
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Send Another Link
              </button>
            </div>
          ) : (
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
                  placeholder="admin@hookahplus.com"
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
                    placeholder="Enter your password"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsMagicLink(!isMagicLink)}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                  {isMagicLink ? 'Use password instead' : 'Use magic link instead'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || (!isMagicLink && !password)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    {isMagicLink ? (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Magic Link</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-700">
            <p className="text-xs text-zinc-500 text-center">
              For operator onboarding, use the{' '}
              <a href="/onboarding" className="text-teal-400 hover:text-teal-300 underline">
                onboarding form
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

