import { FireSession, SessionStatus, STATUS_TO_TRACKER_STAGE, TrackerStage } from '../types/enhancedSession';
import { SessionState } from '@prisma/client';

// Helper function to map Prisma session state (enum) to FireSession status
function mapPrismaStateToFireSession(state: string | SessionState, paymentStatus?: string | null, externalRef?: string | null, assignedBOHId?: string | null): SessionStatus {
  // Convert enum to string if needed
  const stateStr = typeof state === 'string' ? state : String(state);
  
  // Special handling: PENDING + paymentStatus 'succeeded' = PAID_CONFIRMED
  // OR: PENDING + externalRef (Stripe checkout session ID, test session, or guest session) = PAID_CONFIRMED
  // This is the key fix: after Stripe payment, sessions should show as PAID_CONFIRMED
  // Guest sessions (externalRef starting with 'guest-') are treated as paid for demo/test purposes
  const isPaid = paymentStatus === 'succeeded' || 
                 (externalRef && (
                   externalRef.startsWith('cs_') || 
                   externalRef.startsWith('test_cs_') ||
                   externalRef.startsWith('guest-') // Guest sessions from guest build are treated as paid
                 ));
  
  if (stateStr === 'PENDING' && isPaid) {
    return 'PAID_CONFIRMED';
  }
  
  // Special handling: ACTIVE + assignedBOHId + payment confirmed = PREP_IN_PROGRESS
  // This handles CLAIM_PREP action which sets state to ACTIVE but should show as PREP_IN_PROGRESS
  if (stateStr === 'ACTIVE' && assignedBOHId && isPaid) {
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

function trackerStageToCurrentStage(stage: TrackerStage): 'BOH' | 'FOH' | 'CUSTOMER' {
  if (stage === 'Ready' || stage === 'Deliver') return 'FOH';
  if (stage === 'Light') return 'CUSTOMER';
  // Payment/Prep default to BOH view
  return 'BOH';
}

function inferWorkflowStatusFromNotes(session: any, baseStatus: SessionStatus): SessionStatus {
  const notes = session.tableNotes || '';
  const assignedBOHId = session.assignedBOHId || session.assigned_boh_id;
  const isActiveState = (session.state || '').toString() === 'ACTIVE';

  // If we have explicit status not derived from ACTIVE + BOH, keep it
  if (!isActiveState) return baseStatus;

  // Walk the workflow order from most advanced to earliest
  if (notes.includes('Action START_ACTIVE')) return 'ACTIVE';
  if (notes.includes('Action MARK_DELIVERED')) return 'DELIVERED';
  if (notes.includes('Action DELIVER_NOW') || notes.includes('Action OUT_FOR_DELIVERY')) return 'OUT_FOR_DELIVERY';
  if (notes.includes('Action READY_FOR_DELIVERY') || notes.includes('Ready for delivery') || notes.includes('Ready')) return 'READY_FOR_DELIVERY';
  if (notes.includes('Action HEAT_UP') || notes.includes('Heat Up') || notes.includes('Coals heating')) return 'HEAT_UP';

  // Default: if ACTIVE with BOH assigned and paid, stay in PREP_IN_PROGRESS
  if (assignedBOHId) return 'PREP_IN_PROGRESS';

  return baseStatus;
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

  // Get payment status and external ref for state mapping
  const paymentStatus = session.paymentStatus || null;
  const externalRef = session.externalRef || null;
  const assignedBOHId = session.assignedBOHId || null;
  
  // Simple pricing rule: first refill on TIME_BASED sessions is free, subsequent are billable
  const isTimeBased = normalizedSessionType === 'TIME_BASED';
  const isRefillBillable = isTimeBased ? refillCount >= 1 : false;

  // Derive status with workflow inference so READY moves out of BOH
  const baseStatus = mapPrismaStateToFireSession(session.state, session.paymentStatus, session.externalRef, session.assignedBOHId);
  const status = inferWorkflowStatusFromNotes(session, baseStatus);
  const trackerStage: TrackerStage = (session.stage as TrackerStage) || STATUS_TO_TRACKER_STAGE[status] || 'Payment';
  const trackerAction = session.action || null;
  const currentStage = trackerStageToCurrentStage(trackerStage);

  return {
    id: session.id,
    tableId: session.tableId || session.externalRef || 'Unknown',
    customerName: session.customerRef || 'Anonymous',
    customerPhone: session.customerPhone || '',
    flavor: flavorMix,
    amount: session.priceCents || 0,
    status,
    stage: trackerStage,
    action: trackerAction || undefined,
    currentStage,
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
    specialRequests: session.specialRequests || null,
    edgeCase: session.edgeCase || null,
    sessionTimer: session.timerStartedAt ? {
      remaining: calculateRemainingTimeFromPrisma(session),
      total: session.timerDuration || 45 * 60,
      isActive: session.timerStatus === 'running',
      startedAt: new Date(session.timerStartedAt).getTime()
    } : undefined,
    bohState: 'PREPARING' as const,
    guestTimerDisplay: session.state === 'ACTIVE',
    source: session.source, // Include source from Prisma session
    externalRef: session.externalRef || null, // Include Stripe checkout session ID
    paymentStatus: session.paymentStatus || null // Include payment status
  };
}

