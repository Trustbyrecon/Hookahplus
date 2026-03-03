/**
 * Guest Build Reflex Chain Client
 * 
 * Handles Customer Experience Layer (Layer 4) interactions from guest build
 */

import {
  CustomerReflexInput,
  CustomerReflexOutput,
} from '../../../app/lib/reflex-chain/types';

const REFLEX_CHAIN_API_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/reflex-chain/process`
  : 'http://localhost:3002/api/reflex-chain/process';

/**
 * Track QR scan event
 */
export async function trackQRScan(
  sessionId: string,
  customerId?: string,
  deviceId?: string
): Promise<void> {
  const input: CustomerReflexInput = {
    qrScan: {
      sessionId,
      scannedAt: Date.now(),
      customerId,
      deviceId: deviceId || `device_${Date.now()}`,
    },
  };

  try {
    const response = await fetch(REFLEX_CHAIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        layer: 'customer',
        sessionId,
        input,
      }),
    });

    if (!response.ok) {
      console.error('[Reflex Chain] QR scan tracking failed:', await response.text());
    }
  } catch (error) {
    console.error('[Reflex Chain] QR scan tracking error:', error);
  }
}

/**
 * Submit session rating
 */
export async function submitSessionRating(
  sessionId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  const input: CustomerReflexInput = {
    sessionRating: {
      sessionId,
      rating,
      feedback,
      submittedAt: Date.now(),
    },
  };

  try {
    const response = await fetch(REFLEX_CHAIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        layer: 'customer',
        sessionId,
        input,
      }),
    });

    if (!response.ok) {
      console.error('[Reflex Chain] Rating submission failed:', await response.text());
    }
  } catch (error) {
    console.error('[Reflex Chain] Rating submission error:', error);
  }
}

/**
 * Submit flavor feedback
 */
export async function submitFlavorFeedback(
  sessionId: string,
  flavors: Array<{ flavorId: string; rating: number; comment?: string }>
): Promise<void> {
  const input: CustomerReflexInput = {
    flavorFeedback: {
      sessionId,
      flavors,
      submittedAt: Date.now(),
    },
  };

  try {
    const response = await fetch(REFLEX_CHAIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        layer: 'customer',
        sessionId,
        input,
      }),
    });

    if (!response.ok) {
      console.error('[Reflex Chain] Flavor feedback failed:', await response.text());
    }
  } catch (error) {
    console.error('[Reflex Chain] Flavor feedback error:', error);
  }
}

/**
 * Track dwell time
 */
export async function trackDwellTime(
  sessionId: string,
  startTime: number,
  endTime?: number
): Promise<void> {
  const input: CustomerReflexInput = {
    dwellTime: {
      sessionId,
      startTime,
      endTime,
      duration: endTime ? endTime - startTime : Date.now() - startTime,
    },
  };

  try {
    const response = await fetch(REFLEX_CHAIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        layer: 'customer',
        sessionId,
        input,
      }),
    });

    if (!response.ok) {
      console.error('[Reflex Chain] Dwell time tracking failed:', await response.text());
    }
  } catch (error) {
    console.error('[Reflex Chain] Dwell time tracking error:', error);
  }
}

/**
 * Track re-order prompt response
 */
export async function trackReOrderPrompt(
  sessionId: string,
  promptType: 'extend' | 'reorder' | 'loyalty',
  customerResponse?: 'yes' | 'no' | 'later'
): Promise<void> {
  const input: CustomerReflexInput = {
    reOrderPrompts: {
      sessionId,
      promptShown: true,
      promptType,
      customerResponse,
    },
  };

  try {
    const response = await fetch(REFLEX_CHAIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        layer: 'customer',
        sessionId,
        input,
      }),
    });

    if (!response.ok) {
      console.error('[Reflex Chain] Re-order prompt tracking failed:', await response.text());
    }
  } catch (error) {
    console.error('[Reflex Chain] Re-order prompt tracking error:', error);
  }
}

/**
 * Get Reflex Chain flow state for a session
 */
export async function getReflexFlow(sessionId: string): Promise<any> {
  try {
    const response = await fetch(
      `${REFLEX_CHAIN_API_URL.replace('/process', '')}?sessionId=${sessionId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Reflex Chain flow');
    }

    const data = await response.json();
    return data.flow;
  } catch (error) {
    console.error('[Reflex Chain] Get flow error:', error);
    return null;
  }
}

