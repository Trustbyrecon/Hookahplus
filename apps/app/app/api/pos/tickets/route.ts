import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/pos/tickets
 *
 * Minimal POS ticket ingestion endpoint used by reconciliation and E2E.
 */
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

