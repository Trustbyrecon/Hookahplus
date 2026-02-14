/**
 * Type Guard Utilities for Session State Management
 * 
 * These utilities provide type-safe conversions between database states
 * (SessionState enum from Prisma) and application status types (SessionStatus).
 * 
 * This prevents common errors like comparing SessionStatus to database state values.
 */

import { SessionStatus } from '../types/enhancedSession';
import { SessionState } from '@prisma/client';

/**
 * Database SessionState enum values from Prisma
 * These are the actual values stored in the database
 */
export type DatabaseSessionState = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'CANCELED';

/**
 * Type guard to check if a value is a valid database SessionState
 */
export function isDatabaseSessionState(value: string): value is DatabaseSessionState {
  return ['PENDING', 'ACTIVE', 'PAUSED', 'CLOSED', 'CANCELED'].includes(value);
}

/**
 * Type guard to check if a value is a valid application SessionStatus
 */
export function isSessionStatus(value: string): value is SessionStatus {
  const validStatuses: SessionStatus[] = [
    'NEW',
    'PAID_CONFIRMED',
    'PREP_IN_PROGRESS',
    'HEAT_UP',
    'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'ACTIVE',
    'CLOSE_PENDING',
    'CLOSED',
    'STAFF_HOLD',
    'STOCK_BLOCKED',
    'REMAKE',
    'REFUND_REQUESTED',
    'REFUNDED',
    'FAILED_PAYMENT',
    'VOIDED',
  ];
  return validStatuses.includes(value as SessionStatus);
}

/**
 * Safely convert a database SessionState to application SessionStatus
 * 
 * This is the canonical mapping function that should be used throughout the app.
 * It handles special cases like payment status and BOH assignment.
 * 
 * @param state - Database state value (SessionState enum or string)
 * @param options - Additional context for mapping
 * @returns Application SessionStatus
 */
export function mapDatabaseStateToStatus(
  state: string | SessionState | null | undefined,
  options: {
    paymentStatus?: string | null;
    externalRef?: string | null;
    assignedBOHId?: string | null;
  } = {}
): SessionStatus {
  // Handle null/undefined
  if (!state) {
    return 'NEW';
  }

  const stateStr = typeof state === 'string' ? state : String(state);
  const { paymentStatus, externalRef, assignedBOHId } = options;

  // Special handling: PENDING + payment confirmed = PAID_CONFIRMED
  const isPaid = paymentStatus === 'succeeded' || 
                 (externalRef && (externalRef.startsWith('cs_') || externalRef.startsWith('test_cs_')));
  
  if (stateStr === 'PENDING' && isPaid) {
    return 'PAID_CONFIRMED';
  }

  // Special handling: ACTIVE + assignedBOHId + payment confirmed = PREP_IN_PROGRESS
  if (stateStr === 'ACTIVE' && assignedBOHId && isPaid) {
    return 'PREP_IN_PROGRESS';
  }

  // Standard mapping from database states to application statuses
  const stateMap: Record<string, SessionStatus> = {
    // Database enum values (SessionState)
    'PENDING': 'NEW', // PENDING without payment = NEW (unpaid)
    'ACTIVE': 'ACTIVE',
    'PAUSED': 'STAFF_HOLD',
    'CLOSED': 'CLOSED',
    'CANCELED': 'VOIDED',
    
    // Legacy string values (for backward compatibility)
    'NEW': 'NEW',
    'PREP_IN_PROGRESS': 'PREP_IN_PROGRESS',
    'HEAT_UP': 'HEAT_UP',
    'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED',
    'COMPLETED': 'CLOSED',
    'CANCELLED': 'VOIDED',
    'FAILED_PAYMENT': 'FAILED_PAYMENT',
    'PAID_CONFIRMED': 'PAID_CONFIRMED',
    'CLOSE_PENDING': 'CLOSE_PENDING',
    'STOCK_BLOCKED': 'STOCK_BLOCKED',
    'REMAKE': 'REMAKE',
    'REFUND_REQUESTED': 'REFUND_REQUESTED',
    'REFUNDED': 'REFUNDED',
  };

  return stateMap[stateStr] || 'NEW';
}

import { VALID_TRANSITIONS, STATUS_TO_STAGE } from '../types/enhancedSession';

/**
 * Validate that a status transition is allowed
 * 
 * @param from - Current SessionStatus
 * @param to - Target SessionStatus
 * @returns true if transition is valid
 */
export function isValidStatusTransition(from: SessionStatus, to: SessionStatus): boolean {
  const allowed = VALID_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

/**
 * Get the stage (BOH/FOH/CUSTOMER) for a given status
 * 
 * @param status - Application SessionStatus
 * @returns Stage identifier
 */
export function getStageForStatus(status: SessionStatus): 'BOH' | 'FOH' | 'CUSTOMER' {
  return STATUS_TO_STAGE[status] || 'CUSTOMER';
}

