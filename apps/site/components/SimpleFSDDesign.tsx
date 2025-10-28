"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Users, 
  CheckCircle, 
  Pause, 
  Play,
  AlertTriangle,
  MoreVertical,
  Flame,
  Info,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Package,
  Truck,
  Home,
  Coffee,
  Timer,
  Zap,
  DollarSign,
  X,
  RotateCcw,
  CreditCard,
  Ban,
  Brain
} from 'lucide-react';
import CreateSessionModal from './CreateSessionModal';

// Enhanced Session Types
type SessionStatus = 
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

type SessionAction = 
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
  | 'VOID_SESSION'
;

type UserRole = 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';

interface FireSession {
  id: string;
  tableId: string;
  customerName: string;
  flavor: string;
  amount: number;
  status: SessionStatus;
  sessionTimer?: {
    remaining: number;
    totalDuration: number;
    status: 'running' | 'paused' | 'stopped';
    timerStartedAt?: number;
    timerPausedAt?: number;
    timerPausedDuration?: number;
  };
  notes?: string;
  assignedStaff: {
    boh: string;
    foh: string;
  };
  coalStatus?: 'active' | 'needs_refill' | 'burnt_out';
  refillStatus?: 'none' | 'requested' | 'in_progress' | 'completed';
  // Add other relevant fields from mock data or actual session structure
}

interface SimpleFSDDesignProps {
  sessions?: FireSession[];
  userRole?: UserRole;
  onSessionAction?: (action: string, sessionId: string) => void;
  className?: string;
}

// Constants for session management
const STATUS_COLORS: Record<SessionStatus, string> = {
  'NEW': 'bg-blue-500/20 text-blue-400',
  'PAID_CONFIRMED': 'bg-green-500/20 text-green-400',
  'PREP_IN_PROGRESS': 'bg-orange-500/20 text-orange-400',
  'HEAT_UP': 'bg-red-500/20 text-red-400',
  'READY_FOR_DELIVERY': 'bg-purple-500/20 text-purple-400',
  'OUT_FOR_DELIVERY': 'bg-teal-500/20 text-teal-400',
  'DELIVERED': 'bg-green-500/20 text-green-400',
  'ACTIVE': 'bg-green-500/20 text-green-400',
  'CLOSE_PENDING': 'bg-gray-500/20 text-gray-400',
  'CLOSED': 'bg-zinc-500/20 text-zinc-400',
  'STAFF_HOLD': 'bg-yellow-500/20 text-yellow-400',
  'STOCK_BLOCKED': 'bg-red-500/20 text-red-400',
  'REMAKE': 'bg-orange-500/20 text-orange-400',
  'REFUND_REQUESTED': 'bg-purple-500/20 text-purple-400',
  'REFUNDED': 'bg-green-500/20 text-green-400',
  'FAILED_PAYMENT': 'bg-red-500/20 text-red-400',
  'VOIDED': 'bg-zinc-500/20 text-zinc-400',
};

const ACTION_TO_STATUS: Record<SessionAction, SessionStatus> = {
  'CLAIM_PREP': 'PREP_IN_PROGRESS',
  'HEAT_UP': 'HEAT_UP',
  'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
  'DELIVER_NOW': 'OUT_FOR_DELIVERY',
  'MARK_DELIVERED': 'DELIVERED',
  'START_ACTIVE': 'ACTIVE',
  'PAUSE_SESSION': 'STAFF_HOLD', // Pausing puts it on hold
  'RESUME_SESSION': 'ACTIVE',
  'REQUEST_REFILL': 'ACTIVE', // Refill is a sub-state of active
  'COMPLETE_REFILL': 'ACTIVE',
  'CLOSE_SESSION': 'CLOSE_PENDING',
  'PUT_ON_HOLD': 'STAFF_HOLD',
  'RESOLVE_HOLD': 'ACTIVE',
  'REQUEST_REMAKE': 'REMAKE',
  'PROCESS_REFUND': 'REFUND_REQUESTED',
  'VOID_SESSION': 'VOIDED',
};

