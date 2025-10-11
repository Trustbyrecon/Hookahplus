/**
 * TypeScript Types for Hookah+ Payment Server
 */

export interface Ktl4Event {
  id: string;
  timestamp: string;
  flowName: 'payment_settlement' | 'session_lifecycle' | 'order_intake' | 'pos_sync';
  eventType: string;
  sessionId?: string;
  stationId?: string;
  operatorId?: string;
  chargeId?: string;
  ticketId?: string;
  amountCents?: number;
  status: 'success' | 'warning' | 'error' | 'critical';
  details: Record<string, any>;
  trustSignature: string;
  previousHash?: string | null;
  repairRunId?: string;
}

export interface TrustLockData {
  sessionId: string;
  stationId: string;
  flavorMix: string;
  priceComponents: any;
  margin: number;
  hash: string;
}

export interface SessionData {
  id: string;
  stationId: string;
  flavorMix: string;
  priceComponents: any;
  margin: number;
  status: 'active' | 'completed' | 'cancelled';
  startedAt: Date;
  endedAt?: Date;
  trustLock: TrustLockData;
}

export interface MarginCalculation {
  basePrice: number;
  totalAddOns: number;
  total: number;
  hookahPlusFee: number;
  netLounge: number;
  feePercentage: number;
}

export interface PaymentPathway {
  pathway: 'A' | 'B' | 'C';
  name: string;
  description: string;
  endpoint: string;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  ktl4: any;
  square: {
    connected: boolean;
    locationId: string;
  };
  sessions: {
    active: number;
    completed: number;
    total: number;
  };
  trustLocks: {
    verified: number;
    total: number;
  };
}

export interface ReconciliationResult {
  success: boolean;
  repairRunId: string;
  orphanedPayments: any[];
  matchedPayments: any[];
  totalSessions: number;
}

export interface PosTicket {
  id: string;
  ticketId: string;
  sessionId: string;
  amountCents: number;
  status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  posSystem: 'square' | 'clover' | 'toast';
  items: string;
  createdAt: Date;
}

export interface PricingLock {
  sessionId: string;
  finalPriceCents: number;
  priceHash: string;
  components: string;
  lockedAt: Date;
}
