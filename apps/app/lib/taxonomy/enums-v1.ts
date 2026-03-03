/**
 * Taxonomy v1 - Enum Definitions
 * 
 * Standardized categorical values for ≥95% operational reliability.
 * Focus on 80% "known types" set. Unknowns funnel into `unknown` with telemetry.
 * 
 * Agent: Noor (session_agent)
 * Version: v1
 */

// ============================================================================
// SessionState v1 - 8 values
// ============================================================================

export const SessionStateV1 = [
  'queued',
  'prep',
  'handoff',
  'delivering',
  'delivered',
  'checkout',
  'closed',
  'canceled'
] as const;

export type SessionStateV1 = typeof SessionStateV1[number];

// Legacy SessionState enum values
type LegacySessionState = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'CANCELED';

/**
 * Map legacy SessionState to v1 SessionState
 * 
 * Mapping rules:
 * - PENDING → queued
 * - ACTIVE → prep or handoff (based on heuristics)
 * - PAUSED → underlying state + paused flag
 * - CLOSED → closed
 * - CANCELED → canceled
 */
export function mapSessionState(
  legacy: LegacySessionState | string,
  session: {
    handoff_started_at?: Date | string | null;
    prep_started_at?: Date | string | null;
    [key: string]: any;
  }
): { state: SessionStateV1; paused: boolean } {
  switch (legacy) {
    case 'PENDING':
      return { state: 'queued', paused: false };

    case 'ACTIVE':
      // Heuristic: check if handoff or prep has started
      if (session.handoff_started_at) {
        return { state: 'handoff', paused: false };
      }
      if (session.prep_started_at) {
        return { state: 'prep', paused: false };
      }
      // Default to prep if no timestamps available
      return { state: 'prep', paused: false };

    case 'PAUSED':
      // Map to underlying phase + paused=true
      // PAUSED is a modifier, not a flow step
      if (session.handoff_started_at) {
        return { state: 'handoff', paused: true };
      }
      if (session.prep_started_at) {
        return { state: 'prep', paused: true };
      }
      return { state: 'queued', paused: true };

    case 'CLOSED':
      return { state: 'closed', paused: false };

    case 'CANCELED':
      return { state: 'canceled', paused: false };

    default:
      // Unknown legacy value - default to queued
      console.warn(`[Taxonomy] Unknown SessionState: ${legacy}, defaulting to queued`);
      return { state: 'queued', paused: false };
  }
}

/**
 * Validate SessionState v1 value
 */
export function isValidSessionStateV1(value: string): value is SessionStateV1 {
  return SessionStateV1.includes(value as SessionStateV1);
}

// ============================================================================
// TrustEventType v1 - 6 values
// ============================================================================

export const TrustEventTypeV1 = [
  'on_time_delivery',
  'fav_used',
  'fast_checkout',
  'corrected_issue',
  'staff_greeting',
  'loyalty_redeemed'
] as const;

export type TrustEventTypeV1 = typeof TrustEventTypeV1[number];

/**
 * Legacy TrustEventType mapping
 * Maps old event types to v1 types
 */
export const LEGACY_TRUST_EVENT_MAP: Record<string, TrustEventTypeV1> = {
  // Direct mappings
  'delivery_on_time': 'on_time_delivery',
  'favorite_applied': 'fav_used',
  'speedy_checkout': 'fast_checkout',
  'issue_fixed': 'corrected_issue',
  'greeted_guest': 'staff_greeting',
  'reward_claimed': 'loyalty_redeemed',
  
  // Additional legacy mappings (from rem-types.ts)
  'order.created': 'fast_checkout', // Order creation indicates checkout process started
  'order.completed': 'fast_checkout', // Completed orders often indicate fast checkout
  'payment.settled': 'fast_checkout', // Settled payments indicate successful checkout
  'loyalty.redeemed': 'loyalty_redeemed', // Direct match
  'session.completed': 'on_time_delivery', // Completed sessions often indicate on-time delivery
  'session.started': 'fast_checkout', // Session start indicates checkout process
  'loyalty.issued': 'loyalty_redeemed', // Loyalty issuance is similar to redemption
};

/**
 * Map legacy TrustEventType to v1 TrustEventType
 * 
 * Returns v1 type if mapped, or unknown label if not mappable
 */
export function mapTrustEvent(
  legacy: string
): { v1?: TrustEventTypeV1; unknown?: string } {
  // Check direct mapping
  const v1 = LEGACY_TRUST_EVENT_MAP[legacy];
  if (v1) {
    return { v1 };
  }

  // Check if already a v1 value
  if (isValidTrustEventTypeV1(legacy)) {
    return { v1: legacy };
  }

  // Unknown - return for telemetry
  return { unknown: legacy };
}

/**
 * Validate TrustEventType v1 value
 */
export function isValidTrustEventTypeV1(value: string): value is TrustEventTypeV1 {
  return TrustEventTypeV1.includes(value as TrustEventTypeV1);
}

// ============================================================================
// DriftReason v1 - 6 values
// ============================================================================

export const DriftReasonV1 = [
  'slow_handoff',
  'long_dwell',
  'payment_retry',
  'missing_notes',
  'queue_backlog',
  'no_show'
] as const;

export type DriftReasonV1 = typeof DriftReasonV1[number];

/**
 * Legacy DriftReason mapping
 * Maps old drift reasons to v1 types
 */
export const LEGACY_DRIFT_REASON_MAP: Record<string, DriftReasonV1> = {
  'slow_handoff': 'slow_handoff',
  'long_dwell': 'long_dwell',
  'payment_retry': 'payment_retry',
  'missing_notes': 'missing_notes',
  'queue_backlog': 'queue_backlog',
  'no_show': 'no_show',
  
  // Additional legacy mappings
  'handoff_delay': 'slow_handoff',
  'dwell_time_exceeded': 'long_dwell',
  'payment_failed': 'payment_retry',
  'notes_missing': 'missing_notes',
  'queue_overflow': 'queue_backlog',
  'customer_no_show': 'no_show',
};

/**
 * Map legacy DriftReason to v1 DriftReason
 * 
 * Returns v1 type if mapped, or unknown label if not mappable
 */
export function mapDriftReason(
  legacy: string
): { v1?: DriftReasonV1; unknown?: string } {
  // Check direct mapping
  const v1 = LEGACY_DRIFT_REASON_MAP[legacy];
  if (v1) {
    return { v1 };
  }

  // Check if already a v1 value
  if (isValidDriftReasonV1(legacy)) {
    return { v1: legacy };
  }

  // Unknown - return for telemetry
  return { unknown: legacy };
}

/**
 * Validate DriftReason v1 value
 */
export function isValidDriftReasonV1(value: string): value is DriftReasonV1 {
  return DriftReasonV1.includes(value as DriftReasonV1);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate all enum values at once
 */
export function validateEnumValue(
  enumType: 'SessionState' | 'TrustEventType' | 'DriftReason',
  value: string
): boolean {
  switch (enumType) {
    case 'SessionState':
      return isValidSessionStateV1(value);
    case 'TrustEventType':
      return isValidTrustEventTypeV1(value);
    case 'DriftReason':
      return isValidDriftReasonV1(value);
    default:
      return false;
  }
}

/**
 * Get all valid values for an enum type
 */
export function getEnumValues(
  enumType: 'SessionState' | 'TrustEventType' | 'DriftReason'
): readonly string[] {
  switch (enumType) {
    case 'SessionState':
      return SessionStateV1;
    case 'TrustEventType':
      return TrustEventTypeV1;
    case 'DriftReason':
      return DriftReasonV1;
    default:
      return [];
  }
}

