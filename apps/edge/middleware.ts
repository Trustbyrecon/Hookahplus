// apps/edge/middleware.ts
// Pseudo-middleware. Adapt for Next.js/Cloudflare/Vercel edge runtime as needed.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "gp"; // guest pointer

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const u = url.searchParams.get("u") ?? undefined;
  const hasCookie = req.cookies.get(COOKIE)?.value;

  // If no cookie, set ephemeral pointer from query or mint a placeholder
  if (!hasCookie) {
    const token = u || cryptoRandom(12);
    const res = NextResponse.next({ request: { headers: req.headers } });
    res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
    res.headers.set("x-guest-id-ephem", token); // dev aid
    return res;
  }

  return NextResponse.next();
}

function cryptoRandom(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const config = {
  matcher: ["/guest/:path*"],
};
