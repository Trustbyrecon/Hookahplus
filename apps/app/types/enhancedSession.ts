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
  | 'CLOSE_PENDING'
  | 'CLOSED'
  | 'STAFF_HOLD'
  | 'STOCK_BLOCKED'
  | 'REMAKE'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'FAILED_PAYMENT'
  | 'VOIDED';

// Canonical 5-stage tracker (Payment → Prep → Ready → Deliver → Light)
export type TrackerStage = 'Payment' | 'Prep' | 'Ready' | 'Deliver' | 'Light';

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
  // High-level status/stage
  status: SessionStatus;
  currentStage: SessionStage;
  stage?: TrackerStage; // Canonical NAN stage (Payment/Prep/Ready/Deliver/Light)
  action?: string; // Optional substate/action label (e.g., HEAT_UP, READY_FOR_DELIVERY)
  // Pricing / refill metadata
  sessionType?: 'TIME_BASED' | 'FLAT';
  hadRefill?: boolean;
  refillCount?: number;
  isRefillBillable?: boolean;
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
  source?: 'QR' | 'RESERVE' | 'WALK_IN' | 'POS' | string; // Session source from Prisma
  externalRef?: string | null; // Stripe checkout session ID or other external reference
  paymentStatus?: string | null; // Payment status from Stripe
  state?: string | null; // Raw database state value (PENDING, ACTIVE, CLOSED, etc.)
}

// State transition validation
export const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  'NEW': ['PAID_CONFIRMED', 'FAILED_PAYMENT', 'VOIDED'],
  'PAID_CONFIRMED': ['PREP_IN_PROGRESS', 'REFUND_REQUESTED', 'VOIDED'],
  'PREP_IN_PROGRESS': ['HEAT_UP', 'READY_FOR_DELIVERY', 'ACTIVE', 'STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE'],
  'HEAT_UP': ['READY_FOR_DELIVERY', 'ACTIVE', 'STAFF_HOLD'],
  'READY_FOR_DELIVERY': ['OUT_FOR_DELIVERY', 'ACTIVE', 'STAFF_HOLD'],
  'OUT_FOR_DELIVERY': ['DELIVERED', 'ACTIVE', 'STAFF_HOLD'],
  'DELIVERED': ['ACTIVE', 'STAFF_HOLD'],
  'ACTIVE': ['CLOSE_PENDING', 'STAFF_HOLD'],
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

// Map status to canonical 5-stage tracker
export const STATUS_TO_TRACKER_STAGE: Record<SessionStatus, TrackerStage> = {
  'NEW': 'Payment',
  'PAID_CONFIRMED': 'Payment',
  'PREP_IN_PROGRESS': 'Prep',
  'HEAT_UP': 'Prep',
  'READY_FOR_DELIVERY': 'Ready',
  'OUT_FOR_DELIVERY': 'Deliver',
  'DELIVERED': 'Deliver',
  'ACTIVE': 'Light',
  'CLOSE_PENDING': 'Deliver',
  'CLOSED': 'Deliver',
  'STAFF_HOLD': 'Prep',
  'STOCK_BLOCKED': 'Prep',
  'REMAKE': 'Prep',
  'REFUND_REQUESTED': 'Deliver',
  'REFUNDED': 'Deliver',
  'FAILED_PAYMENT': 'Payment',
  'VOIDED': 'Deliver',
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
