import { 
  FireSession, 
  SessionStatus, 
  SessionAction, 
  UserRole, 
  VALID_TRANSITIONS, 
  ACTION_TO_STATUS, 
  STATUS_TO_STAGE, 
  ROLE_PERMISSIONS 
} from '../types/enhancedSession';
import { SessionStateV1, mapSessionState } from './taxonomy/enums-v1';

// Trust validation function
export function canPerformAction(userRole: UserRole, action: SessionAction): boolean {
  return ROLE_PERMISSIONS[userRole].includes(action);
}

// State transition validation
export function isValidTransition(currentStatus: SessionStatus, newStatus: SessionStatus): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(newStatus);
}

// Next state calculation with trust validation
export function nextStateWithTrust(
  session: FireSession,
  action: { type: SessionAction; operatorId: string; timestamp?: number },
  userRole: UserRole
): FireSession {
  // Check permissions
  if (!canPerformAction(userRole, action.type)) {
    throw new Error(`Insufficient permissions for ${action.type}`);
  }

  // Get target status
  const targetStatus = ACTION_TO_STATUS[action.type];
 
  // Validate transition
  if (!isValidTransition(session.status, targetStatus)) {
    throw new Error(`Invalid transition from ${session.status} to ${targetStatus}`);
  }

  // Calculate new stage
  const newStage = STATUS_TO_STAGE[targetStatus];

  // Create updated session
  const updatedSession: FireSession = {
    ...session,
    status: targetStatus,
    currentStage: newStage,
    updatedAt: Date.now()
  };

  // Handle special state transitions
  if (action.type === 'START_ACTIVE') {
    updatedSession.sessionStartTime = Date.now();
    updatedSession.guestTimerDisplay = true;
    updatedSession.sessionTimer = {
      remaining: 45 * 60, // 45 minutes in seconds
      total: 45 * 60,
      isActive: true,
      startedAt: Date.now()
    };
  }

  if (action.type === 'PAUSE_SESSION') {
    if (updatedSession.sessionTimer) {
      updatedSession.sessionTimer.isActive = false;
      updatedSession.sessionTimer.pausedAt = Date.now();
    }
  }

  if (action.type === 'RESUME_SESSION') {
    if (updatedSession.sessionTimer) {
      updatedSession.sessionTimer.isActive = true;
      if (updatedSession.sessionTimer.pausedAt) {
        const pausedDuration = Date.now() - updatedSession.sessionTimer.pausedAt;
        updatedSession.sessionTimer.pausedDuration = (updatedSession.sessionTimer.pausedDuration || 0) + pausedDuration;
        updatedSession.sessionTimer.pausedAt = undefined;
      }
    }
  }

  return updatedSession;
}

