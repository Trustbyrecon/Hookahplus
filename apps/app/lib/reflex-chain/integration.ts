/**
 * Reflex Chain Integration with Session State Machine
 * 
 * Connects Reflex Chain layers to existing session state transitions
 */

import { reflexChainEngine } from './core';
import { posAdapter, loyaltyAdapter, sessionReplayAdapter } from './adapters';
import { FireSession, SessionStatus, SessionAction } from '../../types/enhancedSession';
import {
  BOHReflexInput,
  BOHReflexOutput,
  FOHReflexInput,
  FOHReflexOutput,
  DeliveryReflexInput,
  DeliveryReflexOutput,
} from './types';

/**
 * Map session source from Prisma format to Reflex Chain format
 * Prisma: 'QR' | 'RESERVE' | 'WALK_IN' | 'POS'
 * Reflex Chain: 'payment' | 'preorder' | 'walk-in'
 */
function mapSessionSourceToReflexSource(source?: string): 'payment' | 'preorder' | 'walk-in' {
  if (!source) return 'walk-in';
  
  switch (source.toUpperCase()) {
    case 'QR':
      return 'preorder';
    case 'RESERVE':
      return 'preorder';
    case 'POS':
      return 'payment';
    case 'WALK_IN':
    default:
      return 'walk-in';
  }
}

/**
 * Initialize Reflex Chain when session is created/paid
 */
export async function initializeReflexChain(session: FireSession): Promise<void> {
  const bohInput: BOHReflexInput = {
    staffReadiness: {
      staffId: '', // Will be assigned
      isReady: true,
      currentTaskCount: 0,
      skillLevel: 'intermediate',
    },
    sessionQueue: {
      queueId: `queue_${session.id}`,
      priority: 1,
      estimatedPrepTime: 15, // minutes
      flavors: session.flavor ? [session.flavor] : [],
      specialRequests: session.notes || undefined,
    },
    supplyTimer: {
      coalLastChanged: Date.now(),
      coalLifeRemaining: 3600, // 1 hour
      needsReplacement: false,
    },
    sessionStartSignal: {
      sessionId: session.id,
      timestamp: Date.now(),
      source: mapSessionSourceToReflexSource(session.source),
    },
  };

  reflexChainEngine.initializeFlow(session.id, bohInput);
  console.log('[Reflex Chain] Initialized flow for session:', session.id);
}

/**
 * Process BoH layer when prep starts
 */
export async function processBOHLayer(
  session: FireSession,
  action: SessionAction
): Promise<void> {
  if (action === 'CLAIM_PREP' && session.status === 'PREP_IN_PROGRESS') {
    const flow = reflexChainEngine.getFlow(session.id);
    if (!flow) {
      await initializeReflexChain(session);
    }

    const bohOutput: BOHReflexOutput = {
      readyForService: {
        sessionId: session.id,
        prepCompletedAt: Date.now(),
        status: 'prepped',
        estimatedReadyTime: Date.now() + (10 * 60 * 1000), // 10 minutes
      },
      resourceStatus: {
        inventory: {
          flavors: {}, // Would fetch from actual inventory
          coals: 50,
          bowls: 20,
        },
        staffCapacity: {
          available: 3,
          busy: 2,
          onBreak: 1,
        },
      },
    };

    reflexChainEngine.processBOH(session.id, bohOutput);
    console.log('[Reflex Chain] BoH layer processed:', session.id);
  }

  if (action === 'HEAT_UP' && session.status === 'HEAT_UP') {
    const flow = reflexChainEngine.getFlow(session.id);
    if (flow?.boh.output) {
      flow.boh.output.readyForService.status = 'heating';
      flow.boh.output.readyForService.heatUpStartedAt = Date.now();
    }
  }

  if (action === 'READY_FOR_DELIVERY' && session.status === 'READY_FOR_DELIVERY') {
    const flow = reflexChainEngine.getFlow(session.id);
    if (flow?.boh.output) {
      flow.boh.output.readyForService.status = 'ready';
    }
  }
}

/**
 * Process FoH layer when session is activated
 */
export async function processFOHLayer(
  session: FireSession,
  action: SessionAction,
  staffId?: string
): Promise<void> {
  if (action === 'START_ACTIVE' && session.status === 'ACTIVE') {
    const flow = reflexChainEngine.getFlow(session.id);
    if (!flow) {
      await initializeReflexChain(session);
      return;
    }

    const fohOutput: FOHReflexOutput = {
      sessionActivated: {
        sessionId: session.id,
        activatedAt: Date.now(),
        assignedStaff: staffId || 'unknown',
        tableId: session.tableId || '',
        zone: session.tableId?.includes('VIP') ? 'VIP' : 'Main',
        flavorMix: session.flavor || 'Standard',
      },
      posMetadata: {
        orderId: `order_${session.id}`,
        sessionId: session.id,
        amount: session.amount || 0,
        items: [
          {
            sku: `hookah.${session.flavor?.toLowerCase().replace(' ', '.') || 'standard'}`,
            name: `Hookah Session - ${session.flavor || 'Standard'}`,
            price: session.amount || 0,
            quantity: 1,
          },
        ],
        pricingModel: 'flat', // Could be from session metadata
        sessionDuration: 45, // minutes
      },
      timerConfig: {
        totalDuration: 45 * 60, // 45 minutes in seconds
        startTime: Date.now(),
        isActive: true,
      },
    };

    reflexChainEngine.processFOH(session.id, fohOutput);
    
    // Sync to POS adapter
    await posAdapter.syncToPOS(fohOutput);
    
    console.log('[Reflex Chain] FoH layer processed:', session.id);
  }
}