const STATUS_TO_STAGE: Record<SessionStatus, string> = {
  'NEW': 'Order Intake',
  'PAID_CONFIRMED': 'Order Intake',
  'PREP_IN_PROGRESS': 'BOH Prep',
  'HEAT_UP': 'BOH Prep',
  'READY_FOR_DELIVERY': 'BOH Prep',
  'OUT_FOR_DELIVERY': 'FOH Delivery',
  'DELIVERED': 'FOH Delivery',
  'ACTIVE': 'Active Session',
  'CLOSE_PENDING': 'Active Session',
  'CLOSED': 'Completed',
  'STAFF_HOLD': 'Edge Case',
  'STOCK_BLOCKED': 'Edge Case',
  'REMAKE': 'Edge Case',
  'REFUND_REQUESTED': 'Edge Case',
  'REFUNDED': 'Completed',
  'FAILED_PAYMENT': 'Edge Case',
  'VOIDED': 'Cancelled',
};

const STATE_DESCRIPTIONS: Record<SessionStatus, string> = {
  'NEW': 'Session created, awaiting payment confirmation.',
  'PAID_CONFIRMED': 'Payment received, session ready for BOH preparation.',
  'PREP_IN_PROGRESS': 'Back of House is preparing the hookah.',
  'HEAT_UP': 'Hookah coals are heating up, almost ready for delivery.',
  'READY_FOR_DELIVERY': 'Hookah is prepared and ready to be delivered to the table.',
  'OUT_FOR_DELIVERY': 'Hookah is currently being delivered to the guest table.',
  'DELIVERED': 'Hookah has been delivered to the guest. Session is now active.',
  'ACTIVE': 'Guest is actively enjoying the hookah session.',
  'CLOSE_PENDING': 'Session is ending, awaiting final closeout and payment reconciliation.',
  'CLOSED': 'Session successfully completed and closed.',
  'STAFF_HOLD': 'Session is on hold due to a staff-initiated reason (e.g., customer request, issue).',
  'STOCK_BLOCKED': 'Session is blocked due to an item being out of stock or other inventory issue.',
  'REMAKE': 'Hookah needs to be remade due to an issue (e.g., wrong flavor, burnt).',
  'REFUND_REQUESTED': 'A refund has been requested for this session.',
  'REFUNDED': 'Session has been refunded.',
  'FAILED_PAYMENT': 'Payment for this session failed.',
  'VOIDED': 'Session has been cancelled or voided.',
};

const ACTION_DESCRIPTIONS: Record<SessionAction, string> = {
  'CLAIM_PREP': 'Assigns the session to BOH staff for preparation.',
  'HEAT_UP': 'Indicates that the coals are being heated for the hookah.',
  'READY_FOR_DELIVERY': 'Marks the hookah as ready for Front of House delivery.',
  'DELIVER_NOW': 'Initiates the delivery process to the guest table.',
  'MARK_DELIVERED': 'Confirms the hookah has been delivered to the guest.',
  'START_ACTIVE': 'Activates the session timer and marks it as active.',
  'PAUSE_SESSION': 'Pauses the session timer and puts the session on hold.',
  'RESUME_SESSION': 'Resumes a paused session and restarts the timer.',
  'REQUEST_REFILL': 'Signals FOH to request a coal refill for the guest.',
  'COMPLETE_REFILL': 'Marks the coal refill as completed by FOH.',
  'CLOSE_SESSION': 'Initiates the session closeout process, stopping the timer.',
  'PUT_ON_HOLD': 'Places the session on a staff-defined hold.',
  'RESOLVE_HOLD': 'Resolves a staff-initiated hold and returns the session to active.',
  'REQUEST_REMAKE': 'Flags the session for a remake due to quality or guest issue.',
  'PROCESS_REFUND': 'Initiates the refund process for the session.',
  'VOID_SESSION': 'Cancels and voids the session, typically for unrecoverable errors.',
};

