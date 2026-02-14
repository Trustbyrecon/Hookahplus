/**
 * SDK Client Hooks
 * 
 * Agent: Lumi
 * Objective: O3.4 - SDK Client Hooks
 * 
 * React hooks and client-side utilities for tracking REM events
 */

import { useState, useEffect, useCallback } from 'react';
import { generateTrustEventId, validateTrustEvent, type TrustEvent, type TrustEventType } from './rem-types';
import { mapTrustEvent } from '../taxonomy/enums-v1';

const API_BASE = '/api/reflex/track';

/**
 * Generate anonymous hash for PII minimal (browser-safe)
 */
async function generateAnonHash(input: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side fallback
    const crypto = await import('crypto');
    return `sha256:${crypto.createHash('sha256').update(input).digest('hex')}`;
  }

  // Browser: use Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `sha256:${hashHex}`;
}

/**
 * Generate random signature (browser-safe)
 */
async function generateSignature(): Promise<string> {
  if (typeof window === 'undefined') {
    const crypto = await import('crypto');
    return `ed25519:${crypto.randomBytes(32).toString('base64')}`;
  }

  // Browser: use Web Crypto API
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  // Convert Uint8Array to string - use apply for ES5 compatibility
  const charCodes: number[] = [];
  for (let i = 0; i < array.length; i++) {
    charCodes.push(array[i]);
  }
  const base64 = btoa(String.fromCharCode.apply(null, charCodes));
  return `ed25519:${base64}`;
}

/**
 * Track a TrustEvent client-side
 */
export async function trackTrustEvent(
  type: TrustEventType,
  options: {
    sessionId?: string;
    paymentIntent?: string;
    payload?: Partial<TrustEvent>;
  } = {}
): Promise<{ ok: boolean; id?: string; trustEventId?: string }> {
  const { sessionId, paymentIntent, payload = {} } = options;

  // Generate sequence number (simple timestamp-based for client)
  const sequence = Date.now() % 1000000;

  // Create TrustEvent
  const anonHash = await generateAnonHash(payload.actor?.anon_hash || 'client');
  const signature = await generateSignature();

  const trustEvent: TrustEvent = {
    id: generateTrustEventId(sequence),
    ts_utc: new Date().toISOString(),
    type,
    actor: {
      anon_hash: payload.actor?.anon_hash || anonHash,
      customer_id: payload.actor?.customer_id,
      staff_id: payload.actor?.staff_id,
      device_id: payload.actor?.device_id || 'client-browser',
    },
    venue_id: payload.venue_id,
    session_id: sessionId || payload.session_id,
    context: payload.context || {
      vertical: 'hookah',
      time_local: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    },
    behavior: payload.behavior,
    sentiment: payload.sentiment,
    effect: {
      loyalty_delta: payload.effect?.loyalty_delta ?? 0,
      credit_type: 'HPLUS_CREDIT',
      reflex_delta: payload.effect?.reflex_delta,
      revenue_delta: payload.effect?.revenue_delta,
    },
    security: {
      signature: payload.security?.signature || signature,
      device_id: payload.security?.device_id || 'client-browser',
    },
  };

  // Validate event
  const validation = validateTrustEvent(trustEvent);
  if (!validation.valid) {
    console.warn('[Reflex Track] Event validation failed:', validation.errors);
  }

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        source: 'client',
        sessionId,
        paymentIntent,
        payload: trustEvent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to track event: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      ok: result.ok === true,
      id: result.id,
      trustEventId: result.trustEventId || trustEvent.id,
    };
  } catch (error) {
    console.error('[Reflex Track] Error tracking event:', error);
    return { ok: false };
  }
}

/**
 * Get Reflex score for a customer
 */
