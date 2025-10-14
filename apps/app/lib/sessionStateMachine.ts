// Enhanced Session State Machine based on commit #31zZH8hVp
// Complete state machine for managing hookah sessions with validated transitions

export type SessionStatus = 
  | 'NEW'
  | 'PAID_CONFIRMED'
  | 'PREP_IN_PROGRESS'
  | 'HEAT_UP'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CLOSE_PENDING'
  | 'CLOSED'
  | 'STAFF_HOLD'
  | 'STOCK_BLOCKED'
  | 'REMAKE'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'FAILED_PAYMENT'
  | 'VOIDED';

export type SessionStage = 'BOH' | 'FOH' | 'CUSTOMER';

export interface SessionTimer {
  remaining: number; // seconds
  total: number; // seconds
  isActive: boolean;
  startedAt?: number;
  pausedAt?: number;
  pausedDuration?: number;
}

export interface FireSession {
  id: string;
  tableId: string;
  customerName: string;
  customerPhone?: string;
  flavor: string;
  amount: number;
  status: SessionStatus;
  currentStage: SessionStage;
  assignedStaff: {
    boh?: string;
    foh?: string;
  };
  createdAt: number;
  updatedAt: number;
  sessionStartTime?: number;
  sessionDuration: number;
  coalStatus: 'active' | 'needs_refill' | 'burnt_out';
  refillStatus: 'none' | 'requested' | 'delivered';
  notes: string;
  edgeCase: string | null;
  sessionTimer?: SessionTimer;
  bohState?: 'PREPARING' | 'WARMING_UP' | 'READY_FOR_PICKUP' | 'PICKED_UP';
  guestTimerDisplay?: boolean;
}

// State transition validation
export const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  'NEW': ['PAID_CONFIRMED', 'FAILED_PAYMENT'],
  'PAID_CONFIRMED': ['PREP_IN_PROGRESS', 'REFUND_REQUESTED'],
  'PREP_IN_PROGRESS': ['HEAT_UP', 'STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE'],
  'HEAT_UP': ['READY_FOR_DELIVERY', 'STAFF_HOLD'],
  'READY_FOR_DELIVERY': ['OUT_FOR_DELIVERY', 'STAFF_HOLD'],
  'OUT_FOR_DELIVERY': ['DELIVERED', 'STAFF_HOLD'],
  'DELIVERED': ['ACTIVE', 'STAFF_HOLD'],
  'ACTIVE': ['PAUSED', 'COMPLETED', 'CLOSE_PENDING', 'STAFF_HOLD'],
  'PAUSED': ['ACTIVE', 'COMPLETED', 'CLOSE_PENDING', 'STAFF_HOLD'],
  'COMPLETED': ['CLOSED'],
  'CLOSE_PENDING': ['CLOSED', 'ACTIVE'],
  'CLOSED': [],
  'STAFF_HOLD': ['PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'ACTIVE', 'CLOSE_PENDING'],
  'STOCK_BLOCKED': ['PREP_IN_PROGRESS'],
  'REMAKE': ['PREP_IN_PROGRESS'],
  'REFUND_REQUESTED': ['REFUNDED'],
  'REFUNDED': [],
  'FAILED_PAYMENT': ['VOIDED'],
  'VOIDED': []
};

// Stage mapping for each status
export const STATUS_TO_STAGE: Record<SessionStatus, SessionStage> = {
  'NEW': 'CUSTOMER',
  'PAID_CONFIRMED': 'BOH',
  'PREP_IN_PROGRESS': 'BOH',
  'HEAT_UP': 'BOH',
  'READY_FOR_DELIVERY': 'BOH',
  'OUT_FOR_DELIVERY': 'FOH',
  'DELIVERED': 'FOH',
  'ACTIVE': 'CUSTOMER',
  'PAUSED': 'CUSTOMER',
  'COMPLETED': 'FOH',
  'CLOSE_PENDING': 'FOH',
  'CLOSED': 'FOH',
  'STAFF_HOLD': 'BOH',
  'STOCK_BLOCKED': 'BOH',
  'REMAKE': 'BOH',
  'REFUND_REQUESTED': 'FOH',
  'REFUNDED': 'FOH',
  'FAILED_PAYMENT': 'CUSTOMER',
  'VOIDED': 'FOH'
};

// Action types for session commands
export type SessionAction = 
  | 'CLAIM_PREP'
  | 'HEAT_UP'
  | 'READY_FOR_DELIVERY'
  | 'DELIVER_NOW'
  | 'MARK_DELIVERED'
  | 'START_ACTIVE'
  | 'PAUSE_SESSION'
  | 'RESUME_SESSION'
  | 'REQUEST_REFILL'
  | 'COMPLETE_REFILL'
  | 'CLOSE_SESSION'
  | 'PUT_ON_HOLD'
  | 'RESOLVE_HOLD'
  | 'REQUEST_REMAKE'
  | 'PROCESS_REFUND'
  | 'VOID_SESSION';

