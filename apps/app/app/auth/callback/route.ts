import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../lib/db';

export const runtime = 'nodejs';

/**
 * Auth callback handler for Supabase Auth
 * Handles OAuth callbacks and magic link redirects
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/admin';
  const verifyRole = searchParams.get('verify_role'); // For role change verification
  const adminLogin = searchParams.get('admin_login') === 'true'; // Flag for admin login flow
  const onboardingFlow = searchParams.get('onboarding_flow') === 'true'; // Flag for onboarding flow

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
      
      let membership: any = null;
      
      if (user) {
        // Fetch user's first membership to set active tenant
        const { data: membershipData } = await supabase
          .from('memberships')
          .select('tenant_id, role')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        membership = membershipData;

        // Canonical hardening: if the user has no membership yet but has a pending tenant name
        // (common when email confirmation/magic-link completes before DB binding), auto-provision.
        if (!membership) {
          const pendingName = String((user.user_metadata as any)?.pending_tenant_name || '').trim();
          if (pendingName) {
            try {
              const tenant = await prisma.tenant.create({ data: { name: pendingName } as any });
              await prisma.membership.create({
                data: {
                  userId: user.id,
                  tenantId: tenant.id,
                  role: 'owner' as any,
                },
              });
              membership = { tenant_id: tenant.id, role: 'owner' };
            } catch (e) {
              console.error('[Auth Callback] Failed to auto-provision tenant/membership:', e);
            }
          }
        }

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
            data: {
              ...userMetadata,
              // Clear pending metadata so we don't re-run provisioning.
              pending_tenant_name: null,
            },
          });

          // If user has admin/owner role, redirect to admin dashboard
          if ((membership.role === 'admin' || membership.role === 'owner')) {
            // Admin login flow - always go to /admin
            if (adminLogin) {
              return NextResponse.redirect(new URL('/admin', req.url));
            }
            // If redirect is the default or user is coming from login, send to main admin page
            if (redirect === '/admin/operator-onboarding' || redirect === '/') {
              const adminRedirect = '/admin';
              return NextResponse.redirect(new URL(adminRedirect, req.url));
            }
          } else if (adminLogin) {
            // User tried admin login but doesn't have admin role
            return NextResponse.redirect(new URL('/admin/login?error=insufficient_permissions', req.url));
          } else if (onboardingFlow) {
            // Onboarding flow - route to operator onboarding (for new operators)
            return NextResponse.redirect(new URL('/admin/operator-onboarding', req.url));
          }
        }
      }

      // Use the provided redirect, or default based on context
      let finalRedirect = redirect && redirect !== '/' ? redirect : '/sessions';
      
      // If this was an admin login attempt but user doesn't have admin role, redirect to admin login
      if (adminLogin && (!user || !membership || (membership.role !== 'admin' && membership.role !== 'owner'))) {
        finalRedirect = '/admin/login?error=insufficient_permissions';
      } else if (onboardingFlow) {
        // Onboarding flow defaults to operator onboarding
        finalRedirect = '/admin/operator-onboarding';
      }
      
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


