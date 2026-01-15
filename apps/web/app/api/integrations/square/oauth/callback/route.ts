export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/apps/web/lib/prisma";
import {
  decryptSecret,
  encryptSecret,
  getAppBaseUrl,
  squareExchangeOAuthCode,
  squareListLocations,
  verifyOAuthState,
} from "@/apps/web/lib/square";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // User clicked "Deny" or OAuth failed upstream.
  if (error) {
    const url = new URL(`${getAppBaseUrl()}/integrations/square/error`);
    url.searchParams.set("reason", error);
    if (errorDescription) url.searchParams.set("details", errorDescription);
    return NextResponse.redirect(url.toString(), { status: 302 });
  }

  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  if (!state) return NextResponse.json({ error: "Missing state" }, { status: 400 });

  let loungeId = "";
  let csrf = "";
  try {
    const decoded = verifyOAuthState(state);
    loungeId = decoded.loungeId;
    csrf = decoded.csrf;
  } catch (e: any) {
    const url = new URL(`${getAppBaseUrl()}/integrations/square/error`);
    url.searchParams.set("reason", "invalid_state");
    url.searchParams.set("details", e?.message || "state_validation_failed");
    return NextResponse.redirect(url.toString(), { status: 302 });
  }

  // CSRF validation: cookie must match state payload.
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get("sq_oauth_csrf")?.value;
  cookieStore.set("sq_oauth_csrf", "", { path: "/api/integrations/square/oauth/callback", maxAge: 0 });
  if (!csrfCookie || csrfCookie !== csrf) {
    const url = new URL(`${getAppBaseUrl()}/integrations/square/error`);
    url.searchParams.set("reason", "csrf_failed");
    url.searchParams.set("details", "CSRF validation failed. Please try connecting again.");
    return NextResponse.redirect(url.toString(), { status: 302 });
  }

  const redirectUri = `${getAppBaseUrl()}/api/integrations/square/oauth/callback`;

  let token: any;
  try {
    token = await squareExchangeOAuthCode({ code, redirectUri });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Square OAuth exchange failed",
        hint: "Confirm SQUARE_ENV, redirect URI, and app credentials in Square Developer Dashboard.",
        details: e?.message,
      },
      { status: 500 }
    );
  }
  const accessToken = token.access_token;
  const refreshToken = token.refresh_token;
  const merchantId = token.merchant_id || "unknown";
  const scopes = token.scope || "";
  const tokenExpiresAt = token.expires_at ? new Date(token.expires_at) : null;

  // Pick a default location (first ACTIVE, else first).
  const locations = await squareListLocations(accessToken);
  const active = locations.find(l => (l.status || "").toUpperCase() === "ACTIVE");
  const locationId = (active || locations[0])?.id;
  if (!locationId) {
    return NextResponse.json(
      { error: "No Square location found for merchant", merchantId, loungeId },
      { status: 400 }
    );
  }

  // Persist connection (encrypt tokens at rest).
  const accessTokenEnc = encryptSecret(accessToken);
  const refreshTokenEnc = refreshToken ? encryptSecret(refreshToken) : null;

  await prisma.squareConnection.upsert({
    where: { loungeId },
    update: {
      merchantId,
      locationId,
      scopes,
      accessTokenEnc,
      refreshTokenEnc,
      tokenExpiresAt: tokenExpiresAt || undefined,
    },
    create: {
      loungeId,
      merchantId,
      locationId,
      scopes,
      accessTokenEnc,
      refreshTokenEnc,
      tokenExpiresAt: tokenExpiresAt || undefined,
    },
  });

  // Quick sanity check that decrypt works (defensive).
  try {
    decryptSecret(accessTokenEnc);
  } catch (e: any) {
    return NextResponse.json({ error: "Token encryption self-check failed", details: e?.message }, { status: 500 });
  }

  const okUrl = new URL(`${getAppBaseUrl()}/integrations/square/connected`);
  okUrl.searchParams.set("loungeId", loungeId);
  okUrl.searchParams.set("merchantId", merchantId);
  okUrl.searchParams.set("locationId", locationId);
  return NextResponse.redirect(okUrl.toString(), { status: 302 });
}

