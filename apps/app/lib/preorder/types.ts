/**
 * Pre-Order domain types — extensible for CLARK memory, QR linkage, lounge pricing.
 * Session rows use flavorMix (JSON), tableNotes, specialRequests, preorderId (optional).
 */

/** Wizard stages shown to the guest */
export type PreorderStage =
  | 'welcome'
  | 'flavors'
  | 'options'
  | 'guest'
  | 'review'
  | 'submitting';

/** Serialized into tableNotes / future PreOrder.metadata */
export interface PreorderOperatorMetadata {
  /** Always qr_preorder for this flow */
  channel: 'qr_preorder';
  loungeId: string;
  tableId: string;
  /** ISO timestamp when draft was started */
  draftStartedAt: string;
  pricingModel: 'flat' | 'time-based';
  sessionDurationMinutes: number;
  addOnIds: string[];
  partySize: number;
  /** Guest opted in to future preference memory (CLARK) */
  clarkMemoryOptIn: boolean;
  /** Version for forward-compatible parsers */
  schemaVersion: 1;
  /** How the table was chosen at pre-order time */
  tableAssignment?: 'qr_link' | 'staff_will_assign' | 'guest_specified';
}

/** Payload we attach to Stripe Checkout metadata (no raw PII) */
export interface PreorderStripeMetadata {
  h_session: string;
  hp_preorder: '1';
  hp_lounge: string;
  hp_table: string;
  hp_party_size: string;
  hp_pricing_model: string;
}

/** @deprecated System metadata now lives in Session.edgeNote (HOOKAH_PREORDER_JSON:…); guest text uses specialRequests. */
export function buildPreorderTableNotes(
  guestNotes: string,
  meta: PreorderOperatorMetadata
): string {
  const block = `[Hookah+ Pre-Order]\n${JSON.stringify(meta)}`;
  return [guestNotes.trim(), block].filter(Boolean).join('\n\n');
}

/** Server/client: prefix for preorder JSON blob in Session.edgeNote (not shown as staff notes). */
export const HOOKAH_PREORDER_EDGE_PREFIX = 'HOOKAH_PREORDER_JSON:';

export function serializePreorderEdgeNote(meta: PreorderOperatorMetadata): string {
  const json = JSON.stringify(meta);
  return HOOKAH_PREORDER_EDGE_PREFIX + json.slice(0, 6000);
}
