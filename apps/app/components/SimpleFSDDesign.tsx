"use client";

import React, { useState, useEffect } from 'react';
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
  Brain,
  Shield,
  ChefHat,
  UserCheck
} from 'lucide-react';
import { 
  SessionStatus, 
  SessionAction, 
  UserRole, 
  FireSession,
  STATUS_COLORS,
  ACTION_TO_STATUS,
  STATUS_TO_STAGE
} from '../types/enhancedSession';
import { 
  canPerformAction, 
  isValidTransition, 
  nextStateWithTrust,
  calculateRemainingTime,
  formatDuration,
  STATE_DESCRIPTIONS,
  ACTION_DESCRIPTIONS
} from '../lib/sessionStateMachine';
import { calculateSingleSessionTrustScore, getTrustScoreColor } from '../lib/trustScoring';
import SessionDetailModal from './SessionDetailModal';
import GuestIntelligenceModal from './GuestIntelligenceModal';
import ResolveEdgeCaseModal from './ResolveEdgeCaseModal';
import SessionExtensionModal from './SessionExtensionModal';

interface SimpleFSDDesignProps {
  sessions?: any[];
  userRole?: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onSessionAction?: (action: string, sessionId: string) => void;
  refreshSessions?: () => void | Promise<void>;
  className?: string;
}

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