// State machine for valid transitions
const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  'NEW': ['PAID_CONFIRMED', 'VOIDED'],
  'PAID_CONFIRMED': ['PREP_IN_PROGRESS', 'VOIDED', 'REFUND_REQUESTED'],
  'PREP_IN_PROGRESS': ['HEAT_UP', 'STAFF_HOLD', 'STOCK_BLOCKED', 'VOIDED', 'REMAKE'],
  'HEAT_UP': ['READY_FOR_DELIVERY', 'STAFF_HOLD', 'VOIDED', 'REMAKE'],
  'READY_FOR_DELIVERY': ['OUT_FOR_DELIVERY', 'STAFF_HOLD', 'VOIDED'],
  'OUT_FOR_DELIVERY': ['DELIVERED', 'STAFF_HOLD', 'VOIDED'],
  'DELIVERED': ['ACTIVE', 'STAFF_HOLD', 'VOIDED'],
  'ACTIVE': ['CLOSE_PENDING', 'STAFF_HOLD'], // PAUSE_SESSION and REQUEST_REFILL are actions, not direct status transitions
  'CLOSE_PENDING': ['CLOSED', 'STAFF_HOLD', 'REFUND_REQUESTED'],
  'CLOSED': [],
  'STAFF_HOLD': ['ACTIVE', 'VOIDED'], // RESOLVE_HOLD is an action
  'STOCK_BLOCKED': ['PREP_IN_PROGRESS', 'VOIDED'],
  'REMAKE': ['PREP_IN_PROGRESS', 'VOIDED'],
  'REFUND_REQUESTED': ['REFUNDED', 'VOIDED'],
  'REFUNDED': [],
  'FAILED_PAYMENT': ['PAID_CONFIRMED', 'VOIDED'],
  'VOIDED': [],
};

// Role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, SessionAction[]> = {
  'BOH': ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REQUEST_REMAKE', 'PUT_ON_HOLD', 'RESOLVE_HOLD'],
  'FOH': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'PAUSE_SESSION', 'RESUME_SESSION', 'REQUEST_REFILL', 'COMPLETE_REFILL', 'CLOSE_SESSION', 'PUT_ON_HOLD', 'RESOLVE_HOLD', 'PROCESS_REFUND'],
  'MANAGER': ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'PAUSE_SESSION', 'RESUME_SESSION', 'REQUEST_REFILL', 'COMPLETE_REFILL', 'CLOSE_SESSION', 'PUT_ON_HOLD', 'RESOLVE_HOLD', 'REQUEST_REMAKE', 'PROCESS_REFUND', 'VOID_SESSION'],
  'ADMIN': ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'PAUSE_SESSION', 'RESUME_SESSION', 'REQUEST_REFILL', 'COMPLETE_REFILL', 'CLOSE_SESSION', 'PUT_ON_HOLD', 'RESOLVE_HOLD', 'REQUEST_REMAKE', 'PROCESS_REFUND', 'VOID_SESSION'],
};

// Helper functions
const canPerformAction = (userRole: UserRole, action: SessionAction): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(action);
};

const isValidTransition = (currentStatus: SessionStatus, targetStatus: SessionStatus): boolean => {
  return VALID_TRANSITIONS[currentStatus]?.includes(targetStatus) || false;
};

