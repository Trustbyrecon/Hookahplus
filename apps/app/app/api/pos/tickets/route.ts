import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/pos/tickets
 *
 * Minimal POS ticket ingestion endpoint used by reconciliation and E2E.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || undefined;
    const sessionId = searchParams.get("sessionId") || undefined;
    const loungeId = searchParams.get("loungeId") || undefined;
    const includeUnassigned = (searchParams.get("includeUnassigned") || "").toLowerCase() === "true";

    const takeRaw = searchParams.get("take");
    const take = Math.max(1, Math.min(200, takeRaw ? Number(takeRaw) : 50));

    const where: any = {};
    if (status) where.status = status;
    if (sessionId) where.sessionId = sessionId;

    const tickets = await prisma.posTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take,
    });

    // POS tickets don't currently store loungeId directly.
    // If a loungeId is provided, scope by joining through sessionId when present.
    let filtered = tickets;
    let sessionMetaById: Record<string, { loungeId: string; tableId: string | null } | undefined> = {};

    if (loungeId) {
      const sessionIds = Array.from(new Set(tickets.map((t) => t.sessionId).filter(Boolean))) as string[];
      if (sessionIds.length > 0) {
        const sessions = await prisma.session.findMany({
          where: { id: { in: sessionIds }, loungeId },
          select: { id: true, loungeId: true, tableId: true },
        });
        const allowed = new Set(sessions.map((s) => s.id));
        sessionMetaById = sessions.reduce((acc, s) => {
          acc[s.id] = { loungeId: s.loungeId, tableId: s.tableId ?? null };
          return acc;
        }, {} as Record<string, { loungeId: string; tableId: string | null }>);

        filtered = tickets.filter((t) => {
          if (!t.sessionId) return includeUnassigned;
          return allowed.has(t.sessionId);
        });
      } else if (!includeUnassigned) {
        filtered = [];
      }
    }

    const data = filtered.map((t) => ({
      ...t,
      sessionMeta: t.sessionId ? sessionMetaById[t.sessionId] ?? null : null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch POS tickets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/pos/tickets
 *
 * Minimal ticket binding update (attach ticket → session).
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const ticketId: string | undefined = body?.ticketId;
    if (!ticketId) {
      return NextResponse.json({ success: false, error: "ticketId is required" }, { status: 400 });
    }

    const sessionId: string | null = body?.sessionId != null ? String(body.sessionId) : null;
    const status: string | undefined = body?.status != null ? String(body.status) : undefined;

    const ticket = await prisma.posTicket.update({
      where: { ticketId },
      data: {
        sessionId,
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update POS ticket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ticketId: string | undefined = body?.ticketId;
    if (!ticketId) {
      return NextResponse.json({ success: false, error: "ticketId is required" }, { status: 400 });
    }

    const sessionId: string | null = body?.sessionId ?? null;
    const amountCents: number | null =
      typeof body?.amountCents === "number" ? body.amountCents : body?.amountCents != null ? Number(body.amountCents) : null;
    const status: string = (body?.status || "pending").toString();
    const posSystem: string | null = body?.posSystem ? body.posSystem.toString() : null;
    const items: string | null = body?.items ? body.items.toString() : null;
    const currency: string | null = body?.currency ? body.currency.toString() : null;
    const stripeChargeId: string | null = body?.stripeChargeId ? body.stripeChargeId.toString() : null;

    const ticket = await prisma.posTicket.upsert({
      where: { ticketId },
      create: {
        ticketId,
        sessionId,
        amountCents,
        status,
        posSystem,
        items,
        currency,
        stripeChargeId,
      },
      update: {
        sessionId,
        amountCents,
        status,
        posSystem,
        items,
        currency,
        stripeChargeId,
      },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to ingest POS ticket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

