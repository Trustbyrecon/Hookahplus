import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Verify role change via magic link
 * After user clicks magic link, verify they have permission for the requested role
 * and update their session accordingly
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const requestedRole = searchParams.get('role');
  const redirect = searchParams.get('redirect') || '/';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
  }

  const cookieStore = await cookies();
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

  // Exchange code for session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[Role Change Verification] Exchange error:', exchangeError);
    return NextResponse.redirect(new URL('/login?error=verification_failed', req.url));
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL('/login?error=user_not_found', req.url));
  }

  // Verify user has permission for requested role
  if (requestedRole && requestedRole.toLowerCase() === 'admin') {
    // Check if user has admin or owner membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'owner'])
      .limit(1)
      .single();

    if (membershipError || !membership) {
      console.error('[Role Change Verification] User does not have admin permission:', membershipError);
      return NextResponse.redirect(new URL('/?error=insufficient_permissions', req.url));
    }

    // User has admin permission - update session metadata
    await supabase.auth.updateUser({
      data: {
        active_role: 'admin',
        role_verified_at: new Date().toISOString(),
        admin_verified: true, // Flag to show admin links
      },
    });
  }

  // Redirect to requested page
  return NextResponse.redirect(new URL(redirect, req.url));
}

