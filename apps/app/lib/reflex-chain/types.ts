/**
 * Hookah+ Reflex Chain Types
 * 
 * Defines the four-layer Reflex Chain that syncs trust, timing, and transaction data
 * across Back of House → Front of House → Delivery → Customer Experience
 */

// ============================================================================
// Layer 1: Back of House (BoH) - Preparation + Resource Intelligence
// ============================================================================

export interface BOHReflexInput {
  staffReadiness: {
    staffId: string;
    isReady: boolean;
    currentTaskCount: number;
    skillLevel: 'novice' | 'intermediate' | 'expert';
  };
  sessionQueue: {
    queueId: string;
    priority: number;
    estimatedPrepTime: number; // minutes
    flavors: string[];
    specialRequests?: string;
  };
  supplyTimer: {
    coalLastChanged: number; // timestamp
    coalLifeRemaining: number; // seconds
    needsReplacement: boolean;
  };
  sessionStartSignal: {
    sessionId: string;
    timestamp: number;
    source: 'payment' | 'preorder' | 'walk-in';
  };
}

export interface BOHReflexOutput {
  readyForService: {
    sessionId: string;
    prepCompletedAt: number;
    heatUpStartedAt?: number;
    status: 'prepped' | 'heating' | 'ready';
    estimatedReadyTime: number; // timestamp
  };
  resourceStatus: {
    inventory: {
      flavors: { [key: string]: number }; // available units
      coals: number;
      bowls: number;
    };
    staffCapacity: {
      available: number;
      busy: number;
      onBreak: number;
    };
  };
}

// ============================================================================
// Layer 2: Front of House (FoH) - Session Activation + Staff Experience
// ============================================================================

export interface FOHReflexInput {
  sessionZone: string; // e.g., "VIP-1", "Main-5", "Outdoor-2"
  seatNumber: string;
  flavorCombo: string[];
  staffId: string;
  customerId?: string;
  tableId: string;
  bohReadySignal: BOHReflexOutput['readyForService'];
}

export interface FOHReflexOutput {
  sessionActivated: {
    sessionId: string;
    activatedAt: number;
    assignedStaff: string;
    tableId: string;
    zone: string;
    flavorMix: string;
  };
  posMetadata: {
    orderId: string;
    sessionId: string;
    amount: number; // cents
    items: Array<{
      sku: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    pricingModel: 'flat' | 'time-based';
    sessionDuration?: number; // minutes
  };
  timerConfig: {
    totalDuration: number; // seconds
    startTime: number; // timestamp
    isActive: boolean;
  };
}

// ============================================================================
// Layer 3: Delivery Layer - Handoff + Experience Continuity
// ============================================================================

export interface DeliveryReflexInput {
  runnerAssignment: {
    runnerId: string;
    sessionId: string;
    assignedAt: number;
  };
  trayConfirmation: {
    sessionId: string;
    trayNumber?: string;
    confirmedAt: number;
    itemsVerified: boolean;
  };
  heatState: {
    sessionId: string;
    temperature: 'cold' | 'warming' | 'hot' | 'optimal';
    lastCoalChange?: number;
    needsAttention: boolean;
  };
}

export interface DeliveryReflexOutput {
  deliveryCompletion: {
    sessionId: string;
    deliveredAt: number;
    deliveredBy: string;
    tableId: string;
    heatmapUpdate: {
      zone: string;
      tableId: string;
      status: 'active' | 'delivered' | 'pending';
      timestamp: number;
    };
    trustLoopData: {
      deliveryTime: number; // seconds from ready to delivered
      onTime: boolean;
      qualityScore: number; // 0-100
    };
  };
}

// ============================================================================
// Layer 4: Customer Experience Layer - Engagement + Loyalty + Trust Loop
// ============================================================================

export interface CustomerReflexInput {
  qrScan?: {
    sessionId: string;
    scannedAt: number;
    customerId?: string;
    deviceId: string;
  };
  sessionRating?: {
    sessionId: string;
    rating: number; // 1-5
    feedback?: string;
    submittedAt: number;
  };
  flavorFeedback?: {
    sessionId: string;
    flavors: Array<{
      flavorId: string;
      rating: number; // 1-5
      comment?: string;
    }>;
    submittedAt: number;
  };
  dwellTime?: {
    sessionId: string;
    startTime: number;
    endTime?: number;
    duration: number; // seconds
  };
  reOrderPrompts?: {
    sessionId: string;
    promptShown: boolean;
    promptType: 'extend' | 'reorder' | 'loyalty';
    customerResponse?: 'yes' | 'no' | 'later';
  };
}

export interface CustomerReflexOutput {
  sessionFingerprint: {
    sessionId: string;
    customerId?: string;
    preferences: {
      favoriteFlavors: string[];
      averageRating: number;
      preferredTime: number; // preferred session duration in minutes
      visitFrequency: number; // visits per month
    };
    trustScore: number; // 0-100
    loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  loyaltyTokens: {
    customerId: string;
    tokensIssued: number;
    reason: 'visit' | 'rating' | 'referral' | 'reorder';
    transactionId: string;
  };
  trustGraphData: {
    sessionId: string;
    trustEvents: Array<{
      type: 'payment' | 'delivery' | 'rating' | 'reorder';
      timestamp: number;
      score: number;
    }>;
    cumulativeTrustScore: number;
  };
}

// ============================================================================
// Reflex Chain Flow Types
// ============================================================================

export interface ReflexChainFlow {
  sessionId: string;
  timestamp: number;
  
  // Layer sequence
  boh: {
    input: BOHReflexInput;
    output?: BOHReflexOutput;
    completedAt?: number;
  };
  
  foh: {
    input?: FOHReflexInput;
    output?: FOHReflexOutput;
    completedAt?: number;
  };
  
  delivery: {
    input?: DeliveryReflexInput;
    output?: DeliveryReflexOutput;
    completedAt?: number;
  };
  
  customer: {
    input?: CustomerReflexInput;
    output?: CustomerReflexOutput;
    completedAt?: number;
  };
  
  // Cross-layer sync
  sync: {
    trust: number; // 0-100
    timing: {
      totalFlowTime: number; // seconds
      bohTime: number;
      fohTime: number;
      deliveryTime: number;
      customerTime: number;
    };
    transaction: {
      amount: number;
      paymentStatus: 'pending' | 'completed' | 'refunded';
      loyaltyIssued: boolean;
    };
  };
}

// ============================================================================
// Reflex Adapter Types
// ============================================================================

export interface POSAdapterReflex {
  orderId: string;
  sessionId: string;
  metadata: FOHReflexOutput['posMetadata'];
  syncTimestamp: number;
}

export interface LoyaltyAdapterReflex {
  customerId: string;
  sessionId: string;
  tokens: CustomerReflexOutput['loyaltyTokens'];
  syncTimestamp: number;
}

export interface SessionReplayReflex {
  sessionId: string;
  heatmap: Array<{
    timestamp: number;
    zone: string;
    tableId: string;
    status: string;
    trustScore: number;
  }>;
  syncTimestamp: number;
}

