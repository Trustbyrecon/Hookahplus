import { FireSession, SessionStatus } from '../types/enhancedSession';
import { SessionState } from '@prisma/client';

// Helper function to map Prisma session state (enum) to FireSession status
function mapPrismaStateToFireSession(state: string | SessionState, paymentStatus?: string | null, externalRef?: string | null, assignedBOHId?: string | null): SessionStatus {
  // Convert enum to string if needed
  const stateStr = typeof state === 'string' ? state : String(state);
  
  // Special handling: PENDING + paymentStatus 'succeeded' = PAID_CONFIRMED
  // OR: PENDING + externalRef (Stripe checkout session ID) = PAID_CONFIRMED (payment confirmed via Stripe)
  // This is the key fix: after Stripe payment, sessions should show as PAID_CONFIRMED
  if (stateStr === 'PENDING' && (paymentStatus === 'succeeded' || (externalRef && externalRef.startsWith('cs_')))) {
    return 'PAID_CONFIRMED';
  }
  
  // Special handling: ACTIVE + assignedBOHId + payment confirmed = PREP_IN_PROGRESS
  // This handles CLAIM_PREP action which sets state to ACTIVE but should show as PREP_IN_PROGRESS
  if (stateStr === 'ACTIVE' && assignedBOHId && (paymentStatus === 'succeeded' || (externalRef && externalRef.startsWith('cs_')))) {
    // Check if this is a prep session (has BOH assigned but not yet delivered)
    // We can infer this from the fact that it's ACTIVE with BOH assigned and payment confirmed
    return 'PREP_IN_PROGRESS';
  }
  
  const stateMap: Record<string, SessionStatus> = {
    // Database enum values (SessionState)
    'PENDING': 'NEW', // PENDING without payment = NEW (unpaid)
    'ACTIVE': 'ACTIVE',
    'PAUSED': 'STAFF_HOLD', // Map PAUSED to STAFF_HOLD
    'CLOSED': 'CLOSED',
    'CANCELED': 'VOIDED', // Map CANCELED to VOIDED
    
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

function mapStateToStage(state: string | SessionState): 'BOH' | 'FOH' | 'CUSTOMER' {
  const stateStr = typeof state === 'string' ? state : String(state);
  
  if (['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(stateStr)) {
    return 'BOH';
  }
  if (['OUT_FOR_DELIVERY', 'DELIVERED', 'CLOSE_PENDING'].includes(stateStr)) {
    return 'FOH';
  }
  return 'CUSTOMER';
}

// Helper function to calculate remaining time from Prisma session
function calculateRemainingTimeFromPrisma(session: any): number {
  if (!session.timerStartedAt || !session.timerDuration) return 0;
  
  const now = Date.now();
  const startedAt = new Date(session.timerStartedAt).getTime();
  const elapsed = Math.floor((now - startedAt) / 1000);
  const pausedTime = session.timerPausedDuration || 0;
  
  return Math.max(0, session.timerDuration - elapsed + pausedTime);
}

// Convert Prisma session to FireSession format
export function convertPrismaSessionToFireSession(session: any): FireSession {
  const flavorMix = session.flavorMix ? (() => {
    try {
      const parsed = JSON.parse(session.flavorMix);
      return typeof parsed === 'string' ? parsed : parsed.join(' + ');
    } catch {
      return session.flavorMix;
    }
  })() : (session.flavor || 'Custom Mix');

  // Normalize pricing / refill metadata
  const rawSessionType: string | null =
    session.sessionType ??
    session.session_type ??
    null;

  const normalizedSessionType: 'TIME_BASED' | 'FLAT' | undefined =
    rawSessionType
      ? (String(rawSessionType).toUpperCase().includes('TIME')
          ? 'TIME_BASED'
          : 'FLAT')
      : undefined;

  const refillCount: number = typeof session.refillCount === 'number'
    ? session.refillCount
    : typeof session.refill_count === 'number'
      ? session.refill_count
      : 0;

  const hadRefill: boolean =
    typeof session.hadRefill === 'boolean'
      ? session.hadRefill
      : typeof session.had_refill === 'boolean'
        ? session.had_refill
        : refillCount > 0;

  // Derive refillStatus from edgeCase + refill metadata
  let refillStatus: 'none' | 'requested' | 'delivered' = 'none';
  if (session.edgeCase === 'refill_requested') {
    refillStatus = 'requested';
  } else if (hadRefill || refillCount > 0) {
    refillStatus = 'delivered';
  }

  // Simple pricing rule: first refill on TIME_BASED sessions is free, subsequent are billable
  const isTimeBased = normalizedSessionType === 'TIME_BASED';
  const isRefillBillable = isTimeBased ? refillCount >= 1 : false;

  return {
    id: session.id,
    tableId: session.tableId || session.externalRef || 'Unknown',
    customerName: session.customerRef || 'Anonymous',
    customerPhone: session.customerPhone || '',
    flavor: flavorMix,
    amount: session.priceCents || 0,
    status: mapPrismaStateToFireSession(session.state, session.paymentStatus, session.externalRef, session.assignedBOHId),
    currentStage: mapStateToStage(session.state),
    sessionType: normalizedSessionType,
    hadRefill,
    refillCount,
    isRefillBillable,
    assignedStaff: {
      boh: session.assignedBOHId || '',
      foh: session.assignedFOHId || ''
    },
    createdAt: new Date(session.createdAt).getTime(),
    updatedAt: new Date(session.updatedAt).getTime(),
    sessionStartTime: session.startedAt ? new Date(session.startedAt).getTime() : undefined,
    sessionDuration: session.durationSecs || 45 * 60,
    coalStatus: 'active' as const,
    refillStatus,
    notes: session.tableNotes || '',
    edgeCase: session.edgeCase || null,
    sessionTimer: session.timerStartedAt ? {
      remaining: calculateRemainingTimeFromPrisma(session),
      total: session.timerDuration || 45 * 60,
      isActive: session.timerStatus === 'running',
      startedAt: new Date(session.timerStartedAt).getTime()
    } : undefined,
    bohState: 'PREPARING' as const,
    guestTimerDisplay: session.state === 'ACTIVE',
    source: session.source // Include source from Prisma session
  };
}

