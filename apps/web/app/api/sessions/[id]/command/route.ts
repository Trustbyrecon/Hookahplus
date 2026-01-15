export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { reduce, getSession, putSession, seedSession, type Command, type Session } from "@/lib/sessionState";
import { prisma } from "@/apps/web/lib/prisma";
import { squareCreateOrder } from "@/apps/web/lib/square";
import { withSquareConnection } from "@/apps/web/lib/squareConnection";

const DEFAULT_CURRENCY = (process.env.SQUARE_CURRENCY || "USD").toUpperCase();

// MVP: deterministic SKU pricing map (minor expansion later).
const SKU_PRICE_CENTS: Record<string, number> = {
  "hookah.session": 3000,
  "hookah_session": 3000,
  "coal.swap": 500,
  "coal_swap": 500,
};

function centsForSku(sku: string) {
  const direct = SKU_PRICE_CENTS[sku];
  if (typeof direct === "number") return direct;
  // fallback: any hookah.* SKU uses session base price
  if (sku.startsWith("hookah.")) return 3000;
  return 0;
}

async function maybeCreateSquareOrderForClosedSession(session: Session) {
  const loungeId = session?.meta?.loungeId;
  if (!loungeId) return { skipped: true, reason: "missing_loungeId" as const };

  const existing = await prisma.squareOrderLink.findUnique({
    where: { loungeId_sessionId: { loungeId, sessionId: session.id } },
  });
  if (existing) return { skipped: true, reason: "already_linked" as const, squareOrderId: existing.squareOrderId };

  const referenceId = `${loungeId}:${session.id}`;
  const idempotencyKey = `${loungeId}:${session.id}:order:v1`;

  const lineItems = (session.items || []).map(it => {
    const cents = centsForSku(it.sku);
    return {
      name: it.notes || it.sku,
      quantity: String(it.qty ?? 1),
      basePriceMoney: { amount: BigInt(cents), currency: DEFAULT_CURRENCY },
      note: it.sku,
    };
  });

  let created: { orderId: string };
  try {
    created = await withSquareConnection(loungeId, async ({ accessToken, locationId }) => {
      return await squareCreateOrder(accessToken, {
        locationId,
        referenceId,
        idempotencyKey,
        lineItems: lineItems.length
          ? lineItems
          : [
              {
                name: "Hookah+ Session",
                quantity: "1",
                basePriceMoney: { amount: BigInt(0), currency: DEFAULT_CURRENCY },
                note: "fallback_line_item",
              },
            ],
      });
    });
  } catch {
    return { skipped: true, reason: "not_connected" as const };
  }

  await prisma.squareOrderLink.create({
    data: {
      loungeId,
      sessionId: session.id,
      squareOrderId: created.orderId,
      status: "CREATED",
    },
  });

  return { skipped: false, squareOrderId: created.orderId };
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;
  const s0 = getSession(sessionId) || seedSession(sessionId);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // empty body is OK
  }

  const cmd = body?.cmd as Command;
  const data = body?.data ?? {};
  const actor = (body?.actor as "foh" | "boh" | "system" | "agent") || "agent";

  if (!cmd) return NextResponse.json({ error: "Missing cmd" }, { status: 400 });

  try {
    const s1 = reduce(structuredClone(s0), cmd, actor, data);
    putSession(s1);

    let square: any = undefined;
    if (s0.state !== "CLOSED" && s1.state === "CLOSED") {
      try {
        square = await maybeCreateSquareOrderForClosedSession(s1);
      } catch (e: any) {
        // Do not block closing the session on Square errors in MVP.
        square = { skipped: true, reason: "square_error", details: e?.message };
      }
    }

    return NextResponse.json({ ok: true, new_state: s1.state, session: s1, square });
  } catch (e: any) {
    const code = typeof e?.code === "number" ? e.code : 500;
    return NextResponse.json({ error: e?.message || "Command failed" }, { status: code });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Method not supported",
      message: "Use POST to send a session command.",
    },
    { status: 405 }
  );
}

