import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildIdentityKey, resolveSessionParticipant } from "@/lib/session/participant-resolver";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ResolveBody = {
  loungeId?: string;
  tableId?: string;
  identityToken?: string;
  displayName?: string;
  notMe?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as ResolveBody;
    const loungeId = (body.loungeId || "").trim();
    const tableId = (body.tableId || "").trim();
    const identityToken = (body.identityToken || "").trim();

    if (!loungeId || !tableId) {
      return NextResponse.json(
        { error: "loungeId and tableId are required" },
        { status: 400 }
      );
    }

    const effectiveIdentityToken =
      identityToken || `anon-${req.headers.get("x-forwarded-for") || "device"}`;

    const identityKey = buildIdentityKey({
      loungeId,
      rawIdentity: effectiveIdentityToken,
      forceNew: Boolean(body.notMe),
    });

    const result = await resolveSessionParticipant(prisma as any, {
      loungeId,
      tableId,
      identityKey,
      displayName: body.displayName || "Guest",
      notMe: Boolean(body.notMe),
    });

    if (result.mode === "blocked_multi_active") {
      return NextResponse.json(
        {
          ok: false,
          blocked: true,
          mode: result.mode,
          message: "We need staff to confirm your table before continuing.",
          conflictSessionIds: result.conflictSessionIds || [],
          staffResolution: {
            tableId,
            loungeId,
            path: `/admin/pos-ops?loungeId=${encodeURIComponent(loungeId)}&tableId=${encodeURIComponent(tableId)}`,
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: result.mode,
      session_id: result.sessionId,
      participant_id: result.participantId,
    });
  } catch (error: any) {
    console.error("[session/resolve] error", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to resolve session participant",
        details: error?.message || "unknown_error",
      },
      { status: 500 }
    );
  }
}
