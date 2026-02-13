/**
 * Recon contract validation (Zod). Use for H+ outbound and Recon inbound.
 */

import { z } from "zod";

const actionTypeSchema = z.enum([
  "refund.request",
  "recon.square.unassigned_ticket",
  "recon.square.reconciliation_drop",
  "recon.square.payment_mismatch",
  "recon.square.refund_mismatch",
]);
const initiatorTypeSchema = z.enum(["human", "ai"]);

const refundIntentSchema = z.object({
  action_type: z.literal("refund.request"),
  amount: z.number().min(0),
  session_id: z.string().min(1),
  lounge_id: z.string().min(1),
  initiator_type: initiatorTypeSchema,
  initiator_id: z.string().min(1),
  session_total: z.number().min(0),
  session_duration_min: z.number().min(0),
  refund_reason: z.string().optional(),
  historical_refund_rate: z.number().min(0).max(1).optional(),
  operator_refund_rate: z.number().min(0).max(1).optional(),
  timestamp: z.string().datetime(),
  idempotency_key: z.string().min(1),
  payment_intent_id: z.string().optional(),
});

const driftCountsSchema = z
  .object({
    expected: z.number().min(0).optional(),
    observed: z.number().min(0).optional(),
    delta: z.number().optional(),
    delta_pct: z.number().optional(),
  })
  .partial();

const driftEvidenceSchema = z
  .object({
    sample_ids: z.array(z.string()).max(50).optional(),
    reason: z.string().optional(),
  })
  .partial();

const driftIntentSchema = z.object({
  action_type: actionTypeSchema.refine((t) => t !== "refund.request", { message: "drift action_type required" }),
  lounge_id: z.string().min(1),
  tenant_id: z.string().uuid().nullable().optional(),
  location_id: z.string().nullable().optional(),
  window: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
  counts: driftCountsSchema.optional(),
  evidence: driftEvidenceSchema.optional(),
  risk_hints: z.array(z.string()).max(20).optional(),
  severity: z.enum(["info", "warning", "critical"]).optional(),
  timestamp: z.string().datetime(),
  idempotency_key: z.string().min(1),
});

export const actionIntentSchema = z.discriminatedUnion("action_type", [
  refundIntentSchema,
  // driftIntentSchema uses refine, so we list each literal for discriminated union compatibility
  driftIntentSchema.extend({ action_type: z.literal("recon.square.unassigned_ticket") }),
  driftIntentSchema.extend({ action_type: z.literal("recon.square.reconciliation_drop") }),
  driftIntentSchema.extend({ action_type: z.literal("recon.square.payment_mismatch") }),
  driftIntentSchema.extend({ action_type: z.literal("recon.square.refund_mismatch") }),
]);

export type ActionIntentParsed = z.infer<typeof actionIntentSchema>;

export function validateActionIntent(
  data: unknown
): { success: true; data: ActionIntentParsed } | { success: false; error: z.ZodError } {
  const result = actionIntentSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error };
}

export function assertActionIntent(data: unknown): ActionIntentParsed {
  return actionIntentSchema.parse(data);
}