// Timer calculation utilities
export function calculateRemainingTime(session: FireSession): number {
  if (!session.sessionTimer || !session.sessionStartTime) {
    return 0;
  }

  const now = Date.now();
  const elapsed = Math.floor((now - session.sessionStartTime) / 1000);
  const pausedTime = session.sessionTimer.pausedDuration || 0;
  const remaining = Math.max(0, session.sessionTimer.total - elapsed + pausedTime);
 
  return remaining;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Business logic descriptions for each state
export const STATE_DESCRIPTIONS: Record<SessionStatus, string> = {
  'NEW': 'New session created, awaiting payment confirmation',
  'PAID_CONFIRMED': 'Payment confirmed. Ready for BOH prep → FOH delivery → Light!',
  'PREP_IN_PROGRESS': 'BOH preparing hookah: bowl packing, flavor mixing',
  'HEAT_UP': 'BOH heating coals, final preparation phase',
  'READY_FOR_DELIVERY': 'Hookah ready, awaiting FOH pickup',
  'OUT_FOR_DELIVERY': 'FOH delivering hookah to table',
  'DELIVERED': 'Hookah delivered to table, ready to start',
  'ACTIVE': 'Session active, customer enjoying hookah',
  'CLOSE_PENDING': 'Session ending, processing payment',
  'CLOSED': 'Session completed and closed',
  'STAFF_HOLD': 'Session on hold, awaiting staff action',
  'STOCK_BLOCKED': 'Session blocked due to stock shortage',
  'REMAKE': 'Session requires remake, returning to BOH',
  'REFUND_REQUESTED': 'Refund requested by customer',
  'REFUNDED': 'Refund processed and completed',
  'FAILED_PAYMENT': 'Payment failed, session voided',
  'VOIDED': 'Session voided and cancelled'
};

// Business logic descriptions for each action
export const ACTION_DESCRIPTIONS: Record<SessionAction, string> = {
  'CLAIM_PREP': 'BOH claims preparation: begins bowl packing and flavor mixing',
  'HEAT_UP': 'BOH heats coals: final preparation phase before delivery',
  'READY_FOR_DELIVERY': 'BOH completes prep: hookah ready for FOH pickup',
  'DELIVER_NOW': 'FOH begins delivery: transporting hookah to table',
  'MARK_DELIVERED': 'FOH confirms delivery: hookah setup complete at table',
  'START_ACTIVE': 'FOH starts session: customer begins enjoying hookah',
  'PAUSE_SESSION': 'Pause session: customer stepped away, coals cooling',
  'RESUME_SESSION': 'Resume session: customer returned, coals reheated',
  'REQUEST_REFILL': 'Customer requests refill: return to BOH for new coals',
  'COMPLETE_REFILL': 'Refill completed: new coals delivered to customer',
  'CLOSE_SESSION': 'Close session: customer finished, processing payment',
  'PUT_ON_HOLD': 'Put on hold: temporary pause for staff or customer issue',
  'RESOLVE_HOLD': 'Resolve hold: issue resolved, resuming normal flow',
  'REQUEST_REMAKE': 'Request remake: return to BOH for complete re-preparation',
  'PROCESS_REFUND': 'Process refund: customer refund requested and approved',
  'VOID_SESSION': 'Void session: cancel session completely'
};

// ============================================================================
// Taxonomy v1 Integration
// ============================================================================

/**
 * Map SessionStatus (FireSession) to SessionStateV1 (Taxonomy v1)
 * 
 * This bridges the frontend state machine with the database taxonomy
 */
export function mapSessionStatusToV1(
  status: SessionStatus,
  session: { prep_started_at?: Date | string | null; handoff_started_at?: Date | string | null; [key: string]: any }
): { state: SessionStateV1; paused: boolean } {
  // Map FireSession status to legacy Prisma SessionState, then to v1
  let legacyState: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'CANCELED';
  
  switch (status) {
    case 'NEW':
    case 'PAID_CONFIRMED':
      legacyState = 'PENDING';
      break;
    case 'PREP_IN_PROGRESS':
    case 'HEAT_UP':
    case 'READY_FOR_DELIVERY':
    case 'OUT_FOR_DELIVERY':
    case 'DELIVERED':
    case 'ACTIVE':
      legacyState = 'ACTIVE';
      break;
    case 'STAFF_HOLD':
      // STAFF_HOLD is similar to PAUSED
      legacyState = 'PAUSED';
      break;
    case 'CLOSED':
    case 'CLOSE_PENDING':
      legacyState = 'CLOSED';
      break;
    case 'VOIDED':
    case 'FAILED_PAYMENT':
    case 'REFUNDED':
      legacyState = 'CANCELED';
      break;
    default:
      legacyState = 'PENDING';
  }
  
  return mapSessionState(legacyState, session);
}

/**
 * Get v1 state and paused flag for a FireSession
 */
export function getSessionV1State(session: FireSession): { state: SessionStateV1; paused: boolean } {
  return mapSessionStatusToV1(session.status, {
    prep_started_at: session.sessionStartTime ? new Date(session.sessionStartTime) : null,
    handoff_started_at: null // FireSession doesn't track handoff separately
  });
}