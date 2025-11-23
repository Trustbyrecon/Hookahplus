import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for Supabase Auth with multi-tenant RLS
 * Protects admin routes and app routes based on authentication and roles
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/health',
    '/api/sessions', // QR code access (POST only)
    '/api/checkout-session',
    '/api/webhooks',
    '/api/tenants', // Allow tenant creation during signup
    '/api/memberships', // Allow membership creation during signup (uses service role internally)
    '/login',
    '/signup',
    '/_next',
    '/favicon.ico',
    // Dev-only: allow direct access to operator onboarding admin without auth
    ...(process.env.NODE_ENV !== 'production'
      ? ['/admin/operator-onboarding', '/api/admin/operator-onboarding']
      : []),
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    return response;
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!user) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      } else {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Check if user has admin role (owner or admin)
    // Note: Role check happens in API routes using getCurrentRole()
    // Middleware just ensures user is authenticated
  }

  // Protect other API routes
  if (pathname.startsWith('/api') && !isPublicRoute) {
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/:path*',
  ],
};