// Action to status mapping
export const ACTION_TO_STATUS: Record<SessionAction, SessionStatus> = {
  'CLAIM_PREP': 'PREP_IN_PROGRESS',
  'HEAT_UP': 'HEAT_UP',
  'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
  'DELIVER_NOW': 'OUT_FOR_DELIVERY',
  'MARK_DELIVERED': 'DELIVERED',
  'START_ACTIVE': 'ACTIVE',
  'PAUSE_SESSION': 'STAFF_HOLD',
  'RESUME_SESSION': 'ACTIVE',
  'REQUEST_REFILL': 'ACTIVE',
  'COMPLETE_REFILL': 'ACTIVE',
  'CLOSE_SESSION': 'CLOSE_PENDING',
  'PUT_ON_HOLD': 'STAFF_HOLD',
  'RESOLVE_HOLD': 'ACTIVE',
  'REQUEST_REMAKE': 'REMAKE',
  'PROCESS_REFUND': 'REFUND_REQUESTED',
  'VOID_SESSION': 'VOIDED'
};

// Permission-based action validation
export type UserRole = 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';

export const ROLE_PERMISSIONS: Record<UserRole, SessionAction[]> = {
  'BOH': [
    'CLAIM_PREP',
    'HEAT_UP', 
    'READY_FOR_DELIVERY',
    'PUT_ON_HOLD',
    'RESOLVE_HOLD',
    'REQUEST_REMAKE'
  ],
  'FOH': [
    'DELIVER_NOW',
    'MARK_DELIVERED',
    'START_ACTIVE',
    'PAUSE_SESSION',
    'RESUME_SESSION',
    'REQUEST_REFILL',
    'COMPLETE_REFILL',
    'CLOSE_SESSION',
    'PROCESS_REFUND'
  ],
  'MANAGER': [
    'CLAIM_PREP',
    'HEAT_UP',
    'READY_FOR_DELIVERY',
    'DELIVER_NOW',
    'MARK_DELIVERED',
    'START_ACTIVE',
    'PAUSE_SESSION',
    'RESUME_SESSION',
    'REQUEST_REFILL',
    'COMPLETE_REFILL',
    'CLOSE_SESSION',
    'PUT_ON_HOLD',
    'RESOLVE_HOLD',
    'REQUEST_REMAKE',
    'PROCESS_REFUND',
    'VOID_SESSION'
  ],
  'ADMIN': [
    'CLAIM_PREP',
    'HEAT_UP',
    'READY_FOR_DELIVERY',
    'DELIVER_NOW',
    'MARK_DELIVERED',
    'START_ACTIVE',
    'PAUSE_SESSION',
    'RESUME_SESSION',
    'REQUEST_REFILL',
    'COMPLETE_REFILL',
    'CLOSE_SESSION',
    'PUT_ON_HOLD',
    'RESOLVE_HOLD',
    'REQUEST_REMAKE',
    'PROCESS_REFUND',
    'VOID_SESSION'
  ]
};

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

// Session status colors for UI
export const STATUS_COLORS: Record<SessionStatus, string> = {
  'NEW': 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  'PAID_CONFIRMED': 'bg-green-500/20 border-green-500/30 text-green-300',
  'PREP_IN_PROGRESS': 'bg-orange-500/20 border-orange-500/30 text-orange-300',
  'HEAT_UP': 'bg-red-500/20 border-red-500/30 text-red-300',
  'READY_FOR_DELIVERY': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
  'OUT_FOR_DELIVERY': 'bg-purple-500/20 border-purple-500/30 text-purple-300',
  'DELIVERED': 'bg-teal-500/20 border-teal-500/30 text-teal-300',
  'ACTIVE': 'bg-green-500/20 border-green-500/30 text-green-300',
  'CLOSE_PENDING': 'bg-gray-500/20 border-gray-500/30 text-gray-300',
  'CLOSED': 'bg-gray-600/20 border-gray-600/30 text-gray-400',
  'STAFF_HOLD': 'bg-yellow-600/20 border-yellow-600/30 text-yellow-300',
  'STOCK_BLOCKED': 'bg-red-600/20 border-red-600/30 text-red-300',
  'REMAKE': 'bg-orange-600/20 border-orange-600/30 text-orange-300',
  'REFUND_REQUESTED': 'bg-purple-600/20 border-purple-600/30 text-purple-300',
  'REFUNDED': 'bg-gray-500/20 border-gray-500/30 text-gray-300',
  'FAILED_PAYMENT': 'bg-red-700/20 border-red-700/30 text-red-400',
  'VOIDED': 'bg-gray-700/20 border-gray-700/30 text-gray-500'
};