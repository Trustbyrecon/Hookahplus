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

export function buildPreorderTableNotes(
  guestNotes: string,
  meta: PreorderOperatorMetadata
): string {
  const block = `[Hookah+ Pre-Order]\n${JSON.stringify(meta)}`;
  return [guestNotes.trim(), block].filter(Boolean).join('\n\n');
}
