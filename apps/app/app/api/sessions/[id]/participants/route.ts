import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "session id is required" }, { status: 400 });
    }

    const participants = await prisma.participant.findMany({
      where: { sessionId },
      include: { prefs: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      participants: participants.map((p) => ({
        id: p.id,
        displayName: p.displayName,
        status: p.status,
        createdAt: p.createdAt,
        prefs: p.prefs
          ? {
              flavorProfile: p.prefs.flavorProfile,
              notes: p.prefs.notes,
              updatedAt: p.prefs.updatedAt,
            }
          : null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load participants", details: error?.message || "unknown_error" },
      { status: 500 }
    );
  }
}
