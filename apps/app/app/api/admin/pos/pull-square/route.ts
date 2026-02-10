import { NextRequest, NextResponse } from "next/server";
import { hasRole } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { SquareAdapter } from "../../../../../lib/pos/square";

function extractSessionIdFromReferenceId(referenceId: unknown): string | null {
  const ref = typeof referenceId === "string" ? referenceId : "";
  const m = /^hp_ord_(.+)$/.exec(ref);
  return m?.[1] || null;
}

function moneyToAmountCents(totalMoney: any): { amountCents: number | null; currency: string | null } {
  const amount = typeof totalMoney?.amount === "number" ? totalMoney.amount : totalMoney?.amount != null ? Number(totalMoney.amount) : null;
  const currency = typeof totalMoney?.currency === "string" ? totalMoney.currency : null;
  return {
    amountCents: Number.isFinite(amount as number) ? (amount as number) : null,
    currency,
  };
}

/**
 * POST /api/admin/pos/pull-square
 *
 * Pull recent Square orders and upsert into `pos_tickets`.
 * This makes tickets "real" (ingested from POS), and auto-links to sessions when
 * the Square order `reference_id` uses the Hookah+ convention: `hp_ord_<sessionId>`.
 *
 * Body:
 * - loungeId: string (required)
 * - sinceMinutes?: number (default 120)
 * - limit?: number (default 50, max 200)
 */
export async function POST(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== "production";
    const isAdmin = isDev ? true : await hasRole(req, ["admin", "owner"]);
    if (!isAdmin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const loungeId = typeof body?.loungeId === "string" ? body.loungeId : "";
    if (!loungeId) {
      return NextResponse.json({ success: false, error: "loungeId is required" }, { status: 400 });
    }

    const sinceMinutesRaw = body?.sinceMinutes != null ? Number(body.sinceMinutes) : 120;
    const sinceMinutes = Number.isFinite(sinceMinutesRaw) ? Math.max(5, Math.min(60 * 24 * 14, sinceMinutesRaw)) : 120; // 5 min .. 14 days

    const limitRaw = body?.limit != null ? Number(body.limit) : 50;
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, limitRaw)) : 50;

    const since = new Date(Date.now() - sinceMinutes * 60 * 1000);

    const adapter = new SquareAdapter({ venueId: loungeId });
    await adapter.initialize();

    const dbg = (adapter as any)?.debugState?.();
    if (dbg?.authMode !== "oauth") {
      return NextResponse.json(
        {
          success: false,
          error: `Square OAuth required for pull (loungeId=${loungeId})`,
          details: `Adapter initialized in ${dbg?.authMode || "unknown"} mode`,
        },
        { status: 400 },
      );
    }

    const orders: any[] = await (adapter as any).searchOrdersSince?.({ since, limit });
    if (!Array.isArray(orders)) {
      return NextResponse.json({ success: false, error: "Order search returned invalid result" }, { status: 500 });
    }

    let upserted = 0;
    let linked = 0;
    const ticketIds: string[] = [];

    for (const order of orders) {
      const ticketId = typeof order?.id === "string" ? order.id : null;
      if (!ticketId) continue;

      const sessionId = extractSessionIdFromReferenceId(order?.reference_id);
      const { amountCents, currency } = moneyToAmountCents(order?.total_money);
      const status = typeof order?.state === "string" ? order.state.toLowerCase() : "unknown";
      const items = order?.line_items ? JSON.stringify(order.line_items).slice(0, 10000) : null;

      await prisma.posTicket.upsert({
        where: { ticketId },
        create: {
          ticketId,
          sessionId,
          amountCents,
          currency,
          status,
          posSystem: "square",
          items,
        },
        update: {
          sessionId,
          amountCents,
          currency,
          status,
          posSystem: "square",
          items,
        },
      });

      upserted += 1;
      if (sessionId) linked += 1;
      ticketIds.push(ticketId);
    }

    return NextResponse.json({
      success: true,
      loungeId,
      since: since.toISOString(),
      ordersScanned: orders.length,
      ticketsUpserted: upserted,
      ticketsLinkedToSessions: linked,
      sampleTicketIds: ticketIds.slice(0, 10),
    });
  } catch (error) {
    console.error("[pos][pull-square] error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to pull Square orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

