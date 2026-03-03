import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Generate UUID using Web Crypto API (Edge Runtime compatible)
 */
function generateUUID(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Middleware for Supabase Auth with multi-tenant RLS
 * Protects admin routes and app routes based on authentication and roles
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guest flow: always allow session resolve (guest app server calls this when guest scans table QR)
  if (pathname === '/api/session/resolve' || pathname.startsWith('/api/session/resolve/')) {
    return NextResponse.next();
  }

  const demoQueryMode = request.nextUrl.searchParams.get('mode');
  const demoQueryIsDemo = request.nextUrl.searchParams.get('isDemo');
  const demoHeader = request.headers.get('x-demo-mode');
  const isDemoRequest = demoQueryMode === 'demo' || demoQueryIsDemo === 'true' || demoHeader === 'true';
  
  // Generate or use existing request ID for request correlation
  const requestId = request.headers.get('X-Request-ID') || generateUUID();
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  // Add request ID to response headers for client correlation
  response.headers.set('X-Request-ID', requestId);

  // Check if First Light mode is enabled (bypasses auth for core routes)
  const firstLightMode = process.env.FIRST_LIGHT_MODE === 'true';

  // Supabase env can be intentionally absent in CI/dev harnesses; fail-open so the app can boot.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabaseEnv = !!supabaseUrl && !!supabaseAnonKey;

  // Create Supabase client for middleware (only when configured)
  const supabase = hasSupabaseEnv
    ? createServerClient(supabaseUrl, supabaseAnonKey, {
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
      })
    : null;

  // Get current user (best-effort)
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/launchpad', // LaunchPad onboarding is public
    '/api/launchpad', // LaunchPad API routes (session, progress, create-lounge)
    '/api/health',
    '/api/health/live',
    '/api/health/ready',
    '/api/sessions', // QR code access (POST only)
    '/api/session/resolve', // Guest flow: guest app calls this when guest scans table QR (server-to-server, no auth)
    '/api/preorders', // Pre-order flow must be public (QR + E2E)
    '/api/reflex/track', // Reflex tracking is intentionally public (client + server events)
    '/api/checkout-session',
    '/api/webhooks',
    '/api/tenants', // Allow tenant creation during signup
    '/api/memberships', // Allow membership creation during signup (uses service role internally)
    '/api/lounges', // Allow lounge list access for QR generator
    '/api/qr-generator', // Allow QR generator API access
    // CODIGO guest flows must be public (used by `/codigo/*` pages)
    '/api/codigo/join',
    '/api/codigo/profile',
    '/api/codigo/consent',
    '/api/codigo/data/export',
    '/api/codigo/data/delete',
    '/api/codigo/wallet-card',
    '/api/codigo/wallet-pass',
    '/api/codigo/kpis/public-summary',
    // Apple Wallet web service endpoints (authenticated via ApplePass token, not Supabase)
    '/api/pkpass',
    // HID resolution is used by CODIGO privacy page
    '/api/hid/resolve',
    '/api/preorder/calculate-price', // Pre-order price calculation (public for QR access)
    '/api/test-session', // Test endpoints for development
    '/api/test-sentry', // Sentry test endpoint (for testing error tracking)
    '/api/test-sentry-debug', // Sentry debug diagnostic endpoint
    '/api/square/oauth', // Square OAuth flow (authorize, callback)
    '/api/square/webhook', // Square webhooks MUST be public (Square servers cannot auth)
    '/api/square/process', // Square processor is called by Vercel Cron (auth handled in route)
    '/api/square/reconcile', // Square reconcile+heal is called by Vercel Cron (auth handled in route)
    '/api/square/diagnostics', // Square diagnostics for server-to-server validation
    '/api/square/status', // Square status returns non-secret connection metadata (merchantId, locations)
    // Dev/First Light convenience: allow disconnect without auth to re-authorize scopes locally.
    // Protected in production by omission (see below).
    ...(process.env.NODE_ENV !== 'production' || firstLightMode ? ['/api/square/disconnect'] : []),
    '/login',
    '/signup',
    '/admin/login', // Admin login page is public
    '/demo', // Demo/test link routes are public (no auth required)
    '/_next',
    '/favicon.ico',
    // Demo requests: allow metrics + demo helpers without auth (safe, demo-only)
    ...(isDemoRequest ? ['/api/metrics', '/api/demo-session', '/api/lounges/tables'] : []),
    // First Light mode: allow metrics, trust-lock, pulse, and campaigns without auth (Aliethia-aligned)
    ...(firstLightMode ? ['/api/metrics', '/api/trust-lock', '/api/pulse', '/api/campaigns'] : []),
    // Demo / First Light: allow admin QR generator without auth (CODIGO pilot, demo QR codes)
    ...(isDemoRequest || firstLightMode ? ['/admin/qr', '/api/admin/qr'] : []),
    // Dev-only: allow direct access to admin routes without auth
    ...(process.env.NODE_ENV !== 'production'
      ? [
          '/admin',
          '/admin/operator-onboarding',
          '/api/admin',
          '/api/admin/operator-onboarding',
          '/api/pos/tickets', // CI/E2E + local dev helpers
          '/api/pos/reconcile', // Local metrics dashboard + CI/E2E
          '/api/analytics', // Allow analytics APIs without auth in development
          '/api/analytics/unified', // Unified analytics in development
          '/api/lounges/analytics', // Lounge analytics in development
          '/api/lounges/tables', // Table APIs in development
          '/api/lounges/tables/validate', // Table validation in development
          '/api/lounges/tables/availability', // Table availability in development
          '/api/staff/zones', // Zone routing in development
          '/api/monitoring/performance', // Performance monitoring in development
          '/api/cache/stats', // Cache stats in development
          '/api/campaigns', // Campaign APIs in development
        ]
      : []),
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    return response;
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Allow admin login page without authentication
    if (pathname === '/admin/login') {
      return response;
    }

    if (!user) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      } else {
        // Redirect to admin login (not regular login) for admin routes
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Check if user has admin role (owner or admin)
    // Note: Role check happens in API routes using getCurrentRole()
    // Middleware just ensures user is authenticated
    // If user is authenticated, allow access (role check happens in API routes)
  }

  // Protect other API routes
  // First Light mode: allow /api/sessions and /api/metrics without auth
  if (pathname.startsWith('/api') && !isPublicRoute) {
    // First Light mode bypass for core routes
    if (firstLightMode && (pathname.startsWith('/api/sessions') || pathname.startsWith('/api/metrics'))) {
      // Allow access in First Light mode
      return response;
    }
    
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

