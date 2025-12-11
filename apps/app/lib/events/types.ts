/**
 * Event Types and EventMessage Interface
 * Phase 3: Night After Night Engine - Event System
 * 
 * Defines all event types for the session lifecycle and order flow
 */

export type SessionEventType =
  | 'SessionCreated'
  | 'SessionSeated'
  | 'OrderPlaced'
  | 'OrderInProgress'
  | 'OrderReady'
  | 'OrderServed'
  | 'TimerStarted'
  | 'TimerExtended'
  | 'TimerExpired'
  | 'TimerPaused'
  | 'TimerResumed'
  | 'CoalRefill'
  | 'UpsellAdded'
  | 'PaymentConfirmed'
  | 'SessionClosed'
  | 'NoteAdded'
  | 'PreOrderCreated'
  | 'PreOrderConverted'
  | 'DeliveryRecorded'
  | 'SessionExtended';

export interface EventMessage {
  id: string;
  type: SessionEventType;
  sessionId?: string;
  orderId?: string;
  preorderId?: string;
  deliveryId?: string;
  loungeId: string;
  payload: Record<string, any>;
  timestamp: Date;
  idempotencyKey?: string;
  retryCount?: number;
  processedAt?: Date;
}

export interface EventHandler {
  (event: EventMessage): Promise<void>;
}

export interface EventSubscription {
  eventType: SessionEventType;
  handler: EventHandler;
  unsubscribe: () => void;
}

/**
 * Event payload types for type safety
 */
export interface SessionCreatedPayload {
  tableId: string;
  partySize: number;
  source: string;
  flavorMix?: string[];
}

export interface OrderPlacedPayload {
  orderType: string;
  itemCount: number;
  totalCents: number;
  flavorMix?: string[];
}

export interface TimerExpiredPayload {
  elapsedMinutes: number;
  overageMinutes: number;
}

export interface PaymentConfirmedPayload {
  amountCents: number;
  provider: string;
  paymentIntentId: string;
}