/**
 * Process Delivery layer when session is delivered
 */
export async function processDeliveryLayer(
  session: FireSession,
  action: SessionAction,
  runnerId?: string
): Promise<void> {
  if (action === 'MARK_DELIVERED' && session.status === 'DELIVERED') {
    const flow = reflexChainEngine.getFlow(session.id);
    if (!flow) {
      await initializeReflexChain(session);
      return;
    }

    const deliveryOutput: DeliveryReflexOutput = {
      deliveryCompletion: {
        sessionId: session.id,
        deliveredAt: Date.now(),
        deliveredBy: runnerId || 'unknown',
        tableId: session.tableId || '',
        heatmapUpdate: {
          zone: session.tableId?.includes('VIP') ? 'VIP' : 'Main',
          tableId: session.tableId || '',
          status: 'delivered',
          timestamp: Date.now(),
        },
        trustLoopData: {
          deliveryTime: flow.sync.timing.deliveryTime || 0,
          onTime: true, // Would calculate based on estimated time
          qualityScore: 85, // Would calculate based on metrics
        },
      },
    };

    reflexChainEngine.processDelivery(session.id, deliveryOutput);
    
    // Sync to Session Replay adapter
    await sessionReplayAdapter.syncToHeatmap(deliveryOutput, flow);
    
    console.log('[Reflex Chain] Delivery layer processed:', session.id);
  }
}

/**
 * Process Customer Experience layer (called from guest build)
 */
export async function processCustomerLayer(
  sessionId: string,
  customerInput: {
    qrScan?: { scannedAt: number; customerId?: string; deviceId: string };
    sessionRating?: { rating: number; feedback?: string; submittedAt: number };
    flavorFeedback?: { flavors: Array<{ flavorId: string; rating: number; comment?: string }>; submittedAt: number };
    dwellTime?: { startTime: number; endTime?: number; duration: number };
    reOrderPrompts?: { promptShown: boolean; promptType: 'extend' | 'reorder' | 'loyalty'; customerResponse?: 'yes' | 'no' | 'later' };
  }
): Promise<void> {
  const flow = reflexChainEngine.getFlow(sessionId);
  if (!flow) {
    console.warn('[Reflex Chain] Flow not found for customer layer:', sessionId);
    return;
  }

  // Calculate customer output
  const customerOutput = {
    sessionFingerprint: {
      sessionId,
      customerId: customerInput.qrScan?.customerId,
      preferences: {
        favoriteFlavors: customerInput.flavorFeedback?.flavors
          .filter(f => f.rating >= 4)
          .map(f => f.flavorId) || [],
        averageRating: customerInput.sessionRating?.rating || 0,
        preferredTime: 45, // Would calculate from history
        visitFrequency: 1, // Would calculate from history
      },
      trustScore: flow.sync.trust,
      loyaltyTier: 'bronze' as const, // Would calculate from history
    },
    loyaltyTokens: {
      customerId: customerInput.qrScan?.customerId || 'anonymous',
      tokensIssued: loyaltyAdapter.calculateLoyaltyTokens(
        flow.sync.transaction.amount,
        customerInput.sessionRating?.rating,
        customerInput.reOrderPrompts?.customerResponse === 'yes'
      ),
      reason: customerInput.reOrderPrompts?.customerResponse === 'yes' ? 'reorder' as const : 'visit' as const,
      transactionId: `tx_${Date.now()}`,
    },
    trustGraphData: {
      sessionId,
      trustEvents: [
        {
          type: 'payment' as const,
          timestamp: flow.timestamp,
          score: flow.sync.trust,
        },
        ...(customerInput.sessionRating ? [{
          type: 'rating' as const,
          timestamp: customerInput.sessionRating.submittedAt,
          score: (customerInput.sessionRating.rating / 5) * 100,
        }] : []),
      ],
      cumulativeTrustScore: flow.sync.trust,
    },
  };

  reflexChainEngine.processCustomer(sessionId, customerInput as any, customerOutput);
  
  // Sync to Loyalty adapter
  await loyaltyAdapter.syncToLoyalty(customerOutput, sessionId);
  
  console.log('[Reflex Chain] Customer layer processed:', sessionId);
}

