export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { reduce, getSession, putSession, seedSession, type Command, type Session } from "@/lib/sessionState";
import { prisma } from "@/apps/web/lib/prisma";
import {
  squareCancelOrder,
  squareCreateExternalPayment,
  squareCreateOrder,
  squareCreateRefund,
  squareGetPayment,
  squarePayOrder,
  squareRetrieveLocation,
} from "@/apps/web/lib/square";
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
  const squareCustomerId = (session?.meta as any)?.squareCustomerId as string | undefined;

  const lineItems = (session.items || []).map(it => {
    const cents = centsForSku(it.sku);
    return {
      name: it.notes || it.sku,
      quantity: String(it.qty ?? 1),
      basePriceMoney: { amount: BigInt(cents), currency: DEFAULT_CURRENCY },
      note: it.sku,
    };
  });

  let created: { orderId: string; order?: any };
  try {
    created = await withSquareConnection(loungeId, async ({ accessToken, locationId }) => {
      // Ensure currency matches Square location currency (when available).
      const loc = await squareRetrieveLocation(accessToken, locationId);
      const currency = (loc?.location as any)?.currency || DEFAULT_CURRENCY;

      const lineItemsWithCurrency = lineItems.map(li => ({
        ...li,
        basePriceMoney: { ...li.basePriceMoney, currency },
      }));

      const orderRes = await squareCreateOrder(accessToken, {
        locationId,
        referenceId,
        idempotencyKey,
        customerId: squareCustomerId,
        lineItems: lineItemsWithCurrency.length
          ? lineItemsWithCurrency
          : [
              {
                name: "Hookah+ Session",
                quantity: "1",
                basePriceMoney: { amount: BigInt(0), currency },
                note: "fallback_line_item",
              },
            ],
      });

      // Prevent orphaned orders: create an external Square payment and pay the order.
      const billLineItems =
        lineItemsWithCurrency.length
          ? lineItemsWithCurrency
          : [
              {
                name: "Hookah+ Session",
                quantity: "1",
                basePriceMoney: { amount: BigInt(0), currency },
                note: "fallback_line_item",
              },
            ];

      let computedTotal = BigInt(0);
      for (const li of billLineItems) {
        const qty = BigInt(li.quantity || "1");
        computedTotal += qty * li.basePriceMoney.amount;
      }
      const orderTotalStr = (orderRes?.order as any)?.total_money?.amount || (orderRes?.order as any)?.total_amount_money?.amount;
      const totalCents = orderTotalStr ? BigInt(orderTotalStr) : computedTotal;

      try {
        const payment = await squareCreateExternalPayment(accessToken, {
          idempotencyKey: `${loungeId}:${session.id}:payment:v1`,
          amountMoney: { amount: totalCents, currency },
          orderId: orderRes.orderId,
          locationId,
          customerId: squareCustomerId,
          externalSource: "Hookah+",
          note: `Hookah+ ${session.id}`,
        });

        await squarePayOrder(accessToken, {
          orderId: orderRes.orderId,
          idempotencyKey: `${loungeId}:${session.id}:payorder:v1`,
          paymentIds: [payment.paymentId],
        });

        // Persist linkage + mark as paid
        await prisma.squareOrderLink.create({
          data: {
            loungeId,
            sessionId: session.id,
            squareOrderId: orderRes.orderId,
            status: "PAID",
            squarePaymentId: payment.paymentId,
          },
        });
      } catch (e: any) {
        // Best-effort: cancel the order so it isn't orphaned OPEN.
        const orderVersion = Number(orderRes?.order?.version || 1);
        try {
          await squareCancelOrder(accessToken, {
            orderId: orderRes.orderId,
            orderVersion,
            idempotencyKey: `${loungeId}:${session.id}:cancel:v1`,
          });
          await prisma.squareOrderLink.create({
            data: {
              loungeId,
              sessionId: session.id,
              squareOrderId: orderRes.orderId,
              status: "VOIDED",
            },
          });
        } catch {
          // If cancellation fails, allow caller to handle/alert.
        }
        throw e;
      }

      return { orderId: orderRes.orderId, order: orderRes.order };
    });
  } catch {
    return { skipped: true, reason: "not_connected" as const };
  }

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

    // If a refund is requested in Hookah+, push refund to Square (external payments) via Refunds API.
    if (s0.state !== "REFUND_REQUESTED" && s1.state === "REFUND_REQUESTED") {
      const loungeId = s1?.meta?.loungeId;
      if (loungeId) {
        const link = await prisma.squareOrderLink.findUnique({
          where: { loungeId_sessionId: { loungeId, sessionId: s1.id } },
        });
        if (link?.squarePaymentId) {
          try {
            await withSquareConnection(loungeId, async ({ accessToken }) => {
              const p = await squareGetPayment(accessToken, link.squarePaymentId!);
              const amt = p?.payment?.amount_money?.amount;
              const cur = p?.payment?.amount_money?.currency || DEFAULT_CURRENCY;
              const amount = amt ? BigInt(amt) : BigInt(0);
              const refund = await squareCreateRefund(accessToken, {
                idempotencyKey: `${loungeId}:${s1.id}:refund:v1`,
                paymentId: link.squarePaymentId!,
                amountMoney: { amount, currency: cur },
                reason: `Refund requested for Hookah+ ${s1.id}`,
              });
              await prisma.squareOrderLink.update({
                where: { id: link.id },
                data: { status: "REFUNDED", squareRefundId: refund.refundId },
              });
            });
          } catch (e: any) {
            square = { ...(square || {}), refund: { ok: false, details: e?.message } };
          }
        }
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

