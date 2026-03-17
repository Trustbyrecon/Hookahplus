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

/** Allowed origins for CORS (guest app, site, local dev) */
const CORS_ALLOWED_ORIGINS = [
  'http://localhost:3001', // Guest build
  'http://localhost:3000',
  'http://localhost:3002',
  'https://guest.hookahplus.net',
  'https://hookahplus.net',
  'https://www.hookahplus.net',
  'https://app.hookahplus.net',
].filter(Boolean);

function addCorsHeaders(response: NextResponse, request: NextRequest): void {
  const origin = request.headers.get('origin');
  const allowOrigin =
    origin && (CORS_ALLOWED_ORIGINS.includes(origin) || (origin.includes('localhost') && process.env.NODE_ENV !== 'production'))
      ? origin
      : CORS_ALLOWED_ORIGINS[0];
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
}

/**
 * Middleware for Supabase Auth with multi-tenant RLS
 * Protects admin routes and app routes based on authentication and roles
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS preflight: respond immediately for OPTIONS on API routes (guest app cross-origin)
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const res = new NextResponse(null, { status: 204 });
    addCorsHeaders(res, request);
    return res;
  }

  // Guest flow: always allow session resolve (guest app server calls this when guest scans table QR)
  if (pathname === '/api/session/resolve' || pathname.startsWith('/api/session/resolve/')) {
    const response = NextResponse.next();
    addCorsHeaders(response, request);
    return response;
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

  // Add CORS headers for API routes (guest app at localhost:3001 calls app at localhost:3002)
  if (pathname.startsWith('/api/')) {
    addCorsHeaders(response, request);
  }
  
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
    '/api/lounges', // Allow lounge list + config + layout (CODIGO pilot, E2E)
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
    '/codigo/access-expired', // Shown when CODIGO access has expired
    '/codigo/join', // Guest join flow is public
    '/codigo/privacy', // Privacy page is public
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
          '/api/onboarding', // Onboarding Engine validation without auth in development
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
    // Demo mode: allow onboarding API for pilot validation (e.g. CODIGO)
    ...(isDemoRequest ? ['/api/onboarding'] : []),
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    return response;
  }

  // Protected app routes (require auth when not First Light)
  const protectedAppRoutes = [
    '/fire-session-dashboard',
    '/staff-panel',
    '/lounge-layout',
    '/staff',
    '/sessions',
    '/codigo/operator',
    '/codigo/profile',
    '/codigo/kpis',
    '/dashboard',
    '/analytics',
    '/campaigns',
    '/reconciliation',
    '/revenue',
    '/help',
    '/qr-generator',
    '/onboarding',
    '/square',
    '/waitlist',
    '/pulse',
    '/revenue',
    '/roi-calculator',
    '/partnership',
    '/pricing',
    '/support',
    '/operator',
    '/staff-dashboard',
    '/staff-ops',
    '/staff-tracking',
    '/guest-intelligence',
    '/monitoring',
    '/status',
    '/visual-grounder',
    '/layout-preview',
    '/docs',
  ];

  const isProtectedAppRoute = protectedAppRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedAppRoute && !firstLightMode && hasSupabaseEnv && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
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
    '/fire-session-dashboard',
    '/staff-panel',
    '/lounge-layout',
    '/staff/:path*',
    '/sessions',
    '/codigo/:path*',
    '/dashboard/:path*',
    '/analytics',
    '/campaigns',
    '/reconciliation',
    '/revenue',
    '/help',
    '/qr-generator',
    '/onboarding/:path*',
    '/square/:path*',
    '/waitlist',
    '/pulse',
    '/docs/:path*',
    '/operator',
    '/staff-dashboard',
    '/staff-ops',
    '/staff-tracking',
    '/guest-intelligence',
    '/monitoring',
    '/status',
    '/visual-grounder',
    '/layout-preview',
    '/support',
    '/partnership',
    '/pricing',
    '/roi-calculator',
  ],
};

