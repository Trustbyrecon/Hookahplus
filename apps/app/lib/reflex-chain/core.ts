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
  CompressedReflexFlow,
  CompressionOptions,
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
      bohReadySignal: output.readyForService,
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

    // Use Array.from to avoid iteration issues
    const entries = Array.from(this.flows.entries());
    for (const [sessionId, flow] of entries) {
      if (flow.customer.completedAt && (now - flow.customer.completedAt) > maxAge) {
        this.flows.delete(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Compress a Reflex Chain flow to reduce context size
   * Removes detailed layer data, keeps only summaries and critical data
   */
  compressFlow(sessionId: string, options: CompressionOptions = {}): CompressedReflexFlow | null {
    const flow = this.flows.get(sessionId);
    if (!flow) {
      return null;
    }

    const {
      compressAfterLayers = 2,
      preserveCriticalData = true,
    } = options;

    // Determine current layer
    let currentLayer: 'boh' | 'foh' | 'delivery' | 'customer' | 'completed' = 'boh';
    if (flow.customer.completedAt) {
      currentLayer = 'completed';
    } else if (flow.delivery.completedAt) {
      currentLayer = 'customer';
    } else if (flow.foh.completedAt) {
      currentLayer = 'delivery';
    } else if (flow.boh.completedAt) {
      currentLayer = 'foh';
    }

    // Extract key events
    const keyEvents: Array<{ layer: string; event: string; timestamp: number }> = [];
    if (flow.boh.completedAt) {
      keyEvents.push({
        layer: 'boh',
        event: 'prep_completed',
        timestamp: flow.boh.completedAt,
      });
    }
    if (flow.foh.completedAt) {
      keyEvents.push({
        layer: 'foh',
        event: 'session_activated',
        timestamp: flow.foh.completedAt,
      });
    }
    if (flow.delivery.completedAt) {
      keyEvents.push({
        layer: 'delivery',
        event: 'delivery_completed',
        timestamp: flow.delivery.completedAt,
      });
    }
    if (flow.customer.completedAt) {
      keyEvents.push({
        layer: 'customer',
        event: 'session_completed',
        timestamp: flow.customer.completedAt,
      });
    }

    // Calculate progress
    const progress = currentLayer === 'completed' ? 100 :
      currentLayer === 'customer' ? 75 :
      currentLayer === 'delivery' ? 50 :
      currentLayer === 'foh' ? 25 : 0;

    // Generate summary
    const status = currentLayer === 'completed' ? 'completed' :
      currentLayer === 'customer' ? 'in_customer_phase' :
      currentLayer === 'delivery' ? 'in_delivery' :
      currentLayer === 'foh' ? 'in_foh' : 'in_boh';

    // Estimate original size (rough approximation)
    const originalSize = JSON.stringify(flow).length;
    
    // Create compressed flow
    const compressed: CompressedReflexFlow = {
      sessionId: flow.sessionId,
      timestamp: flow.timestamp,
      currentLayer,
      summary: {
        status,
        progress,
        keyEvents: keyEvents.slice(-10), // Keep last 10 events
      },
      criticalData: {
        trustScore: flow.sync.trust,
        totalFlowTime: flow.sync.timing.totalFlowTime,
        transactionAmount: flow.sync.transaction.amount,
        paymentStatus: flow.sync.transaction.paymentStatus,
        loyaltyIssued: flow.sync.transaction.loyaltyIssued,
      },
      compression: {
        compressedAt: Date.now(),
        originalSize,
        compressedSize: 0, // Will be set after JSON stringify
        compressionRatio: 0, // Will be calculated
      },
    };

    // Calculate actual compressed size and ratio
    const compressedJson = JSON.stringify(compressed);
    compressed.compression.compressedSize = compressedJson.length;
    compressed.compression.compressionRatio = compressed.compression.compressedSize / originalSize;

    return compressed;
  }

  /**
   * Get compressed flow for context sharing
   * Automatically compresses if flow meets compression criteria
   */
  getCompressedFlow(sessionId: string, options: CompressionOptions = {}): CompressedReflexFlow | null {
    const flow = this.flows.get(sessionId);
    if (!flow) {
      return null;
    }

    const {
      compressAfterLayers = 2,
    } = options;

    // Check if flow should be compressed
    const layersCompleted = [
      flow.boh.completedAt,
      flow.foh.completedAt,
      flow.delivery.completedAt,
      flow.customer.completedAt,
    ].filter(Boolean).length;

    // Compress if enough layers completed or flow is completed
    if (layersCompleted >= compressAfterLayers || flow.customer.completedAt) {
      return this.compressFlow(sessionId, options);
    }

    // Return null if not ready for compression
    return null;
  }

  /**
   * Generate summary of flow for logging/archiving
   */
  generateFlowSummary(sessionId: string): string {
    const flow = this.flows.get(sessionId);
    if (!flow) {
      return `Flow ${sessionId}: Not found`;
    }

    const compressed = this.compressFlow(sessionId);
    if (!compressed) {
      return `Flow ${sessionId}: Compression failed`;
    }

    return `Flow ${sessionId}: ${compressed.summary.status} (${compressed.summary.progress}% complete) | Trust: ${compressed.criticalData.trustScore} | Time: ${compressed.criticalData.totalFlowTime}s | Amount: $${(compressed.criticalData.transactionAmount / 100).toFixed(2)}`;
  }
}

// Singleton instance
export const reflexChainEngine = new ReflexChainEngine();

