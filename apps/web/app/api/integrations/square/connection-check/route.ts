export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/apps/web/lib/prisma";
import { decryptSecret, squareListLocations } from "@/apps/web/lib/square";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const loungeId = searchParams.get("loungeId");
  if (!loungeId) return NextResponse.json({ error: "Missing loungeId" }, { status: 400 });

  const conn = await prisma.squareConnection.findUnique({ where: { loungeId } });
  if (!conn) return NextResponse.json({ error: "Not connected", loungeId }, { status: 404 });

  const accessToken = decryptSecret(conn.accessTokenEnc);
  const locations = await squareListLocations(accessToken);

  return NextResponse.json({
    ok: true,
    loungeId,
    merchantId: conn.merchantId,
    storedLocationId: conn.locationId,
    locations: locations.map(l => ({ id: l.id, name: l.name, status: l.status })),
  });
}

