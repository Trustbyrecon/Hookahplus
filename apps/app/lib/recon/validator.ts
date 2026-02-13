/**
 * Recon contract validation (Zod). Use for H+ outbound and Recon inbound.
 */

import { z } from "zod";

const actionTypeSchema = z.enum(["refund.request"]);
const initiatorTypeSchema = z.enum(["human", "ai"]);

export const actionIntentSchema = z.object({
  action_type: actionTypeSchema,
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
