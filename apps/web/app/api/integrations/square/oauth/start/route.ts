export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { buildSquareAuthorizeRedirect, getAppBaseUrl } from "@/apps/web/lib/square";

export async function GET(req: Request) {
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

  const { url } = buildSquareAuthorizeRedirect({ loungeId, redirectUri, scopes });
  return NextResponse.redirect(url, { status: 302 });
}

