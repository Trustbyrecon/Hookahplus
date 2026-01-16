export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/apps/web/lib/prisma";
import { getAppBaseUrl, verifySquareWebhookSignature } from "@/apps/web/lib/square";
import { getSession, putSession, reduce } from "@/lib/sessionState";

type SquareWebhookEnvelope = {
  merchant_id?: string;
  type?: string;
  event_id?: string;
  data?: {
    id?: string;
    type?: string;
    object?: any;
  };
};

function nowIso() {
  return new Date().toISOString();
}

function extractObjects(evt: SquareWebhookEnvelope) {
  const obj = evt?.data?.object || {};
  const payment = obj?.payment || obj?.payment_updated?.payment || obj?.payment_created?.payment;
  const refund = obj?.refund || obj?.refund_updated?.refund || obj?.refund_created?.refund;
  const order = obj?.order || obj?.order_updated?.order || obj?.order_created?.order;
  return { payment, refund, order };
}

async function noteSession(sessionId: string, meta: Record<string, any>) {
  const s = getSession(sessionId);
  if (!s) return;
  s.audit.push({
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: "session.note",
    ts: Date.now(),
    actor: { role: "system" },
    sessionId,
    meta,
  });
  putSession(s);
}

async function applyRefundToSession(sessionId: string, meta: Record<string, any>) {
  const s0 = getSession(sessionId);
  if (!s0) return;
  try {
    const s1 = reduce(structuredClone(s0), "REFUND_REQUEST" as any, "system", meta);
    const s2 = reduce(structuredClone(s1), "REFUND_COMPLETE" as any, "system", meta);
    putSession(s2);
  } catch {
    // If state machine blocks, at least record an audit note.
    await noteSession(sessionId, { ...meta, warning: "refund_transition_blocked" });
  }
}

async function applyVoidToSession(sessionId: string, meta: Record<string, any>) {
  const s0 = getSession(sessionId);
  if (!s0) return;
  try {
    const s1 = reduce(structuredClone(s0), "VOID" as any, "system", meta);
    putSession(s1);
  } catch {
    await noteSession(sessionId, { ...meta, warning: "void_transition_blocked" });
  }
}