const calculateRemainingTime = (session: FireSession): number => {
  if (!session.sessionTimer) return 0;
  const { totalDuration, status, timerStartedAt, timerPausedAt, timerPausedDuration } = session.sessionTimer;

  if (status === 'stopped') return 0;

  const now = Date.now();
  let elapsed = 0;

  if (timerStartedAt) {
    elapsed = (now - new Date(timerStartedAt).getTime()) / 1000; // in seconds
  }

  if (timerPausedDuration) {
    elapsed -= timerPausedDuration;
  }

  if (status === 'paused' && timerPausedAt) {
    elapsed -= (now - new Date(timerPausedAt).getTime()) / 1000;
  }

  const remaining = Math.max(0, totalDuration - elapsed);
  return remaining;
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

// Enhanced State Machine - Complete Hookah Lounge Operations
const ACTION_ICONS: Record<SessionAction, React.ReactNode> = {
  'CLAIM_PREP': <Package className="w-4 h-4" />,
  'HEAT_UP': <Flame className="w-4 h-4" />,
  'READY_FOR_DELIVERY': <CheckCircle className="w-4 h-4" />,
  'DELIVER_NOW': <Truck className="w-4 h-4" />,
  'MARK_DELIVERED': <ArrowRight className="w-4 h-4" />,
  'START_ACTIVE': <Play className="w-4 h-4" />,
  'PAUSE_SESSION': <Pause className="w-4 h-4" />,
  'RESUME_SESSION': <Play className="w-4 h-4" />,
  'REQUEST_REFILL': <Coffee className="w-4 h-4" />,
  'COMPLETE_REFILL': <RefreshCw className="w-4 h-4" />,
  'CLOSE_SESSION': <CheckCircle className="w-4 h-4" />,
  'PUT_ON_HOLD': <Home className="w-4 h-4" />,
  'RESOLVE_HOLD': <Zap className="w-4 h-4" />,
  'REQUEST_REMAKE': <RotateCcw className="w-4 h-4" />,
  'PROCESS_REFUND': <CreditCard className="w-4 h-4" />,
  'VOID_SESSION': <X className="w-4 h-4" />
};

const ACTION_COLORS: Record<SessionAction, string> = {
  'CLAIM_PREP': "bg-orange-500 hover:bg-orange-600",
  'HEAT_UP': "bg-red-500 hover:bg-red-600",
  'READY_FOR_DELIVERY': "bg-green-500 hover:bg-green-600",
  'DELIVER_NOW': "bg-purple-500 hover:bg-purple-600",
  'MARK_DELIVERED': "bg-teal-500 hover:bg-teal-600",
  'START_ACTIVE': "bg-green-500 hover:bg-green-600",
  'PAUSE_SESSION': "bg-yellow-500 hover:bg-yellow-600",
  'RESUME_SESSION': "bg-green-500 hover:bg-green-600",
  'REQUEST_REFILL': "bg-blue-500 hover:bg-blue-600",
  'COMPLETE_REFILL': "bg-orange-500 hover:bg-orange-600",
  'CLOSE_SESSION': "bg-gray-500 hover:bg-gray-600",
  'PUT_ON_HOLD': "bg-yellow-500 hover:bg-yellow-600",
  'RESOLVE_HOLD': "bg-green-500 hover:bg-green-600",
  'REQUEST_REMAKE': "bg-orange-500 hover:bg-orange-600",
  'PROCESS_REFUND': "bg-purple-500 hover:bg-purple-600",
  'VOID_SESSION': "bg-red-500 hover:bg-red-600"
};

const STATE_ICONS: Record<SessionStatus, React.ReactNode> = {
  'NEW': <DollarSign className="w-4 h-4" />,
  'PAID_CONFIRMED': <CheckCircle className="w-4 h-4" />,
  'PREP_IN_PROGRESS': <Package className="w-4 h-4" />,
  'HEAT_UP': <Flame className="w-4 h-4" />,
  'READY_FOR_DELIVERY': <Truck className="w-4 h-4" />,
  'OUT_FOR_DELIVERY': <Truck className="w-4 h-4" />,
  'DELIVERED': <ArrowRight className="w-4 h-4" />,
  'ACTIVE': <Play className="w-4 h-4" />,
  'CLOSE_PENDING': <Clock className="w-4 h-4" />,
  'CLOSED': <CheckCircle className="w-4 h-4" />,
  'STAFF_HOLD': <Home className="w-4 h-4" />,
  'STOCK_BLOCKED': <AlertTriangle className="w-4 h-4" />,
  'REMAKE': <RotateCcw className="w-4 h-4" />,
  'REFUND_REQUESTED': <CreditCard className="w-4 h-4" />,
  'REFUNDED': <CheckCircle className="w-4 h-4" />,
  'FAILED_PAYMENT': <X className="w-4 h-4" />,
  'VOIDED': <Ban className="w-4 h-4" />
};

// Generate rich demo data for enhanced presentation
const generateRichDemoData = (): FireSession[] => {
  const customers = [
    'Alex Johnson', 'Maria Garcia', 'David Kim', 'Jennifer Lee', 'Robert Taylor',
    'Amanda White', 'Michael Brown', 'Sarah Davis', 'Christopher Wilson', 'Lisa Chen',
    'James Rodriguez', 'Emily Martinez', 'Daniel Thompson', 'Jessica Anderson', 'Ryan Clark'
  ];
  
  const flavors = [
    'Blue Mist + Mint', 'Strawberry Kiss', 'Mango Tango', 'Grape Mint', 'Peach Paradise',
    'Watermelon Chill', 'Cherry Blossom', 'Lemon Mint', 'Double Apple', 'Pineapple Express',
    'Vanilla Dream', 'Cinnamon Roll', 'Orange Cream', 'Berry Blast', 'Tropical Punch'
  ];
  
  const staff = [
    'Sarah Chen', 'Emma Davis', 'Tom Anderson', 'Rachel Green', 'Mark Thompson',
    'Samantha Lee', 'Daniel Kim', 'Michelle Chen', 'Brandon Lee', 'Jessica Park'
  ];

  const statuses: SessionStatus[] = [
    'ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 
    'DELIVERED', 'CLOSE_PENDING', 'STAFF_HOLD', 'HEAT_UP', 'PAID_CONFIRMED'
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const customer = customers[i % customers.length];
    const flavor = flavors[i % flavors.length];
    const status = statuses[i % statuses.length];
    const amount = 2500 + (i * 200); // $25.00 to $46.00
    
    return {
      id: `session-${i + 1}`,
      tableId: `T-${String(i + 1).padStart(3, '0')}`,
      customerName: customer,
      flavor: flavor,
      amount: amount,
      status: status,
      sessionTimer: status === 'ACTIVE' ? {
        remaining: 1800 + (i * 300), // 30-60 minutes remaining
        totalDuration: 3600, // 60 minutes total
        status: 'running' as const
      } : undefined,
      notes: i % 3 === 0 ? `${customer} prefers mild flavors` : 
             i % 3 === 1 ? `VIP customer - premium service` : 
             i % 3 === 2 ? `Regular customer - knows the menu well` : undefined,
      assignedStaff: {
        boh: staff[i % staff.length],
        foh: staff[(i + 1) % staff.length]
      },
      coalStatus: status === 'ACTIVE' ? (i % 4 === 0 ? 'needs_refill' : 'active') : undefined,
      refillStatus: status === 'ACTIVE' ? (i % 5 === 0 ? 'requested' : 'none') : undefined
    };
  });
};

