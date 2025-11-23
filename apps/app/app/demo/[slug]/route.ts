import { NextRequest, NextResponse } from 'next/server';

/**
 * /demo/{slug}
 *
 * Lightweight test-link entrypoint for lounges.
 * Redirects to Fire Session Dashboard in demo mode, carrying the lounge slug.
 *
 * Example:
 *   /demo/night-after-night
 *   -> /fire-session-dashboard?mode=demo&lounge=night-after-night
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // Build URL relative to current origin
  const url = new URL('/fire-session-dashboard', req.url);
  url.searchParams.set('mode', 'demo');
  url.searchParams.set('lounge', slug);

  return NextResponse.redirect(url.toString(), { status: 302 });
}


