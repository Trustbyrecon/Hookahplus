export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getAppBaseUrl, signOAuthState } from "@/apps/web/lib/square";
import { auth } from "@/apps/web/auth";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    const url = new URL(`${getAppBaseUrl()}/auth/signin`);
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url.toString(), { status: 302 });
  }

  const { searchParams } = new URL(req.url);
  const loungeId = searchParams.get("loungeId");
  if (!loungeId) return NextResponse.json({ error: "Missing loungeId" }, { status: 400 });

  const redirectUri = `${getAppBaseUrl()}/api/integrations/square/oauth/callback`;
  const scopes = [
    "ORDERS_READ",
    "ORDERS_WRITE",
    "LOCATIONS_READ",
    "MERCHANT_PROFILE_READ",
    "PAYMENTS_READ",
  ];

  // CSRF protection: store nonce in cookie and embed in signed state.
  const csrf = crypto.randomBytes(16).toString("hex");
  const state = signOAuthState({ loungeId, csrf, ts: Date.now() });

  const cookieStore = await cookies();
  cookieStore.set("sq_oauth_csrf", csrf, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/integrations/square/oauth/callback",
    maxAge: 10 * 60, // 10 minutes
  });

  const env = (process.env.SQUARE_ENV || "sandbox").toLowerCase();
  const authBase =
    env === "production"
      ? "https://connect.squareup.com/oauth2/authorize"
      : "https://connect.squareupsandbox.com/oauth2/authorize";

  const url = new URL(authBase);
  url.searchParams.set("client_id", requireEnv("SQUARE_APPLICATION_ID"));
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("session", "false");
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(url, { status: 302 });
}

