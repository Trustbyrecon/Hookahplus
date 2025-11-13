/**
 * REM Schema TypeScript Types
 * 
 * Agent: Lumi
 * Generated from schema/rem/v1.yaml
 * 
 * Updated: Taxonomy v1 - TrustEventType now uses v1 six values
 */

// Taxonomy v1 - TrustEventType (6 core values)
export type TrustEventType =
  | 'on_time_delivery'
  | 'fav_used'
  | 'fast_checkout'
  | 'corrected_issue'
  | 'staff_greeting'
  | 'loyalty_redeemed';

// Legacy TrustEventType mapping (deprecated - 30-60 day window)
export const LEGACY_TRUST_EVENT_MAP: Record<string, TrustEventType> = {
  // Direct mappings
  'delivery_on_time': 'on_time_delivery',
  'favorite_applied': 'fav_used',
  'speedy_checkout': 'fast_checkout',
  'issue_fixed': 'corrected_issue',
  'greeted_guest': 'staff_greeting',
  'reward_claimed': 'loyalty_redeemed',
  
  // Legacy REM event type mappings
  'order.created': 'fast_checkout',
  'order.completed': 'fast_checkout',
  'payment.settled': 'fast_checkout',
  'loyalty.redeemed': 'loyalty_redeemed',
  'session.completed': 'on_time_delivery',
  'session.started': 'fast_checkout',
  'loyalty.issued': 'loyalty_redeemed',
};

export type SentimentType = 'relaxed' | 'energetic' | 'social' | 'focused' | 'neutral';

export interface TrustEventActor {
  customer_id?: string; // Format: CUST-{id}
  anon_hash: string; // Format: sha256:{hash} - REQUIRED for PII minimal
  staff_id?: string; // Format: STAFF-{id}
  device_id?: string;
}

export interface TrustEventContext {
  vertical?: 'hookah' | 'food' | 'beverage';
  zone?: string;
  time_local?: string; // Format: HH:MM
  table_id?: string;
}

export interface TrustEventBehavior {
  action?: string;
  payload?: Record<string, any>;
}

export interface TrustEventSentiment {
  inferred?: SentimentType;
  confidence?: number; // 0.0 - 1.0
}

export interface TrustEventEffect {
  loyalty_delta: number; // REQUIRED - positive = issued, negative = redeemed
  credit_type: 'HPLUS_CREDIT'; // REQUIRED - non-crypto loyalty ledger
  reflex_delta?: number;
  revenue_delta?: number; // in cents
}

export interface TrustEventSecurity {
  signature: string; // Format: ed25519:{signature} - REQUIRED
  device_id?: string;
  ip_hash?: string; // Format: sha256:{hash}
}

export interface TrustEvent {
  id: string; // Format: TE-{yyyy}-{seq}
  ts_utc: string; // ISO 8601 timestamp
  type: TrustEventType;
  actor: TrustEventActor; // REQUIRED
  venue_id?: string; // Format: HPLUS-{location}-{id}
  session_id?: string; // Format: S-{id}
  context?: TrustEventContext;
  behavior?: TrustEventBehavior;
  sentiment?: TrustEventSentiment;
  effect: TrustEventEffect; // REQUIRED
  security: TrustEventSecurity; // REQUIRED
}

/**
 * Validate TrustEvent structure
 */
export function validateTrustEvent(event: Partial<TrustEvent>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!event.id || !/^TE-\d{4}-\d+$/.test(event.id)) {
    errors.push('Invalid id format: must be TE-{yyyy}-{seq}');
  }

  if (!event.ts_utc) {
    errors.push('ts_utc is required');
  }

  if (!event.type) {
    errors.push('type is required');
  }

  if (!event.actor) {
    errors.push('actor is required');
  } else {
    if (!event.actor.anon_hash || !/^sha256:[a-f0-9]{64}$/.test(event.actor.anon_hash)) {
      errors.push('actor.anon_hash is required and must be sha256:{hash}');
    }
  }

  if (!event.effect) {
    errors.push('effect is required');
  } else {
    if (event.effect.loyalty_delta === undefined) {
      errors.push('effect.loyalty_delta is required');
    }
    if (event.effect.credit_type !== 'HPLUS_CREDIT') {
      errors.push('effect.credit_type must be HPLUS_CREDIT');
    }
  }

  if (!event.security) {
    errors.push('security is required');
  } else {
    if (!event.security.signature || !/^ed25519:/.test(event.security.signature)) {
      errors.push('security.signature is required and must be ed25519:{signature}');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate TrustEvent ID
 */
export function generateTrustEventId(sequence: number): string {
  const year = new Date().getFullYear();
  return `TE-${year}-${sequence.toString().padStart(6, '0')}`;
}

/**
 * Create TrustEvent from ReflexEvent payload
 */
export function createTrustEventFromReflexEvent(
  reflexEvent: {
    type: string;
    payload?: string;
    sessionId?: string;
    createdAt: Date;
  },
  sequence: number
): TrustEvent | null {
  try {
    const payload = reflexEvent.payload ? JSON.parse(reflexEvent.payload) : {};

    // Map ReflexEvent type to TrustEvent v1 type
    // Use legacy mapping, fallback to direct check if already v1
    let trustEventType: TrustEventType | null = null;
    
    // Check legacy mapping first
    const mapped = LEGACY_TRUST_EVENT_MAP[reflexEvent.type];
    if (mapped) {
      trustEventType = mapped;
    } else if (['on_time_delivery', 'fav_used', 'fast_checkout', 'corrected_issue', 'staff_greeting', 'loyalty_redeemed'].includes(reflexEvent.type)) {
      // Already a v1 type
      trustEventType = reflexEvent.type as TrustEventType;
    }
    
    if (!trustEventType) {
      // Unknown event type - return null (will be tracked by unknown tracker)
      console.warn(`[REM Types] Unknown TrustEventType: ${reflexEvent.type}`);
      return null;
    }

    const trustEvent: TrustEvent = {
      id: generateTrustEventId(sequence),
      ts_utc: reflexEvent.createdAt.toISOString(),
      type: trustEventType,
      actor: {
        anon_hash: payload.actor?.anon_hash || 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
        customer_id: payload.actor?.customer_id,
        staff_id: payload.actor?.staff_id,
        device_id: payload.actor?.device_id,
      },
      venue_id: payload.venue_id,
      session_id: reflexEvent.sessionId || payload.session_id,
      context: payload.context,
      behavior: payload.behavior,
      sentiment: payload.sentiment,
      effect: {
        loyalty_delta: payload.effect?.loyalty_delta || 0,
        credit_type: 'HPLUS_CREDIT',
        reflex_delta: payload.effect?.reflex_delta,
        revenue_delta: payload.effect?.revenue_delta,
      },
      security: {
        signature: payload.security?.signature || 'ed25519:placeholder',
        device_id: payload.security?.device_id,
        ip_hash: payload.security?.ip_hash,
      },
    };

    return trustEvent;
  } catch (error) {
    console.error('[REM Types] Error creating TrustEvent:', error);
    return null;
  }
}