export default function SimpleFSDDesign({ 
  sessions = [],
  userRole = 'MANAGER',
  onSessionAction,
  refreshSessions,
  className = ''
}: SimpleFSDDesignProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<FireSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showIntelligenceModal, setShowIntelligenceModal] = useState(false);
  const [intelligenceSessionId, setIntelligenceSessionId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveSessionId, setResolveSessionId] = useState<string>('');
  const [resolveEdgeCaseType, setResolveEdgeCaseType] = useState<string | null>(null);
  const [timerUpdates, setTimerUpdates] = useState<Record<string, number>>({});
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionSessionId, setExtensionSessionId] = useState<string>('');
  const [extensionSessionData, setExtensionSessionData] = useState<{
    currentDuration: number;
    remainingTime: number;
  } | null>(null);
  
  // Fix hydration mismatch - only render counts after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Real-time timer updates for active sessions
  useEffect(() => {
    const activeSessions = sessions.filter(s => 
      s.sessionTimer?.isActive && s.status === 'ACTIVE'
    );

    if (activeSessions.length === 0) return;

    const interval = setInterval(() => {
      const updates: Record<string, number> = {};
      activeSessions.forEach(session => {
        if (session.sessionTimer) {
          const remaining = calculateRemainingTime(session);
          updates[session.id] = remaining;
        }
      });
      setTimerUpdates(prev => ({ ...prev, ...updates }));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [sessions]);

  const handleCreateSession = () => {
    window.dispatchEvent(new CustomEvent('openCreateSessionModal'));
  };

  const handleSessionAction = async (action: string, sessionId: string) => {
    console.log(`Action: ${action} on session: ${sessionId}`);
    
    // Special handling for RESOLVE_HOLD - show modal instead of direct API call
    if (action.toLowerCase() === 'resolve_hold' || action === 'RESOLVE_HOLD') {
      const session = sessions.find(s => s.id === sessionId);
      setResolveSessionId(sessionId);
      setResolveEdgeCaseType(session?.edgeCase || null);
      setShowResolveModal(true);
      return;
    }

    // Special handling for REQUEST_REFILL - use refill API
    if (action.toLowerCase() === 'request_refill' || action === 'REQUEST_REFILL') {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/refill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userRole,
            operatorId: `foh-${userRole.toLowerCase()}`
          })
        });

        const result = await response.json();
        if (result.success) {
          alert('Refill requested! BOH will prepare new coals.');
          if (refreshSessions) {
            await refreshSessions();
          } else {
            window.location.reload();
          }
        } else {
          throw new Error(result.details || result.error || 'Failed to request refill');
        }
        return;
      } catch (error) {
        console.error('Error requesting refill:', error);
        alert(`Failed to request refill: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    // Special handling for COMPLETE_REFILL - use refill API
    if (action.toLowerCase() === 'complete_refill' || action === 'COMPLETE_REFILL') {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/refill`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userRole,
            operatorId: `boh-${userRole.toLowerCase()}`
          })
        });

        const result = await response.json();
        if (result.success) {
          alert('Refill completed! New coals delivered to customer.');
          if (refreshSessions) {
            await refreshSessions();
          } else {
            window.location.reload();
          }
        } else {
          throw new Error(result.details || result.error || 'Failed to complete refill');
        }
        return;
      } catch (error) {
        console.error('Error completing refill:', error);
        alert(`Failed to complete refill: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }
    
    try {
      // Map action to SessionAction format for PATCH endpoint
      const actionMap: Record<string, string> = {
        'claim_prep': 'CLAIM_PREP',
        'heat_up': 'HEAT_UP',
        'ready_for_delivery': 'READY_FOR_DELIVERY',
        'deliver_now': 'DELIVER_NOW',
        'mark_delivered': 'MARK_DELIVERED',
        'start_active': 'START_ACTIVE',
        'pause_session': 'PAUSE_SESSION',
        'resume_session': 'RESUME_SESSION',
        'request_refill': 'REQUEST_REFILL',
        'complete_refill': 'COMPLETE_REFILL',
        'close_session': 'CLOSE_SESSION',
        'put_on_hold': 'PUT_ON_HOLD',
        'resolve_hold': 'RESOLVE_HOLD',
        'request_remake': 'REQUEST_REMAKE',
        'process_refund': 'PROCESS_REFUND',
        'void_session': 'VOID_SESSION'
      };

      const mappedAction = actionMap[action.toLowerCase()] || action.toUpperCase();
      
      // Use PATCH endpoint at /api/sessions
      const response = await fetch(`/api/sessions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          action: mappedAction,
          userRole: userRole || 'MANAGER',
          operatorId: `user-${userRole?.toLowerCase() || 'manager'}`,
          notes: `Action ${mappedAction} executed by ${userRole || 'MANAGER'}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('Session action successful:', result);
        // Trigger a custom event to refresh sessions
        window.dispatchEvent(new CustomEvent('sessionUpdated', { detail: { sessionId, action: mappedAction } }));
        
        // Use refreshSessions if provided, otherwise reload page
        if (refreshSessions) {
          try {
            await refreshSessions();
          } catch (refreshError) {
            console.error('Failed to refresh sessions, reloading page:', refreshError);
            window.location.reload();
          }
        } else {
          // Fallback: reload page to show updated state immediately
          window.location.reload();
        }
      } else {
        throw new Error(result.error || result.details || 'Action failed');
      }
    } catch (error) {
      console.error('Error executing session action:', error);
      
      // Parse specific error messages
      let errorMessage = 'Failed to execute action. Please try again.';
      
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Session not found')) {
          errorMessage = 'Session not found. It may have been closed or removed.';
        } else if (error.message.includes('Invalid transition') || error.message.includes('State transition') || error.message.includes('not available')) {
          errorMessage = 'State transition failed: This action is not available for the current session state.';
        } else if (error.message.includes('Permission denied') || error.message.includes('403')) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('500') || error.message.includes('Internal server')) {
          errorMessage = 'Server error. Please try again in a moment.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show user-friendly error with actionable message
      alert(`Error: ${errorMessage}`);
      
      // Log to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'session_action_error', {
          event_category: 'error',
          event_label: action,
          error_message: errorMessage
        });
      }
    }

    if (onSessionAction) {
      onSessionAction(action, sessionId);
    }
  };

  const handleResolveEdgeCase = async (sessionId: string, resolutionNotes: string) => {
    try {
      // Call API to resolve edge case with notes
      const response = await fetch(`/api/sessions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          action: 'RESOLVE_HOLD',
          userRole: userRole || 'MANAGER',
          operatorId: `user-${userRole?.toLowerCase() || 'manager'}`,
          notes: resolutionNotes,
          edgeCase: null, // Clear edge case when resolved
          edgeNote: resolutionNotes // Store resolution notes for briefing/coaching
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('Edge case resolved successfully:', result);
        // Refresh the page to show updated state
        window.location.reload();
      } else {
        throw new Error(result.error || 'Failed to resolve edge case');
      }
    } catch (error) {
      console.error('Error resolving edge case:', error);
      throw error;
    }
  };

  const getSessionStatus = (session: any): SessionStatus => {
    // If session already has a status, use it (might be from convertPrismaSessionToFireSession)
    if (session.status && session.status !== 'NEW' && session.status !== 'PENDING') {
      return session.status as SessionStatus;
    }
    
    // Check if PENDING state with succeeded payment = PAID_CONFIRMED
    const state = session.state || session.status || 'NEW';
    if (state === 'PENDING' && session.paymentStatus === 'succeeded') {
      return 'PAID_CONFIRMED';
    }
    
    // Map database state to FireSession status
    const stateMap: Record<string, SessionStatus> = {
      'PENDING': session.paymentStatus === 'succeeded' ? 'PAID_CONFIRMED' : 'NEW',
      'ACTIVE': 'ACTIVE',
      'PAUSED': 'STAFF_HOLD',
      'CLOSED': 'CLOSED',
      'CANCELED': 'VOIDED',
      'NEW': 'NEW',
      'PREP_IN_PROGRESS': 'PREP_IN_PROGRESS',
      'HEAT_UP': 'HEAT_UP',
      'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
      'PAID_CONFIRMED': 'PAID_CONFIRMED',
    };
    
    return stateMap[state] || (session.status as SessionStatus) || 'NEW';
  };

  const getSessionStage = (session: any): string => {
    const status = getSessionStatus(session);
    return STATUS_TO_STAGE[status];
  };

  const getAvailableActions = (session: any): SessionAction[] => {
    const status = getSessionStatus(session);
    const stage = getSessionStage(session);
    
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

  // Reusable function to render a session card
  const renderSessionCard = (session: any) => {
    const sessionStatus = getSessionStatus(session);
    const sessionStage = getSessionStage(session);
    const availableActions = getAvailableActions(session);
    const sessionId = session.id || session.session_id;
    const displayName = getSessionDisplayName(sessionStatus);
    const statusColor = STATUS_COLORS[sessionStatus];
    const stateIcon = STATE_ICONS[sessionStatus];

    const trustScore = calculateSingleSessionTrustScore(session as FireSession);
    const trustScoreColor = getTrustScoreColor(trustScore);

    return (
      <div
        key={sessionId}
        className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors cursor-pointer"
        onClick={() => {
          setSelectedSession(session as FireSession);
          setIsModalOpen(true);
        }}
      >
        {/* Session Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${statusColor}`}>
              {stateIcon}
            </div>
            <div>
              <h3 className="font-medium text-white">
                {session.table_id || session.tableId || 'Table Unknown'}
              </h3>
              <p className="text-sm text-zinc-400">
                {session.customer_name || session.customerName || 'Guest Customer'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
              {displayName}
            </span>
            <span className="text-xs text-zinc-500">
              {sessionStage}
            </span>
            <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900/50 rounded">
              <Shield className="w-3 h-3 text-zinc-400" />
              <span className={`text-xs font-semibold ${trustScoreColor}`}>
                {trustScore}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced State Description */}
        <div className="mb-3 p-2 bg-zinc-900/50 rounded text-xs text-zinc-300">
          <div className="flex items-center space-x-1 mb-1">
            <Info className="w-3 h-3" />
            <span className="font-medium">Current State:</span>
          </div>
          <p>{STATE_DESCRIPTIONS[sessionStatus]}</p>
        </div>

        {/* Timer Display - Real-time updates */}
        {session.sessionTimer && (
          <div className={`mb-3 p-2 rounded text-xs ${
            (timerUpdates[session.id] ?? calculateRemainingTime(session)) < 5 * 60
              ? 'bg-red-900/30 border border-red-600/50 text-red-300'
              : (timerUpdates[session.id] ?? calculateRemainingTime(session)) < 10 * 60
              ? 'bg-yellow-900/30 border border-yellow-600/50 text-yellow-300'
              : 'bg-zinc-900/30 text-zinc-300'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Timer className="w-3 h-3" />
                <span className="font-medium">Session Timer:</span>
              </div>
              <div className="flex items-center space-x-2">
                {session.sessionTimer.isActive && (
                  <span className="text-xs opacity-75 animate-pulse">● Live</span>
                )}
                {/* Extension Button - Only show for active sessions */}
                {session.status === 'ACTIVE' && session.sessionTimer.isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExtensionSessionId(sessionId);
                      setExtensionSessionData({
                        currentDuration: Math.floor((session.sessionDuration || 45 * 60) / 60),
                        remainingTime: timerUpdates[session.id] ?? calculateRemainingTime(session)
                      });
                      setShowExtensionModal(true);
                    }}
                    className="text-xs px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors"
                    title="Extend session"
                  >
                    + Extend
                  </button>
                )}
              </div>
            </div>
            <p className="text-lg font-mono">
              {formatDuration(timerUpdates[session.id] ?? calculateRemainingTime(session))}
            </p>
            {(timerUpdates[session.id] ?? calculateRemainingTime(session)) <= 0 && (
              <p className="text-xs text-red-400 mt-1">Session expired</p>
            )}
          </div>
        )}

        {/* Session Notes */}
        {session.notes && (
          <div className="mb-3 p-2 bg-blue-900/20 border border-blue-600/30 rounded text-xs">
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-blue-400">📝</span>
              <span className="font-medium text-blue-300">Session Notes:</span>
            </div>
            <p className="text-blue-200">{session.notes}</p>
          </div>
        )}

        {/* Available Actions */}
        {availableActions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-xs text-zinc-400">
              <Zap className="w-3 h-3" />
              <span className="font-medium">Available Actions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableActions.map((action) => {
                const canPerform = canUserPerformAction(action, userRole);
                return (
                  <div key={action} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        canPerform && handleSessionAction(action.toLowerCase(), sessionId);
                      }}
                      disabled={!canPerform}
                      onMouseEnter={() => setHoveredAction(action)}
                      onMouseLeave={() => setHoveredAction(null)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                        canPerform 
                          ? ACTION_COLORS[action]
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {ACTION_ICONS[action]}
                      <span>{action.replace(/_/g, ' ')}</span>
                      <Info className="w-3 h-3" />
                    </button>
                    
                    {/* Enhanced Business Logic Tooltip */}
                    {hoveredAction === action && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-10">
                        <div className="flex items-center space-x-1 mb-2">
                          <Info className="w-3 h-3 text-blue-400" />
                          <span className="text-xs font-medium text-blue-400">Business Logic</span>
                        </div>
                        <p className="text-xs text-zinc-300 mb-2">{ACTION_DESCRIPTIONS[action]}</p>
                        <div className="pt-2 border-t border-zinc-700">
                          <p className="text-xs text-zinc-400">
                            <span className="font-medium">Next State:</span> {getSessionDisplayName(ACTION_TO_STATUS[action])}
                          </p>
                          <p className="text-xs text-zinc-400">
                            <span className="font-medium">Stage:</span> {STATUS_TO_STAGE[ACTION_TO_STATUS[action]]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Intelligence Button */}
            <div className="mt-3 pt-3 border-t border-zinc-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIntelligenceSessionId(sessionId);
                  setShowIntelligenceModal(true);
                }}
                className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors w-full justify-center"
              >
                <Brain className="w-3 h-3" />
                <span className="text-xs font-medium">View Intelligence</span>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Session Details */}
        <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
          {session.flavor && (
            <p className="text-sm text-zinc-400">
              <span className="font-medium">Flavor:</span> {session.flavor}
            </p>
          )}
          {session.amount && (
            <p className="text-sm text-zinc-400">
              <span className="font-medium">Amount:</span> ${(session.amount / 100).toFixed(2)}
            </p>
          )}
          {session.assignedStaff?.boh && (
            <p className="text-sm text-zinc-400">
              <span className="font-medium">BOH Staff:</span> {session.assignedStaff.boh}
            </p>
          )}
          {session.assignedStaff?.foh && (
            <p className="text-sm text-zinc-400">
              <span className="font-medium">FOH Staff:</span> {session.assignedStaff.foh}
            </p>
          )}
          {session.coalStatus && (
            <p className="text-sm text-zinc-400">
              <span className="font-medium">Coal Status:</span> {session.coalStatus.replace(/_/g, ' ')}
            </p>
          )}
          {session.refillStatus && session.refillStatus !== 'none' && (
            <p className="text-sm text-zinc-400">
              <span className="font-medium">Refill Status:</span> {session.refillStatus.replace(/_/g, ' ')}
            </p>
          )}
        </div>
      </div>
    );
  };

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

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'OVERVIEW', icon: '📊' },
          { id: 'boh', label: 'BOH', icon: '👨‍🍳' },
          { id: 'foh', label: 'FOH', icon: '👨‍💼' },
          { id: 'edge', label: 'EDGE CASES', icon: '⚠️' }
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
          {/* Quick Actions Bar - Workflow Actions */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-300">Quick Actions - Night After Night Flow</h3>
              <span className="text-xs text-zinc-500">{sessions.length} session(s)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openCreateSessionModal'))}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Session</span>
              </button>
              <button
                onClick={async () => {
                  // Find sessions that need payment confirmation (NEW status only - PAID_CONFIRMED means already paid)
                  // Note: 'PENDING' is not a SessionStatus - it gets mapped to 'NEW' or 'PAID_CONFIRMED' by getSessionStatus
                  const unpaidSessions = sessions.filter(s => {
                    const status = getSessionStatus(s);
                    return status === 'NEW';
                  });
                  
                  if (unpaidSessions.length === 0) {
                    alert('No sessions awaiting payment confirmation.\n\nAll sessions are either paid or already in progress.');
                    return;
                  }
                  
                  // For now, process first unpaid session
                  const session = unpaidSessions[0];
                  const amount = session.amount || 3000;
                  
                  try {
                    // SECURITY: Use existing session ID (session already exists)
                    const sessionId = session.id;
                    if (!sessionId) {
                      throw new Error('Session ID not found');
                    }
                    
                    // Create Stripe checkout session with session ID
                    const response = await fetch('/api/checkout-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        sessionId: sessionId, // SECURITY: Only send opaque session ID to Stripe
                        flavors: [session.flavor || 'Custom Mix'],
                        tableId: session.tableId,
                        amount: amount, // Already in cents
                        total: amount / 100, // For display
                        sessionDuration: session.durationSecs || 2700,
                        dollarTestMode: true // Use $1 test mode for sandbox
                      })
                    });
                    
                    const data = await response.json();
                    if (data.success && data.sessionUrl) {
                      // Open Stripe checkout in new window
                      window.open(data.sessionUrl, '_blank');
                      alert(`✅ Payment checkout opened for ${session.tableId}.\n\nAfter payment confirmation, session will be ready for BOH prep → FOH delivery → Light!`);
                    } else if (data.error && data.error.includes('Stripe not configured')) {
                      alert(
                        `❌ Stripe not configured.\n\n` +
                        `To enable payment:\n` +
                        `1. Get test key: https://dashboard.stripe.com/apikeys\n` +
                        `2. Add to .env.local: STRIPE_SECRET_KEY=sk_test_...\n` +
                        `3. Restart dev server`
                      );
                    } else {
                      throw new Error(data.error || data.details || 'Failed to create checkout');
                    }
                  } catch (error) {
                    alert(`❌ Payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <DollarSign className="w-4 h-4" />
                <span>Confirm Payment</span>
              </button>
              <button
                onClick={async () => {
                  // Find sessions ready for BOH to claim prep
                  const readySessions = sessions.filter(s => {
                    const status = getSessionStatus(s);
                    return status === 'NEW' || status === 'PAID_CONFIRMED';
                  });
                  
                  if (readySessions.length === 0) {
                    alert('No sessions ready for prep');
                    return;
                  }
                  
                  // Process first ready session
                  await handleSessionAction('claim_prep', readySessions[0].id);
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <ChefHat className="w-4 h-4" />
                <span>BOH: Claim Prep</span>
              </button>
              <button
                onClick={async () => {
                  // Find sessions ready for delivery
                  const readySessions = sessions.filter(s => {
                    const status = getSessionStatus(s);
                    return status === 'READY_FOR_DELIVERY';
                  });
                  
                  if (readySessions.length === 0) {
                    alert('No sessions ready for delivery');
                    return;
                  }
                  
                  await handleSessionAction('deliver_now', readySessions[0].id);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <Truck className="w-4 h-4" />
                <span>FOH: Deliver</span>
              </button>
              <button
                onClick={async () => {
                  // Find delivered sessions ready to "light" (start active)
                  // A session can only be lit if: Payment confirmed → BOH prep → BOH ready → FOH delivered
                  const deliveredSessions = sessions.filter(s => {
                    const status = getSessionStatus(s);
                    return status === 'DELIVERED';
                  });
                  
                  if (deliveredSessions.length === 0) {
                    // Provide helpful feedback about why no sessions are ready
                    const allSessions = sessions.map(s => {
                      const status = getSessionStatus(s);
                      return { tableId: s.tableId, status };
                    });
                    
                    const statusCounts = allSessions.reduce((acc, s) => {
                      acc[s.status] = (acc[s.status] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const statusList = Object.entries(statusCounts)
                      .map(([status, count]) => `${status}: ${count}`)
                      .join(', ');
                    
                    alert(
                      `No sessions ready to light.\n\n` +
                      `A session must complete this flow to be lit:\n` +
                      `1. Payment Confirmed\n` +
                      `2. BOH Claims Prep\n` +
                      `3. BOH Marks Ready\n` +
                      `4. FOH Delivers\n` +
                      `5. Light Session 🔥\n\n` +
                      `Current session states: ${statusList || 'No sessions'}`
                    );
                    return;
                  }
                  
                  await handleSessionAction('start_active', deliveredSessions[0].id);
                  alert('🔥 Session is now LIT! Timer started.');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <Flame className="w-4 h-4" />
                <span>Light Session</span>
              </button>
              <button
                onClick={async () => {
                  if (refreshSessions) {
                    try {
                      await refreshSessions();
                    } catch (error) {
                      console.error('Failed to refresh sessions:', error);
                      window.location.reload();
                    }
                  } else {
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <Flame className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">No Active Sessions</h3>
              <p className="text-zinc-500 mb-4">Create your first session to get started</p>
              <button
                onClick={handleCreateSession}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Create Session
              </button>
            </div>
          ) : (
            sessions.map(renderSessionCard)
          )}
        </div>
      )}

      {/* BOH Tab */}
      {activeTab === 'boh' && (
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Package className="w-5 h-5 text-orange-400" />
              <span>Back of House Operations</span>
            </h3>
            <div className="space-y-4">
              {sessions.filter(s => {
                const status = getSessionStatus(s);
                return ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(status);
              }).length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <h3 className="text-lg font-medium text-zinc-300 mb-2">No BOH Sessions</h3>
                  <p className="text-zinc-500">No sessions currently in Back of House stage</p>
                </div>
              ) : (
                sessions.filter(s => {
                  const status = getSessionStatus(s);
                  return ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(status);
                }).map(renderSessionCard)
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOH Tab */}
      {activeTab === 'foh' && (
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Truck className="w-5 h-5 text-teal-400" />
              <span>Front of House Operations</span>
            </h3>
            <div className="space-y-4">
              {sessions.filter(s => {
                const status = getSessionStatus(s);
                return ['OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE'].includes(status);
              }).length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <h3 className="text-lg font-medium text-zinc-300 mb-2">No FOH Sessions</h3>
                  <p className="text-zinc-500">No sessions currently in Front of House stage</p>
                </div>
              ) : (
                sessions.filter(s => {
                  const status = getSessionStatus(s);
                  return ['OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE'].includes(status);
                }).map(renderSessionCard)
              )}
            </div>
          </div>
        </div>
      )}


      {/* Edge Cases Tab */}
      {activeTab === 'edge' && (
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Edge Cases & Escalations</span>
            </h3>
            <div className="space-y-4">
              {sessions.filter(s => {
                const status = getSessionStatus(s);
                return ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'FAILED_PAYMENT', 'VOIDED'].includes(status);
              }).length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <h3 className="text-lg font-medium text-zinc-300 mb-2">No Edge Cases</h3>
                  <p className="text-zinc-500">All sessions are operating normally</p>
                </div>
              ) : (
                sessions.filter(s => {
                  const status = getSessionStatus(s);
                  return ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'FAILED_PAYMENT', 'VOIDED'].includes(status);
                }).map(renderSessionCard)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats with Workflow States */}
      {sessions.length > 0 && (
        <div className="mt-8 space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-zinc-400">Total Sessions</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {isMounted ? sessions.length : '...'}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-400" />
                <span className="text-sm text-zinc-400">Active</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {isMounted ? sessions.filter(s => (s.status || s.state) === 'ACTIVE').length : '...'}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-zinc-400">BOH Prep</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {isMounted ? sessions.filter(s => ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(s.status || s.state)).length : '...'}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-teal-400" />
                <span className="text-sm text-zinc-400">FOH Delivery</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {isMounted ? sessions.filter(s => ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status || s.state)).length : '...'}
              </p>
            </div>
          </div>

          {/* Workflow State Breakdown */}
          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Timer className="w-5 h-5 text-purple-400" />
              <span>Workflow State Breakdown</span>
              <span className="text-xs text-zinc-400 ml-2">({userRole} View)</span>
            </h3>
            {(() => {
              const roleStatusMap: Record<string, SessionStatus[]> = {
                'BOH': ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'STAFF_HOLD', 'REMAKE'],
                'FOH': ['OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE', 'CLOSE_PENDING', 'STAFF_HOLD'],
                'MANAGER': Object.keys(STATUS_COLORS) as SessionStatus[],
                'OWNER': Object.keys(STATUS_COLORS) as SessionStatus[],
                'ADMIN': Object.keys(STATUS_COLORS) as SessionStatus[],
              };
              
              const visibleStatuses = roleStatusMap[userRole] || Object.keys(STATUS_COLORS) as SessionStatus[];
              
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {visibleStatuses.map((status) => {
                    // Calculate count only after mount to prevent hydration mismatch
                    const count = isMounted ? sessions.filter(s => {
                      const sessionStatus = s.status || s.state;
                      return sessionStatus === status;
                    }).length : 0;
                    const displayName = getSessionDisplayName(status);
                    const icon = STATE_ICONS[status];
                    const colorClass = STATUS_COLORS[status];
                    return (
                      <div key={status} className="flex items-center space-x-2 p-2 rounded bg-zinc-900/50">
                        <div className={`p-1 rounded ${colorClass}`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-300 truncate">{displayName}</p>
                          <p className="text-lg font-bold text-white">{isMounted ? count : '...'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      
      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSession(null);
        }}
        userRole={userRole}
        refreshSessions={refreshSessions}
      />
      
      {/* Guest Intelligence Modal */}
      <GuestIntelligenceModal
        isOpen={showIntelligenceModal}
        onClose={() => {
          setShowIntelligenceModal(false);
          setIntelligenceSessionId('');
        }}
        sessionId={intelligenceSessionId}
      />
      
      {/* Resolve Edge Case Modal */}
      <ResolveEdgeCaseModal
        isOpen={showResolveModal}
        onClose={() => {
          setShowResolveModal(false);
          setResolveSessionId('');
          setResolveEdgeCaseType(null);
        }}
        sessionId={resolveSessionId}
        edgeCaseType={resolveEdgeCaseType}
        onResolve={handleResolveEdgeCase}
      />
      
      {/* Session Extension Modal */}
      {extensionSessionData && (
        <SessionExtensionModal
          isOpen={showExtensionModal}
          onClose={() => {
            setShowExtensionModal(false);
            setExtensionSessionId('');
            setExtensionSessionData(null);
          }}
          sessionId={extensionSessionId}
          currentDuration={extensionSessionData.currentDuration}
          remainingTime={extensionSessionData.remainingTime}
          onExtensionComplete={() => {
            refreshSessions?.();
          }}
        />
      )}
    </div>
  );
}
