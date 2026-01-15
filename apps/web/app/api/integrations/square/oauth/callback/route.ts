export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
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

  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  if (!state) return NextResponse.json({ error: "Missing state" }, { status: 400 });

  let loungeId = "";
  try {
    const decoded = verifyOAuthState(state);
    loungeId = decoded.loungeId;
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid state", details: e?.message }, { status: 400 });
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

  return NextResponse.json({
    ok: true,
    loungeId,
    merchantId,
    locationId,
    scopes: scopes.split(" ").filter(Boolean),
  });
}

