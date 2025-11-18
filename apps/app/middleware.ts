import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple authentication check
 * For SaaS, we need to protect both admin and app routes
 */
function isAuthenticated(req: NextRequest): boolean {
  // Check for API key in header (for programmatic access)
  const apiKey = req.headers.get('x-api-key');
  if (apiKey && process.env.ADMIN_API_KEY && apiKey === process.env.ADMIN_API_KEY) {
    return true;
  }

  // Check for session cookie (for browser access)
  const sessionCookie = req.cookies.get('admin_session');
  if (sessionCookie && process.env.ADMIN_SESSION_SECRET && sessionCookie.value === process.env.ADMIN_SESSION_SECRET) {
    return true;
  }

  // In development, allow access if ADMIN_BYPASS is set
  if (process.env.NODE_ENV === 'development' && process.env.ADMIN_BYPASS === 'true') {
    return true;
  }

  // If no auth config, allow in development (graceful degradation)
  if (process.env.NODE_ENV === 'development' && !process.env.ADMIN_API_KEY && !process.env.ADMIN_SESSION_SECRET) {
    console.warn('[Middleware] No auth configured - allowing access in development');
    return true;
  }

  return false;
}

/**
 * Check if user has admin role
 */
function isAdmin(req: NextRequest): boolean {
  // For now, use same auth check as authenticated
  // In future, can add role-based checks here
  return isAuthenticated(req);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAdmin(request)) {
      // Redirect to login or return 401
      if (pathname.startsWith('/api/admin')) {
        // API routes return 401
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Admin access required' },
          { status: 401 }
        );
      } else {
        // Page routes redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Protect app routes (SaaS requirement)
  // Exclude public routes like /api/health, /api/sessions (for QR codes), etc.
  const publicRoutes = [
    '/api/health',
    '/api/sessions', // QR code access
    '/api/checkout-session',
    '/api/webhooks',
    '/login',
    '/_next',
    '/favicon.ico',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!isPublicRoute && pathname.startsWith('/api') && !pathname.startsWith('/api/admin')) {
    // Protect API routes (except public ones)
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/:path*',
  ],
};

