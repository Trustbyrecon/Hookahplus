export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { squareListLocations } from "@/apps/web/lib/square";
import { withSquareConnection } from "@/apps/web/lib/squareConnection";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const loungeId = searchParams.get("loungeId");
  if (!loungeId) return NextResponse.json({ error: "Missing loungeId" }, { status: 400 });

  try {
    const out = await withSquareConnection(loungeId, async ({ accessToken, locationId, merchantId }) => {
      const locations = await squareListLocations(accessToken);
      return { locations, locationId, merchantId };
    });

    return NextResponse.json({
      ok: true,
      loungeId,
      merchantId: out.merchantId,
      storedLocationId: out.locationId,
      locations: out.locations.map(l => ({ id: l.id, name: l.name, status: l.status })),
    });
  } catch (e: any) {
    const msg = e?.message || "Connection check failed";
    const status = msg.includes("not connected") ? 404 : 500;
    return NextResponse.json(
      { ok: false, error: "Square connection check failed", hint: "Reconnect Square if this persists.", details: msg },
      { status }
    );
  }
}

