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
  const verifyRole = searchParams.get('verify_role'); // For role change verification

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
          const userMetadata: any = {
            tenant_id: membership.tenant_id,
            role: membership.role,
          };

          // Handle role verification if this is a role change request
          if (verifyRole && verifyRole.toLowerCase() === 'admin') {
            // Verify user has admin/owner membership
            if (membership.role === 'admin' || membership.role === 'owner') {
              userMetadata.admin_verified = true;
              userMetadata.active_role = 'admin';
              userMetadata.role_verified_at = new Date().toISOString();
            } else {
              // User doesn't have admin permission
              return NextResponse.redirect(new URL('/?error=insufficient_permissions', req.url));
            }
          } else if (membership.role === 'admin' || membership.role === 'owner') {
            // Regular admin login - set admin_verified flag
            userMetadata.admin_verified = true;
            userMetadata.active_role = 'admin';
            userMetadata.role_verified_at = new Date().toISOString();
          }

          await supabase.auth.updateUser({
            data: userMetadata,
          });

          // If user has admin/owner role, redirect to admin dashboard if no specific redirect
          if ((membership.role === 'admin' || membership.role === 'owner')) {
            // If redirect is the default or user is coming from login, send to main admin page
            if (redirect === '/admin/operator-onboarding' || redirect === '/') {
              const adminRedirect = '/admin';
              return NextResponse.redirect(new URL(adminRedirect, req.url));
            }
          }
        }
      }

      // Use the provided redirect, or default to dashboard
      const finalRedirect = redirect && redirect !== '/' ? redirect : '/sessions';
      return NextResponse.redirect(new URL(finalRedirect, req.url));
    } else {
      // Handle expired or invalid code
      console.error('[Auth Callback] Exchange error:', error);
      const errorMessage = error.message || 'Authentication failed';
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, req.url));
    }
  }

  // If error or no code, redirect to login
  return NextResponse.redirect(new URL('/login', req.url));
}