export async function POST(req: Request) {
  const sig = req.headers.get("x-square-hmacsha256-signature");
  if (!sig) return NextResponse.json({ error: "Missing x-square-hmacsha256-signature" }, { status: 400 });

  const raw = await req.text();
  const notificationUrl = `${getAppBaseUrl()}/api/webhooks/square`;
  const okSig = verifySquareWebhookSignature({ signatureHeader: sig, rawBody: raw, notificationUrl });
  if (!okSig) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  let evt: SquareWebhookEnvelope;
  try {
    evt = JSON.parse(raw) as SquareWebhookEnvelope;
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid JSON body", details: e?.message }, { status: 400 });
  }

  const eventId = evt.event_id || "";
  const eventType = evt.type || "";
  const merchantId = evt.merchant_id || "";

  if (!eventId) return NextResponse.json({ error: "Missing event_id" }, { status: 400 });

  // Dedupe: ONLY ack duplicates once processedAt is set.
  // This allows Square retries to re-process if we previously crashed mid-handler.
  let existing = await prisma.squareWebhookEvent.findUnique({ where: { eventId } });
  if (existing?.processedAt) {
    return NextResponse.json({ ok: true, deduped: true, eventId }, { status: 200 });
  }
  if (!existing) {
    try {
      await prisma.squareWebhookEvent.create({
        data: { eventId, eventType, merchantId, body: raw },
      });
    } catch (e: any) {
      if (e?.code === "P2002") {
        existing = await prisma.squareWebhookEvent.findUnique({ where: { eventId } });
        if (existing?.processedAt) {
          return NextResponse.json({ ok: true, deduped: true, eventId }, { status: 200 });
        }
        // else: fall through to processing (retry semantics)
      } else {
        return NextResponse.json({ error: "Failed to store webhook event", details: e?.message }, { status: 500 });
      }
    }
  }

  try {
    // Handle authorization revocation / app deauthorization (best-effort).
    // Square event naming varies by subscription; treat any "oauth" + "revok" as a revocation signal.
    if (merchantId && eventType.toLowerCase().includes("oauth") && eventType.toLowerCase().includes("revok")) {
      const loungeIds = (await prisma.squareConnection.findMany({
        where: { merchantId },
        select: { loungeId: true },
      })).map(x => x.loungeId);

      await prisma.$transaction([
        prisma.squareOrderLink.deleteMany({ where: { loungeId: { in: loungeIds } } }),
        prisma.squareConnection.deleteMany({ where: { merchantId } }),
      ]);

      await prisma.squareWebhookEvent.update({
        where: { eventId },
        data: { processedAt: new Date() },
      });

      return NextResponse.json(
        { ok: true, processed: true, eventId, eventType, merchantId, action: "disconnected" },
        { status: 200 }
      );
    }

    const { payment, refund, order } = extractObjects(evt);

    const squareOrderId: string | undefined =
      payment?.order_id || refund?.order_id || order?.id;
    const squarePaymentId: string | undefined = payment?.id || refund?.payment_id;
    const squareRefundId: string | undefined = refund?.id;

    const link =
      (squareOrderId
        ? await prisma.squareOrderLink.findUnique({ where: { squareOrderId } })
        : null) ||
      (squarePaymentId
        ? await prisma.squareOrderLink.findFirst({ where: { squarePaymentId } })
        : null);

    if (!link) {
      await prisma.squareWebhookEvent.update({
        where: { eventId },
        data: { processedAt: new Date() },
      });
      return NextResponse.json(
        { ok: true, processed: false, reason: "unlinked_event", eventId, eventType, merchantId, at: nowIso() },
        { status: 200 }
      );
    }

    // Determine desired status update.
    let nextStatus: "CREATED" | "PAID" | "REFUNDED" | "VOIDED" | null = null;

    const paymentStatus = (payment?.status || "").toUpperCase();
    const refundStatus = (refund?.status || "").toUpperCase();
    const orderState = (order?.state || "").toUpperCase();

    if (refund && (refundStatus === "COMPLETED" || refundStatus === "SUCCESS")) {
      nextStatus = "REFUNDED";
    } else if (payment && paymentStatus === "COMPLETED") {
      nextStatus = "PAID";
    } else if (payment && paymentStatus === "CANCELED") {
      nextStatus = "VOIDED";
    } else if (order && orderState === "CANCELED") {
      nextStatus = "VOIDED";
    }

    if (nextStatus) {
      await prisma.squareOrderLink.update({
        where: { id: link.id },
        data: {
          status: nextStatus,
          ...(squarePaymentId ? { squarePaymentId } : {}),
          ...(squareRefundId ? { squareRefundId } : {}),
        },
      });

      // Update Hookah+ in-memory session status.
      const meta = {
        source: "square.webhook",
        eventId,
        eventType,
        squareOrderId: link.squareOrderId,
        squarePaymentId,
        squareRefundId,
        nextStatus,
      };

      if (nextStatus === "PAID") {
        const s = getSession(link.sessionId);
        if (s) {
          s.payment.status = "confirmed";
          putSession(s);
        }
        await noteSession(link.sessionId, meta);
      }
      if (nextStatus === "REFUNDED") await applyRefundToSession(link.sessionId, meta);
      if (nextStatus === "VOIDED") await applyVoidToSession(link.sessionId, meta);
    }

    await prisma.squareWebhookEvent.update({
      where: { eventId },
      data: { processedAt: new Date() },
    });

    return NextResponse.json(
      { ok: true, processed: true, eventId, eventType, merchantId, squareOrderId: link.squareOrderId, nextStatus, at: nowIso() },
      { status: 200 }
    );
  } catch (e: any) {
    // Ensure failures show up in runtime logs so operators can debug quickly.
    console.error("[square_webhook] processing_failed", { eventId, eventType, merchantId, error: e?.message });
    // Leave processedAt unset so Square retries will re-process (see dedupe logic above).
    return NextResponse.json({ error: "Webhook processing failed", eventId }, { status: 500 });
  }
}