export default function SimpleFSDDesign({ 
  sessions = [],
  userRole = 'MANAGER',
  onSessionAction,
  className = ''
}: SimpleFSDDesignProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);

  // Use demo data if no sessions provided
  const displaySessions = sessions.length > 0 ? sessions : generateRichDemoData();
  
  // Calculate active session counts per tab
  const getActiveSessionCount = () => {
    if (activeTab === 'boh') {
      return displaySessions.filter(s => s.status === 'PREP_IN_PROGRESS' || s.status === 'HEAT_UP').length;
    } else if (activeTab === 'foh') {
      return displaySessions.filter(s => s.status === 'READY_FOR_DELIVERY' || s.status === 'OUT_FOR_DELIVERY' || s.status === 'DELIVERED' || s.status === 'ACTIVE').length;
    } else if (activeTab === 'edge') {
      return displaySessions.filter(s => s.status === 'STOCK_BLOCKED' || s.status === 'REMAKE' || s.status === 'STAFF_HOLD').length;
    }
    return displaySessions.length; // Overview shows all
  };
  
  const activeSessions = getActiveSessionCount();

  const handleCreateSession = () => {
    setIsCreateSessionModalOpen(true);
  };

  // Listen for custom event from other components
  React.useEffect(() => {
    const handleOpenModal = () => {
      setIsCreateSessionModalOpen(true);
    };
    
    window.addEventListener('openCreateSessionModal', handleOpenModal);
    return () => window.removeEventListener('openCreateSessionModal', handleOpenModal);
  }, []);

  const handleSessionAction = async (action: string, sessionId: string) => {
    console.log(`Action: ${action} on session: ${sessionId}`);
    
    try {
      // Map action to root Prisma API command format
      const commandMap: Record<string, string> = {
        'claim_prep': 'PAYMENT_CONFIRMED',
        'heat_up': 'PREP_STARTED',
        'ready_for_delivery': 'READY_FOR_DELIVERY',
        'deliver_now': 'OUT_FOR_DELIVERY',
        'mark_delivered': 'DELIVERED',
        'start_active': 'ACTIVE',
        'pause_session': 'PAUSE',
        'resume_session': 'RESUME',
        'request_refill': 'REFILL_REQUESTED',
        'complete_refill': 'REFILL_COMPLETED',
        'close_session': 'CLOSE',
        'put_on_hold': 'HOLD',
        'resolve_hold': 'RESOLVE_HOLD',
        'request_remake': 'REMAKE',
        'process_refund': 'REFUND',
        'void_session': 'VOID'
      };

      const command = commandMap[action.toLowerCase()] || action.toUpperCase();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sessions/${sessionId}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cmd: command,
          actor: userRole?.toLowerCase() || 'manager',
          data: {
            notes: `Action ${action} executed by ${userRole || 'MANAGER'}`,
            timestamp: Date.now()
          }
        }),
      });

      const result = await response.json();

      if (result.ok) {
        console.log('Session action successful:', result);
        // Refresh the page to show updated session state
        window.location.reload();
      } else {
        console.error('Session action failed:', result);
        alert(`Action failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error executing session action:', error);
      alert('Failed to execute action. Please try again.');
    }

    if (onSessionAction) {
      onSessionAction(action, sessionId);
    }
  };

  const getSessionStatus = (session: any): SessionStatus => {
    return (session.status || session.state || 'NEW') as SessionStatus;
  };

  const getSessionStage = (session: any): string => {
    const status = getSessionStatus(session);
    return STATUS_TO_STAGE[status];
  };

  const getAvailableActions = (session: any): SessionAction[] => {
    const status = getSessionStatus(session);
    
    // Get all possible actions for this status
    const allActions: SessionAction[] = [
      'CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED',
      'START_ACTIVE', 'PAUSE_SESSION', 'RESUME_SESSION', 'REQUEST_REFILL', 'COMPLETE_REFILL',
      'CLOSE_SESSION', 'PUT_ON_HOLD', 'RESOLVE_HOLD', 'REQUEST_REMAKE', 'PROCESS_REFUND', 'VOID_SESSION'
    ];

    // Filter actions that are valid transitions from current status
    return allActions.filter(action => {
      const targetStatus = ACTION_TO_STATUS[action];
      return isValidTransition(status, targetStatus);
    });
  };

  const canUserPerformAction = (action: SessionAction, userRole: string): boolean => {
    return canPerformAction(userRole as UserRole, action);
  };

  const getSessionDisplayName = (status: SessionStatus): string => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate KPIs
  const activeSessions = displaySessions.filter(s => getSessionStatus(s) === 'ACTIVE').length;
  const totalRevenue = displaySessions.reduce((sum, s) => sum + (s.amount || 0), 0) / 100;
  const avgSessionTime = displaySessions.reduce((sum, s) => {
    const timer = s.sessionTimer;
    return sum + (timer ? timer.totalDuration / 60 : 45); // Default 45 minutes
  }, 0) / displaySessions.length;
  const guestSatisfaction = 94; // Mock satisfaction score

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Session Management</h2>
            <p className="text-sm text-zinc-400">Manage active hookah sessions</p>
          </div>
        </div>
        
        <button
          onClick={handleCreateSession}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🔥</div>
            <div>
              <div className="text-2xl font-bold text-white">{activeSessions}</div>
              <div className="text-sm text-zinc-400">Active Sessions {activeTab !== 'overview' ? `(${activeTab.toUpperCase()})` : ''}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="text-2xl mr-3">💰</div>
            <div>
              <div className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-zinc-400">Total Revenue</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⏱️</div>
            <div>
              <div className="text-2xl font-bold text-white">{Math.round(avgSessionTime)}m</div>
              <div className="text-sm text-zinc-400">Avg Session Time</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⭐</div>
            <div>
              <div className="text-2xl font-bold text-white">{guestSatisfaction}%</div>
              <div className="text-sm text-zinc-400">Guest Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'OVERVIEW', icon: '📊' },
          { id: 'boh', label: 'BOH', icon: '👨‍🍳' },
          { id: 'foh', label: 'FOH', icon: '👨‍💼' },
          { id: 'edge', label: 'EDGE CASES', icon: '⚠️' },
          { id: 'waitlist', label: 'WAITLIST', icon: '⏰' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Sessions ({activeSessions})</h3>
          </div>
          
          {displaySessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <Flame className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Active Sessions</h3>
              <p className="text-zinc-400 mb-4">Start a new session to begin managing your hookah lounge operations.</p>
              <button
                onClick={handleCreateSession}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Create First Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displaySessions.map((session) => {
                const status = getSessionStatus(session);
                const stage = getSessionStage(session);
                const availableActions = getAvailableActions(session);
                const remainingTime = calculateRemainingTime(session);
                
                return (
                  <div key={session.id} className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 hover:border-orange-500/50 transition-all duration-200">
                    {/* Session Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {STATE_ICONS[status]}
                        <span className="font-semibold text-white">{session.tableId}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
                        {getSessionDisplayName(status)}
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Customer:</span>
                        <span className="text-white font-medium">{session.customerName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Flavor:</span>
                        <span className="text-white">{session.flavor}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Duration:</span>
                        <span className="text-white">
                          {remainingTime > 0 ? formatDuration(remainingTime) : 'N/A'}
                        </span>
                      </div>
                      {userRole === 'ADMIN' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Revenue:</span>
                          <span className="text-white font-semibold">${(session.amount / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Staff:</span>
                        <span className="text-white">{session.assignedStaff.foh}</span>
                      </div>
                      {session.notes && (
                        <div className="text-xs text-zinc-400 italic">
                          {session.notes}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {availableActions.slice(0, 3).map((action) => {
                        if (!canUserPerformAction(action, userRole)) return null;
                        
                        return (
                          <button
                            key={action}
                            onClick={() => handleSessionAction(action.toLowerCase(), session.id)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${ACTION_COLORS[action]}`}
                            onMouseEnter={() => setHoveredAction(action)}
                            onMouseLeave={() => setHoveredAction(null)}
                          >
                            {ACTION_ICONS[action]}
                            <span>{action.replace(/_/g, ' ')}</span>
                          </button>
                        );
                      })}
                      {availableActions.length > 3 && (
                        <button 
                          onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-zinc-600 hover:bg-zinc-500 text-white transition-all"
                        >
                          {expandedSessionId === session.id ? 'Show Less' : `+${availableActions.length - 3} more`}
                        </button>
                      )}
                    </div>

                    {/* Expanded Actions (shown when clicked) */}
                    {expandedSessionId === session.id && availableActions.length > 3 && (
                      <div className="mt-2 pt-2 border-t border-zinc-700 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                        {availableActions.slice(3).map((action) => {
                          if (!canUserPerformAction(action, userRole)) return null;
                          
                          return (
                            <button
                              key={action}
                              onClick={() => handleSessionAction(action.toLowerCase(), session.id)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${ACTION_COLORS[action]}`}
                            >
                              {ACTION_ICONS[action]}
                              <span>{action.replace(/_/g, ' ')}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Other tabs would show filtered sessions */}
      {activeTab !== 'overview' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
            <Flame className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{activeTab.toUpperCase()} View</h3>
          <p className="text-zinc-400">Filtered session view coming soon...</p>
        </div>
      )}

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateSessionModalOpen}
        onClose={() => setIsCreateSessionModalOpen(false)}
        onSave={(data) => {
          console.log('Creating new session:', data);
          alert(`Session created successfully!\n\nTable: ${data.table}\nCustomer: ${data.customerName}\nTotal: $${(data.basePrice + data.addons.length * 2).toFixed(2)}`);
        }}
      />
    </div>
  );
}