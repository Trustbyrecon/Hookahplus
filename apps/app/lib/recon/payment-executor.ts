/**
 * Recon payment executor: performs Stripe refund when REFUND_EXECUTOR=recon.
 * Holds Stripe refund credentials (RECON_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY when running as Recon).
 * Idempotent: same idempotency_key returns existing result.
 */

import type { ActionIntent } from "./contract";
import type { ExecutionMetadata } from "./contract";
import { kvGet, kvSet } from "../kv-client";

const IDEMPOTENCY_PREFIX = "recon:refund:";
const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24h

export interface ExecuteRefundParams {
  intent: ActionIntent;
  adjusted_amount?: number;
}

/**
 * Execute refund via Stripe. Idempotent by intent.idempotency_key.
 * Returns execution_metadata for the decision response.
 */
export async function executeRefund(
  params: ExecuteRefundParams
): Promise<ExecutionMetadata> {
  const { intent, adjusted_amount } = params;
  const idempotencyKey = intent.idempotency_key;
  const cacheKey = IDEMPOTENCY_PREFIX + idempotencyKey;

  const cached = await kvGet<ExecutionMetadata>(cacheKey);
  if (cached) {
    return cached;
  }

  const amountToRefund = adjusted_amount ?? intent.amount;
  const paymentIntentId = intent.payment_intent_id;

  if (!paymentIntentId) {
    const result: ExecutionMetadata = {
      execution_status: "failed",
      error: "payment_intent_id required for Stripe refund",
    };
    await kvSet(cacheKey, result, IDEMPOTENCY_TTL);
    return result;
  }

  // Canonical: RECON_STRIPE_REFUND_KEY (refunds:write only). Legacy: RECON_STRIPE_SECRET_KEY, STRIPE_SECRET_KEY.
  const stripeSecret =
    process.env.RECON_STRIPE_REFUND_KEY ??
    process.env.RECON_STRIPE_SECRET_KEY ??
    process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    const result: ExecutionMetadata = {
      execution_status: "failed",
      error: "Stripe not configured (RECON_STRIPE_REFUND_KEY or legacy key)",
    };
    return result;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2025-08-27.basil",
    });

    // Contract: amount is in cents (see API_CONTRACT.md)
    const refund = await stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
        amount: amountToRefund,
        reason: "requested_by_customer",
      },
      { idempotencyKey }
    );

    const result: ExecutionMetadata = {
      execution_status: "completed",
      stripe_refund_id: refund.id,
    };
    await kvSet(cacheKey, result, IDEMPOTENCY_TTL);
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const result: ExecutionMetadata = {
      execution_status: "failed",
      error: message,
    };
    await kvSet(cacheKey, result, IDEMPOTENCY_TTL);
    return result;
  }
}
