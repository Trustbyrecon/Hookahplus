import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const role = req.cookies.get('role')?.value;
  const trust = parseInt(req.cookies.get('trustTier')?.value || '0', 10);
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard/operator') && role !== 'operator') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (pathname.startsWith('/vault') && !(role === 'partner' || trust >= 7)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/operator/:path*', '/vault/:path*'],
};
