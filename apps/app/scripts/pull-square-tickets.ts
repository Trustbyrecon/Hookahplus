#!/usr/bin/env tsx

/**
 * Pull Square orders into `pos_tickets` (read-only on Square, writes to DB).
 *
 * Usage:
 *   tsx scripts/pull-square-tickets.ts <loungeId> [--since-minutes 120] [--limit 50]
 *
 * Notes:
 * - Requires Square OAuth mapping in DB for the given loungeId.
 * - Auto-links to sessions when Square order reference_id = `hp_ord_<sessionId>`.
 */

import { SquareAdapter } from "../lib/pos/square";
import { prisma } from "../lib/db";

function argValue(args: string[], name: string): string | null {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}

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

async function main() {
  const rawArgs = process.argv.slice(2);
  const loungeId = rawArgs.find((a) => a && !a.startsWith("-")) || "";

  if (!loungeId) {
    console.error("Usage: tsx scripts/pull-square-tickets.ts <loungeId> [--since-minutes 120] [--limit 50]");
    process.exit(1);
  }

  const sinceMinutesRaw = argValue(rawArgs, "--since-minutes");
  const limitRaw = argValue(rawArgs, "--limit");

  const sinceMinutes = Math.max(5, Math.min(60 * 24 * 14, sinceMinutesRaw ? Number(sinceMinutesRaw) : 120));
  const limit = Math.max(1, Math.min(200, limitRaw ? Number(limitRaw) : 50));
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000);

  const adapter = new SquareAdapter({ venueId: loungeId });
  await adapter.initialize();
  const dbg = (adapter as any)?.debugState?.();
  if (dbg?.authMode !== "oauth") {
    throw new Error(`Square OAuth required (loungeId=${loungeId}). Adapter mode: ${dbg?.authMode || "unknown"}`);
  }

  const orders: any[] = await (adapter as any).searchOrdersSince?.({ since, limit });
  if (!Array.isArray(orders)) {
    throw new Error("Order search returned invalid result");
  }

  let upserted = 0;
  let linked = 0;

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
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        loungeId,
        since: since.toISOString(),
        ordersScanned: orders.length,
        ticketsUpserted: upserted,
        ticketsLinkedToSessions: linked,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      try {
        await (prisma as any).$disconnect?.();
      } catch {
        // ignore
      }
    });
}

