import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client (App Router).
 * Uses request cookies for auth session.
 */
export async function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}

/**
 * Admin Supabase client (server-only).
 * Uses service role key for privileged operations (e.g. Storage cleanup).
 */
export function adminClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!url || !serviceKey) {
    throw new Error('Supabase admin env not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

