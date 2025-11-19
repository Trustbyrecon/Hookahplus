'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function SignupPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check environment variables on mount
  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase configuration is missing. Please check your environment variables and restart the dev server.');
    } else if (typeof createClient !== 'function') {
      setError('Supabase client initialization failed. Please restart the dev server.');
    } else {
      // Clear any previous errors if everything is configured
      setError(null);
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate environment variables
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing. Please check your environment variables and restart the dev server.');
      }

      // Validate createClient is available
      if (typeof createClient !== 'function') {
        throw new Error('Supabase client initialization failed. Please restart the dev server.');
      }

      // Validate that the anon key is not truncated
      if (supabaseAnonKey.endsWith('...') || supabaseAnonKey.length < 100) {
        throw new Error('Supabase anon key appears to be incomplete. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set correctly.');
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Step 1: Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Step 2: Create tenant (must use service role to bypass RLS)
      // Note: In production, this should be done server-side via API route
      // For now, we'll use a server action or API route
      const tenantResponse = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName || email.split('@')[0],
        }),
      });

      if (!tenantResponse.ok) {
        const errorData = await tenantResponse.json().catch(() => ({ error: 'Failed to create tenant' }));
        throw new Error(errorData.error || 'Tenant creation failed');
      }

      const tenantResponseData = await tenantResponse.json();
      const tenantData = tenantResponseData.tenant;

      if (!tenantData || !tenantData.id) {
        throw new Error('Tenant creation failed - invalid response');
      }

      // Step 3: Create membership with owner role (must use API route to bypass RLS)
      const membershipResponse = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          tenantId: tenantData.id,
          role: 'owner',
        }),
      });

      if (!membershipResponse.ok) {
        const errorData = await membershipResponse.json().catch(() => ({ error: 'Failed to create membership' }));
        throw new Error(errorData.error || 'Membership creation failed');
      }

      const membershipResponseData = await membershipResponse.json();
      if (!membershipResponseData.success) {
        throw new Error('Membership creation failed - invalid response');
      }

      // Step 4: Set active tenant in user metadata
      await supabase.auth.updateUser({
        data: {
          tenant_id: tenantData.id,
          role: 'owner',
        },
      });

      alert('Account created successfully! Please check your email to verify your account.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-800 rounded-lg p-8 border border-zinc-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-zinc-400">Sign up for Hookah+</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-zinc-300 mb-2">
                Business Name (Lounge Name)
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="Your Hookah Lounge"
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-zinc-400">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{' '}
              <a href="/login" className="text-teal-400 hover:text-teal-300">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

