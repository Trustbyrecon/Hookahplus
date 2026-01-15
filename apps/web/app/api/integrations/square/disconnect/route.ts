export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/apps/web/lib/prisma";
import { decryptSecret, squareRevokeToken } from "@/apps/web/lib/square";
import { auth } from "@/apps/web/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized", hint: "Sign in to disconnect Square." },
      { status: 401 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const loungeId = body?.loungeId as string | undefined;
  if (!loungeId) return NextResponse.json({ ok: false, error: "Missing loungeId" }, { status: 400 });

  const conn = await prisma.squareConnection.findUnique({ where: { loungeId } });
  if (!conn) {
    return NextResponse.json({ ok: true, loungeId, disconnected: true, message: "Already disconnected" }, { status: 200 });
  }

  const accessToken = decryptSecret(conn.accessTokenEnc);

  // Try to revoke at Square, but always proceed to local disconnect.
  let revoked: any = null;
  try {
    revoked = await squareRevokeToken({ accessToken });
  } catch (e: any) {
    revoked = { success: false, error: e?.message || "revoke_failed" };
  }

  await prisma.$transaction([
    prisma.squareOrderLink.deleteMany({ where: { loungeId } }),
    prisma.squareConnection.delete({ where: { loungeId } }),
  ]);

  return NextResponse.json({
    ok: true,
    loungeId,
    disconnected: true,
    revoked,
    hint: "If you reconnect later, run connection-check to verify locations.",
  });
}

