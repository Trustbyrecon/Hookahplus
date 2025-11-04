/**
 * Reflex Chain Adapters
 * 
 * Connects Reflex Chain outputs to external systems:
 * - POS Adapter: Smart pricing and order logging
 * - Loyalty Adapter: Token issuance and rewards
 * - Session Replay Adapter: Heatmap and analytics
 */

import { 
  POSAdapterReflex,
  LoyaltyAdapterReflex,
  SessionReplayReflex,
  FOHReflexOutput,
  CustomerReflexOutput,
  DeliveryReflexOutput,
  ReflexChainFlow,
} from './types';

// ============================================================================
// POS Adapter: Smart Pricing + Order Logging
// ============================================================================

export class POSAdapter {
  /**
   * Sync FoH output to POS system
   */
  async syncToPOS(fohOutput: FOHReflexOutput): Promise<POSAdapterReflex> {
    const posReflex: POSAdapterReflex = {
      orderId: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sessionId: fohOutput.sessionActivated.sessionId,
      metadata: fohOutput.posMetadata,
      syncTimestamp: Date.now(),
    };

    // Emit POS sync event (would integrate with actual POS system)
    console.log('[POS Adapter] Syncing to POS:', {
      orderId: posReflex.orderId,
      sessionId: posReflex.sessionId,
      amount: posReflex.metadata.amount,
      items: posReflex.metadata.items.length,
    });

    // TODO: Integrate with actual POS adapter (Square, Toast, Clover)
    // await this.integrateWithPOS(posReflex);

    return posReflex;
  }

  /**
   * Calculate smart pricing based on session metadata
   */
  calculateSmartPricing(
    baseAmount: number,
    pricingModel: 'flat' | 'time-based',
    sessionDuration?: number,
    zone?: string
  ): number {
    let finalAmount = baseAmount;

    // Zone-based pricing multipliers
    const zoneMultipliers: { [key: string]: number } = {
      'VIP': 1.5,
      'Outdoor': 1.2,
      'Main': 1.0,
    };

    if (zone && zoneMultipliers[zone]) {
      finalAmount = Math.round(finalAmount * zoneMultipliers[zone]);
    }

    // Time-based pricing
    if (pricingModel === 'time-based' && sessionDuration) {
      const baseRate = finalAmount / 60; // per minute
      finalAmount = Math.round(baseRate * sessionDuration);
    }

    return finalAmount;
  }
}

// ============================================================================
// Loyalty Adapter: Token Issuance + Rewards
// ============================================================================

export class LoyaltyAdapter {
  /**
   * Sync customer output to Loyalty Engine
   */
  async syncToLoyalty(
    customerOutput: CustomerReflexOutput,
    sessionId: string
  ): Promise<LoyaltyAdapterReflex> {
    const loyaltyReflex: LoyaltyAdapterReflex = {
      customerId: customerOutput.sessionFingerprint.customerId || 'anonymous',
      sessionId,
      tokens: customerOutput.loyaltyTokens,
      syncTimestamp: Date.now(),
    };

    console.log('[Loyalty Adapter] Issuing loyalty tokens:', {
      customerId: loyaltyReflex.customerId,
      tokens: loyaltyReflex.tokens.tokensIssued,
      reason: loyaltyReflex.tokens.reason,
    });

    // TODO: Integrate with actual Loyalty Ledger API
    // await fetch('/api/loyalty/issue', { ... });

    return loyaltyReflex;
  }

  /**
   * Calculate loyalty tokens based on session metrics
   */
  calculateLoyaltyTokens(
    amount: number,
    rating?: number,
    isReOrder?: boolean
  ): number {
    let tokens = Math.floor(amount / 100); // 1 token per $1

    // Bonus for high ratings
    if (rating && rating >= 4) {
      tokens += Math.floor(tokens * 0.1); // 10% bonus
    }

    // Bonus for re-orders
    if (isReOrder) {
      tokens += 5; // Flat bonus
    }

    return tokens;
  }
}

// ============================================================================
// Session Replay Adapter: Heatmap + Analytics
// ============================================================================

export class SessionReplayAdapter {
  private heatmapData: Map<string, SessionReplayReflex['heatmap']> = new Map();

  /**
   * Sync delivery output to heatmap
   */
  async syncToHeatmap(
    deliveryOutput: DeliveryReflexOutput,
    flow: ReflexChainFlow
  ): Promise<SessionReplayReflex> {
    const sessionId = deliveryOutput.deliveryCompletion.sessionId;
    
    // Get or create heatmap entry
    let heatmap = this.heatmapData.get(sessionId) || [];
    
    // Add heatmap update
    heatmap.push({
      timestamp: Date.now(),
      zone: deliveryOutput.deliveryCompletion.heatmapUpdate.zone,
      tableId: deliveryOutput.deliveryCompletion.heatmapUpdate.tableId,
      status: deliveryOutput.deliveryCompletion.heatmapUpdate.status,
      trustScore: flow.sync.trust,
    });

    this.heatmapData.set(sessionId, heatmap);

    const replayReflex: SessionReplayReflex = {
      sessionId,
      heatmap,
      syncTimestamp: Date.now(),
    };

    console.log('[Session Replay Adapter] Updating heatmap:', {
      sessionId,
      zone: deliveryOutput.deliveryCompletion.heatmapUpdate.zone,
      tableId: deliveryOutput.deliveryCompletion.heatmapUpdate.tableId,
      trustScore: flow.sync.trust,
    });

    return replayReflex;
  }

  /**
   * Get heatmap data for a zone
   */
  getZoneHeatmap(zone: string): SessionReplayReflex['heatmap'] {
    const allHeatmaps: SessionReplayReflex['heatmap'] = [];
    
    for (const heatmap of this.heatmapData.values()) {
      allHeatmaps.push(...heatmap.filter(h => h.zone === zone));
    }

    return allHeatmaps.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get all active sessions in heatmap
   */
  getActiveSessions(): SessionReplayReflex[] {
    const active: SessionReplayReflex[] = [];
    
    for (const [sessionId, heatmap] of this.heatmapData.entries()) {
      const latest = heatmap[heatmap.length - 1];
      if (latest && latest.status === 'active') {
        active.push({
          sessionId,
          heatmap,
          syncTimestamp: Date.now(),
        });
      }
    }

    return active;
  }
}

// Export singleton instances
export const posAdapter = new POSAdapter();
export const loyaltyAdapter = new LoyaltyAdapter();
export const sessionReplayAdapter = new SessionReplayAdapter();

