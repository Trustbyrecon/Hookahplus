import { createClient } from '@supabase/supabase-js';

/**
 * Singleton client-side Supabase client (for use in client components)
 * This prevents multiple GoTrueClient instances in the same browser context
 * Note: Prefer using serverClient() in server components for better security
 */
let clientInstance: ReturnType<typeof createClient> | null = null;

export function clientClient() {
  if (typeof window === 'undefined') {
    // Server-side: return a new instance (shouldn't be used, but handle gracefully)
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Client-side: use singleton pattern
  if (!clientInstance) {
    clientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  return clientInstance;
}

