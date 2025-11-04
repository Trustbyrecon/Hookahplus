/**
 * Hookah+ Reflex Chain Core Engine
 * 
 * Orchestrates the four-layer Reflex Chain flow:
 * BoH → FoH → Delivery → Customer Experience
 */

import { 
  ReflexChainFlow,
  BOHReflexInput,
  BOHReflexOutput,
  FOHReflexInput,
  FOHReflexOutput,
  DeliveryReflexInput,
  DeliveryReflexOutput,
  CustomerReflexInput,
  CustomerReflexOutput,
} from './types';

export class ReflexChainEngine {
  private flows: Map<string, ReflexChainFlow> = new Map();

  /**
   * Initialize a new Reflex Chain flow
   */
  initializeFlow(sessionId: string, bohInput: BOHReflexInput): ReflexChainFlow {
    const flow: ReflexChainFlow = {
      sessionId,
      timestamp: Date.now(),
      boh: {
        input: bohInput,
      },
      foh: {},
      delivery: {},
      customer: {},
      sync: {
        trust: 0,
        timing: {
          totalFlowTime: 0,
          bohTime: 0,
          fohTime: 0,
          deliveryTime: 0,
          customerTime: 0,
        },
        transaction: {
          amount: 0,
          paymentStatus: 'pending',
          loyaltyIssued: false,
        },
      },
    };

    this.flows.set(sessionId, flow);
    return flow;
  }

  /**
   * Layer 1: Process BoH Reflex → Trigger "Ready for Service"
   */
  processBOH(sessionId: string, output: BOHReflexOutput): ReflexChainFlow {
    const flow = this.flows.get(sessionId);
    if (!flow) {
      throw new Error(`Flow not found for session: ${sessionId}`);
    }

    flow.boh.output = output;
    flow.boh.completedAt = Date.now();
    
    if (flow.boh.input.sessionStartSignal) {
      flow.sync.timing.bohTime = Date.now() - flow.boh.input.sessionStartSignal.timestamp;
    }

    // Trigger FoH layer automatically
    this.triggerFOH(sessionId, {
      sessionZone: flow.boh.input.sessionQueue?.flavors[0] || 'unknown',
      seatNumber: flow.boh.input.sessionStartSignal?.sessionId || '',
      flavorCombo: flow.boh.input.sessionQueue?.flavors || [],
      staffId: '', // Will be assigned in FoH
      tableId: '', // Will be set in FoH
      bohReadySignal: output,
    });

    return flow;
  }

  /**
   * Layer 2: Process FoH Reflex → Push to POS Adapter
   */
  triggerFOH(sessionId: string, input: FOHReflexInput): ReflexChainFlow {
    const flow = this.flows.get(sessionId);
    if (!flow) {
      throw new Error(`Flow not found for session: ${sessionId}`);
    }

    flow.foh.input = input;
    return flow;
  }

  processFOH(sessionId: string, output: FOHReflexOutput): ReflexChainFlow {
    const flow = this.flows.get(sessionId);
    if (!flow) {
      throw new Error(`Flow not found for session: ${sessionId}`);
    }

    flow.foh.output = output;
    flow.foh.completedAt = Date.now();
    
    if (flow.boh.completedAt) {
      flow.sync.timing.fohTime = Date.now() - flow.boh.completedAt;
    }

    // Update sync data
    flow.sync.transaction.amount = output.posMetadata.amount;
    flow.sync.timing.totalFlowTime = flow.sync.timing.bohTime + flow.sync.timing.fohTime;

    // Trigger Delivery layer
    this.triggerDelivery(sessionId, {
      runnerAssignment: {
        runnerId: output.sessionActivated.assignedStaff,
        sessionId,
        assignedAt: Date.now(),
      },
      trayConfirmation: {
        sessionId,
        confirmedAt: Date.now(),
        itemsVerified: true,
      },
      heatState: {
        sessionId,
        temperature: 'optimal',
        needsAttention: false,
      },
    });

    return flow;
  }

  /**
   * Layer 3: Process Delivery Reflex → Update Heatmap + Trust Loop
   */
  triggerDelivery(sessionId: string, input: DeliveryReflexInput): ReflexChainFlow {
    const flow = this.flows.get(sessionId);
    if (!flow) {
      throw new Error(`Flow not found for session: ${sessionId}`);
    }

    flow.delivery.input = input;
    return flow;
  }

  processDelivery(sessionId: string, output: DeliveryReflexOutput): ReflexChainFlow {
    const flow = this.flows.get(sessionId);
    if (!flow) {
      throw new Error(`Flow not found for session: ${sessionId}`);
    }

    flow.delivery.output = output;
    flow.delivery.completedAt = Date.now();
    
    if (flow.foh.completedAt) {
      flow.sync.timing.deliveryTime = Date.now() - flow.foh.completedAt;
    }

    // Update trust score based on delivery performance
    if (output.deliveryCompletion.trustLoopData.onTime) {
      flow.sync.trust = Math.min(100, flow.sync.trust + 10);
    }
    flow.sync.trust = Math.max(0, Math.min(100, 
      (flow.sync.trust + output.deliveryCompletion.trustLoopData.qualityScore) / 2
    ));

    flow.sync.timing.totalFlowTime = 
      flow.sync.timing.bohTime + 
      flow.sync.timing.fohTime + 
      flow.sync.timing.deliveryTime;

    return flow;
  }

  /**
   * Layer 4: Process Customer Experience Reflex → Enrich Fingerprint + Loyalty
   */
  processCustomer(sessionId: string, input: CustomerReflexInput, output: CustomerReflexOutput): ReflexChainFlow {
    const flow = this.flows.get(sessionId);
    if (!flow) {
      throw new Error(`Flow not found for session: ${sessionId}`);
    }

    flow.customer.input = input;
    flow.customer.output = output;
    flow.customer.completedAt = Date.now();
    
    if (flow.delivery.completedAt) {
      flow.sync.timing.customerTime = Date.now() - flow.delivery.completedAt;
    }

    // Update trust score from customer feedback
    if (input.sessionRating) {
      const ratingScore = (input.sessionRating.rating / 5) * 100;
      flow.sync.trust = Math.max(0, Math.min(100, 
        (flow.sync.trust + ratingScore) / 2
      ));
    }

    // Update loyalty status
    if (output.loyaltyTokens) {
      flow.sync.transaction.loyaltyIssued = true;
    }

    flow.sync.timing.totalFlowTime = 
      flow.sync.timing.bohTime + 
      flow.sync.timing.fohTime + 
      flow.sync.timing.deliveryTime + 
      flow.sync.timing.customerTime;

    return flow;
  }

  /**
   * Get current flow state
   */
  getFlow(sessionId: string): ReflexChainFlow | undefined {
    return this.flows.get(sessionId);
  }

  /**
   * Get all active flows
   */
  getActiveFlows(): ReflexChainFlow[] {
    return Array.from(this.flows.values()).filter(flow => 
      !flow.customer.completedAt // Not yet completed
    );
  }

  /**
   * Clean up completed flows (older than 24 hours)
   */
  cleanupOldFlows(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, flow] of this.flows.entries()) {
      if (flow.customer.completedAt && (now - flow.customer.completedAt) > maxAge) {
        this.flows.delete(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton instance
export const reflexChainEngine = new ReflexChainEngine();

