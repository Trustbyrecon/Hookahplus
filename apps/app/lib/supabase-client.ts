import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/** Check if Supabase auth is configured (for admin login, etc.) */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url.length > 0 && key.length > 0);
}

let clientInstance: ReturnType<typeof createBrowserClient> | ReturnType<typeof createClient> | null = null;

/**
 * Singleton client-side Supabase client (for use in client components).
 * Uses createBrowserClient from @supabase/ssr so the session is read from cookies
 * (set by auth callback / middleware), not localStorage.
 * @throws Error if NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are not set
 */
export function clientClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel environment variables.'
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (typeof window === 'undefined') {
    return createClient(url, key);
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(url, key);
  }

  return clientInstance;
}