export async function getReflexScore(customerId: string): Promise<number | null> {
  try {
    const response = await fetch(`/api/reflex/score/${customerId}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.score || null;
  } catch (error) {
    console.error('[Reflex Score] Error fetching score:', error);
    return null;
  }
}

/**
 * React hook for tracking TrustEvents
 */
export function useReflexTrack() {
  const [isTracking, setIsTracking] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);

  const track = useCallback(async (
    type: TrustEventType,
    options?: {
      sessionId?: string;
      paymentIntent?: string;
      payload?: Partial<TrustEvent>;
    }
  ) => {
    setIsTracking(true);
    try {
      const result = await trackTrustEvent(type, options);
      if (result.ok && result.trustEventId) {
        setLastEventId(result.trustEventId);
      }
      return result;
    } finally {
      setIsTracking(false);
    }
  }, []);

  return {
    track,
    isTracking,
    lastEventId,
  };
}

/**
 * React hook for fetching Reflex score
 */
export function useReflexScore(customerId: string | null) {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!customerId) {
      setScore(null);
      return;
    }

    setLoading(true);
    setError(null);

    getReflexScore(customerId)
      .then((result) => {
        setScore(result);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to fetch Reflex score'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [customerId]);

  return { score, loading, error };
}

/**
 * Convenience functions for common event types
 */
export const ReflexEvents = {
  orderCreated: (sessionId: string, amountCents: number) => {
    const mapped = mapTrustEvent('order.created');
    const v1Type: TrustEventType = mapped.v1 || 'fast_checkout'; // Default to fast_checkout if unknown
    return trackTrustEvent(v1Type, {
      sessionId,
      payload: {
        effect: {
          loyalty_delta: 0,
          credit_type: 'HPLUS_CREDIT',
          revenue_delta: amountCents,
        },
      },
    });
  },

  orderCompleted: (sessionId: string, amountCents: number) => {
    const mapped = mapTrustEvent('order.completed');
    const v1Type: TrustEventType = mapped.v1 || 'fast_checkout'; // Default to fast_checkout if unknown
    return trackTrustEvent(v1Type, {
      sessionId,
      payload: {
        effect: {
          loyalty_delta: Math.floor(amountCents / 100) * 0.1, // 0.1 points per dollar
          credit_type: 'HPLUS_CREDIT',
          revenue_delta: amountCents,
        },
      },
    });
  },

  paymentSettled: (sessionId: string, paymentIntent: string, amountCents: number) => {
    const mapped = mapTrustEvent('payment.settled');
    const v1Type: TrustEventType = mapped.v1 || 'fast_checkout'; // Default to fast_checkout if unknown
    return trackTrustEvent(v1Type, {
      sessionId,
      paymentIntent,
      payload: {
        effect: {
          loyalty_delta: Math.floor(amountCents / 100) * 0.1,
          credit_type: 'HPLUS_CREDIT',
          revenue_delta: amountCents,
        },
      },
    });
  },

  sessionStarted: (sessionId: string) => {
    const mapped = mapTrustEvent('session.started');
    const v1Type: TrustEventType = mapped.v1 || 'fast_checkout'; // Default to fast_checkout if unknown
    return trackTrustEvent(v1Type, {
      sessionId,
      payload: {
        effect: {
          loyalty_delta: 0,
          credit_type: 'HPLUS_CREDIT',
        },
      },
    });
  },

  sessionCompleted: (sessionId: string, durationMinutes: number) => {
    const mapped = mapTrustEvent('session.completed');
    const v1Type: TrustEventType = mapped.v1 || 'on_time_delivery'; // Default to on_time_delivery if unknown
    return trackTrustEvent(v1Type, {
      sessionId,
      payload: {
        effect: {
          loyalty_delta: Math.floor(durationMinutes / 30) * 5, // 5 points per 30 min
          credit_type: 'HPLUS_CREDIT',
        },
        behavior: {
          action: 'session_completed',
          payload: { duration_minutes: durationMinutes },
        },
      },
    });
  },

  loyaltyIssued: (sessionId: string, amount: number) => {
    const mapped = mapTrustEvent('loyalty.issued');
    const v1Type: TrustEventType = mapped.v1 || 'loyalty_redeemed'; // Default to loyalty_redeemed if unknown
    return trackTrustEvent(v1Type, {
      sessionId,
      payload: {
        effect: {
          loyalty_delta: amount,
          credit_type: 'HPLUS_CREDIT',
        },
      },
    });
  },

  loyaltyRedeemed: (sessionId: string, amount: number) => {
    const mapped = mapTrustEvent('loyalty.redeemed');
    const v1Type: TrustEventType = mapped.v1 || 'loyalty_redeemed'; // Default to loyalty_redeemed if unknown
    return trackTrustEvent(v1Type, {
      sessionId,
      payload: {
        effect: {
          loyalty_delta: -amount,
          credit_type: 'HPLUS_CREDIT',
        },
      },
    });
  },
};

