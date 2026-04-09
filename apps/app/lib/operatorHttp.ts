import type { NextRequest } from 'next/server';

export function getInternalBaseUrl(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3002';
  const proto =
    req.headers.get('x-forwarded-proto') ||
    (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function forwardCookieHeaders(req: NextRequest): HeadersInit {
  const cookie = req.headers.get('cookie');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookie) h['Cookie'] = cookie;
  return h;
}
