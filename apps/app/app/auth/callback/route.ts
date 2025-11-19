import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Auth callback handler for Supabase Auth
 * Handles OAuth callbacks and magic link redirects
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/admin/operator-onboarding';

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user and set active tenant
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user's first membership to set active tenant
        const { data: membership } = await supabase
          .from('memberships')
          .select('tenant_id, role')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (membership) {
          // Set tenant_id and role in user metadata (will be in JWT)
          await supabase.auth.updateUser({
            data: {
              tenant_id: membership.tenant_id,
              role: membership.role,
            },
          });
        }
      }

      return NextResponse.redirect(new URL(redirect, req.url));
    }
  }

  // If error or no code, redirect to login
  return NextResponse.redirect(new URL('/login', req.url));
}

