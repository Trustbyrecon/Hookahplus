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
  AlertCircle,
  TrendingUp,
  Activity,
  Star
} from 'lucide-react';
import CreateSessionModal from './CreateSessionModal';
import SessionDetailModal from './SessionDetailModal';
import GuestIntelligenceModal from './GuestIntelligenceModal';
import { mockSiteData } from '../lib/mockData';
import { 
  SessionStatus, 
  SessionAction, 
  UserRole, 
  FireSession,
  STATUS_COLORS,
  ACTION_TO_STATUS,
  STATUS_TO_STAGE,
  VALID_TRANSITIONS
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

interface SimpleFSDDesignProps {
  sessions?: any[];
  userRole?: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onSessionAction?: (action: string, sessionId: string) => void;
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
  className = ''
}: SimpleFSDDesignProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string>(userRole || 'MANAGER');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<FireSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [showIntelligenceModal, setShowIntelligenceModal] = useState(false);
  const [intelligenceSessionId, setIntelligenceSessionId] = useState<string | null>(null);
  const [realSessions, setRealSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Load sessions from app build API via proxy (handles CORS and production URLs)
  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      // Use proxy route to avoid CORS issues and handle production URLs
      const response = await fetch('/api/sessions/proxy', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform app build session format to site build format
        const transformedSessions = (data.sessions || []).map((s: any) => {
          // Map payment status to PAID_CONFIRMED if payment succeeded
          const status = (s.state === 'PENDING' && s.paymentStatus === 'succeeded') 
            ? 'PAID_CONFIRMED' 
            : (s.state || s.status || 'PENDING');
          
          return {
            id: s.id,
            session_id: s.id,
            tableId: s.tableId,
            table_id: s.tableId,
            customerName: s.customerRef || s.customerName,
            customer_name: s.customerRef || s.customerName,
            customerPhone: s.customerPhone,
            flavor: s.flavor || 'Custom Mix',
            flavorMix: s.flavorMix ? (typeof s.flavorMix === 'string' ? JSON.parse(s.flavorMix) : s.flavorMix) : [],
            amount: s.priceCents || 0,
            status: status,
            state: status,
            paymentStatus: s.paymentStatus,
            currentStage: status === 'PAID_CONFIRMED' || status === 'PREP_IN_PROGRESS' ? 'BOH' : status === 'ACTIVE' ? 'FOH' : 'BOH',
            createdAt: s.createdAt ? new Date(s.createdAt).getTime() : Date.now(),
            updatedAt: s.updatedAt ? new Date(s.updatedAt).getTime() : Date.now(),
            notes: s.tableNotes || s.notes,
            priority: s.priority || 'NORMAL',
          };
        });
        
        // Merge with existing sessions - preserve ALL local state updates
        setRealSessions(prev => {
          const merged = [...prev];
          transformedSessions.forEach((newSession: any) => {
            const existingIndex = merged.findIndex(s => 
              s.id === newSession.id || s.session_id === newSession.id
            );
            if (existingIndex >= 0) {
              const existing = merged[existingIndex];
              // Preserve local state updates - if session was updated locally, keep that status
              // Only update from backend if local status is older or same
              const localUpdatedAt = existing.updatedAt || existing.updated_at || 0;
              const backendUpdatedAt = newSession.updatedAt || newSession.updated_at || 0;
              
              if (localUpdatedAt > backendUpdatedAt) {
                // Local update is newer - preserve it, but merge other fields
                merged[existingIndex] = { 
                  ...newSession, 
                  status: existing.status,
                  state: existing.status,
                  currentStage: existing.currentStage || newSession.currentStage,
                  updatedAt: existing.updatedAt,
                };
              } else {
                // Backend is newer or same - use backend data
                merged[existingIndex] = newSession;
              }
            } else {
              merged.push(newSession);
            }
          });
          return merged;
        });
      } else {
        console.warn('[Site Build] Failed to load sessions from app build:', response.status);
      }
    } catch (error) {
      console.error('[Site Build] Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Fix hydration mismatch by only rendering time-dependent content after mount
  useEffect(() => {
    setIsMounted(true);
    
    // Load real sessions from app build
    loadSessions();
    
    // Refresh sessions every 30 seconds (less frequent to preserve local state changes)
    const refreshInterval = setInterval(() => {
      loadSessions();
    }, 30000);
    
    // Update timer every second for active sessions
    const interval = setInterval(() => {
      setTimerKey(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
    };
  }, []);


  const handleSessionAction = async (action: string, sessionId: string) => {
    // Find the session in current state
    const session = displaySessions.find((s: any) => 
      s.id === sessionId || s.session_id === sessionId
    ) || realSessions.find((s: any) => 
      s.id === sessionId || s.session_id === sessionId
    );
    
    if (!session) {
      alert('Session not found');
      return;
    }
    
    // Get current status
    const currentStatus = getSessionStatus(session);
    
    // Map action to SessionAction format
    const actionMap: Record<string, SessionAction> = {
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

    const mappedAction = actionMap[action.toLowerCase()] || action.toUpperCase() as SessionAction;
    const targetStatus = ACTION_TO_STATUS[mappedAction];
    
    // Validate transition using state machine
    if (!isValidTransition(currentStatus, targetStatus)) {
      alert(`Invalid transition: Cannot go from ${currentStatus} to ${targetStatus}.\n\nValid transitions from ${currentStatus}: ${VALID_TRANSITIONS[currentStatus].join(', ')}`);
      return;
    }
    
    // Check permissions
    const userRoleTyped = (currentRole || userRole || 'MANAGER') as UserRole;
    if (!canPerformAction(userRoleTyped, mappedAction)) {
      alert(`You don't have permission to perform ${mappedAction} as ${userRoleTyped}`);
      return;
    }
    
    // Demo mode: Apply transition locally using state machine
    console.log(`[Site Build] Action: ${action} on session: ${sessionId} (${currentStatus} → ${targetStatus})`);
    
    // Update local state immediately using state machine
    try {
      // Ensure session has all required FireSession properties
      const fireSession: FireSession = {
        id: session.id || session.session_id || sessionId,
        tableId: session.tableId || session.table_id || 'Unknown',
        customerName: session.customerName || session.customer_name || 'Guest',
        customerPhone: session.customerPhone || session.customer_phone,
        flavor: session.flavor || 'Custom Mix',
        amount: session.amount || 0,
        status: currentStatus,
        currentStage: STATUS_TO_STAGE[currentStatus],
        assignedStaff: session.assignedStaff || { boh: undefined, foh: undefined },
        createdAt: session.createdAt || session.created_at || Date.now(),
        updatedAt: session.updatedAt || session.updated_at || Date.now(),
        sessionDuration: session.sessionDuration || 45 * 60,
        coalStatus: session.coalStatus || 'active',
        refillStatus: session.refillStatus || 'none',
        notes: session.notes || '',
        edgeCase: session.edgeCase || null,
        sessionTimer: session.sessionTimer,
        sessionStartTime: session.sessionStartTime,
        bohState: session.bohState,
        guestTimerDisplay: session.guestTimerDisplay,
      };
      
      const updatedSession = nextStateWithTrust(
        fireSession,
        { 
          type: mappedAction, 
          operatorId: `site-${currentRole?.toLowerCase() || 'manager'}` 
        },
        userRoleTyped
      );
      
      // Update in realSessions
      setRealSessions(prev => prev.map(s => {
        if (s.id === sessionId || s.session_id === sessionId) {
          return {
            ...s,
            ...updatedSession,
            status: updatedSession.status,
            state: updatedSession.status,
            currentStage: updatedSession.currentStage,
            updatedAt: updatedSession.updatedAt,
            sessionTimer: updatedSession.sessionTimer,
            sessionStartTime: updatedSession.sessionStartTime,
            guestTimerDisplay: updatedSession.guestTimerDisplay,
          };
        }
        return s;
      }));
      
      // Also try to sync with backend (non-blocking)
      try {
        const response = await fetch('/api/sessions/proxy', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            action: mappedAction,
            userRole: currentRole || userRole || 'MANAGER',
            operatorId: `site-${currentRole?.toLowerCase() || 'manager'}`,
            notes: `Action ${mappedAction} executed by ${currentRole || 'MANAGER'} from site build`
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('[Site Build] Session action synced to backend');
          }
        }
      } catch (apiError) {
        // Silently fail - demo mode works offline
        console.warn('[Site Build] Failed to sync to backend, but local update succeeded');
      }
      
    } catch (stateError: any) {
      alert(`State machine error: ${stateError.message}`);
      return;
    }

    if (onSessionAction) {
      onSessionAction(action, sessionId);
    }
  };

  // Payment confirmation handler for demo flow - lightweight, no API calls
  const handleConfirmPayment = async (sessionId: string) => {
    // Demo mode: Update local session state immediately
    setRealSessions(prev => prev.map(s => {
      if (s.id === sessionId || s.session_id === sessionId) {
        return {
          ...s,
          status: 'PAID_CONFIRMED',
          state: 'PAID_CONFIRMED',
          paymentStatus: 'succeeded',
        };
      }
      return s;
    }));
    
    alert('✅ Payment confirmed! Session ready for prep. Check BOH tab.');
    
    // Switch to BOH tab to show the session
    setActiveTab('boh');
    
    // Don't refresh immediately - let the local state update persist
    // The loadSessions function already handles merging and preserving PAID_CONFIRMED status
  };

  // Cancel/Delete session handler for demo - lightweight
  const handleCancelSession = (sessionId: string) => {
    if (!confirm('Cancel this session? This will remove it from the dashboard.')) {
      return;
    }
    
    // Demo mode: Remove from local state
    setRealSessions(prev => prev.filter(s => 
      s.id !== sessionId && s.session_id !== sessionId
    ));
    
    alert('✅ Session cancelled');
  };

  // Edge case handlers
  const handleEscalate = async (sessionId: string) => {
    const reason = prompt('Escalation reason:');
    if (!reason) return;

    try {
      // Use proxy endpoint to forward to app build
      const response = await fetch('/api/sessions/proxy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'PUT_ON_HOLD', // Escalate by putting on hold
          userRole: currentRole || userRole || 'MANAGER',
          operatorId: `site-${currentRole?.toLowerCase() || 'manager'}`,
          notes: `ESCALATED: ${reason}`,
          edgeCase: 'ESCALATION',
          edgeNote: reason,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { details: responseText || `HTTP ${response.status}` };
        }
        throw new Error(error.details || error.error || 'Failed to escalate session');
      }

      const result = await response.json();
      if (result.success) {
        alert('Session escalated successfully');
        window.location.reload();
      } else {
        throw new Error(result.error || result.details || 'Failed to escalate');
      }
    } catch (error: any) {
      alert(`Failed to escalate: ${error.message}`);
    }
  };

  const handleResolve = async (sessionId: string) => {
    const resolutionNotes = prompt('Resolution notes:');
    if (!resolutionNotes) return;

    try {
      // Use proxy endpoint to forward to app build (same as handleSessionAction)
      const response = await fetch('/api/sessions/proxy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'RESOLVE_HOLD', // Use standard action
          userRole: currentRole || userRole || 'MANAGER',
          operatorId: `site-${currentRole?.toLowerCase() || 'manager'}`,
          notes: `Resolution: ${resolutionNotes}`,
          edgeNote: resolutionNotes,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { details: responseText || `HTTP ${response.status}` };
        }
        throw new Error(error.details || error.error || 'Failed to resolve session');
      }

      const result = await response.json();
      if (result.success) {
        alert('Session resolved successfully');
        window.location.reload();
      } else {
        throw new Error(result.error || result.details || 'Failed to resolve');
      }
    } catch (error: any) {
      alert(`Failed to resolve: ${error.message}`);
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

  // Combine real sessions with prop sessions, fallback to mock only if no real data
  // Only use mock data after mount to prevent hydration mismatch
  const displaySessions = isMounted 
    ? (realSessions.length > 0 
        ? [...realSessions, ...(sessions || [])] 
        : sessions.length > 0 
          ? sessions 
          : mockSiteData.sessions)
    : []; // Empty array during SSR to prevent hydration mismatch

  // Filter sessions by role permissions
  const getFilteredSessions = () => {
    if (!isMounted) return []; // Return empty during SSR
    
    const allSessions = displaySessions;
    
    // Role-based filtering
    if (currentRole === 'BOH') {
      return allSessions.filter((s: any) => 
        ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'STOCK_BLOCKED', 'REMAKE'].includes(s.status)
      );
    } else if (currentRole === 'FOH') {
      return allSessions.filter((s: any) => 
        ['OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE', 'STAFF_HOLD', 'REFUND_REQUESTED'].includes(s.status)
      );
    } else if (currentRole === 'MANAGER' || currentRole === 'OWNER') {
      return allSessions; // See all sessions
    }
    return allSessions;
  };

  const roleFilteredSessions = getFilteredSessions();

  // Select up to 5 curated sessions for overview - exclude PAID_CONFIRMED (those go to BOH)
  const selectCuratedSessions = () => {
    // Filter out PAID_CONFIRMED and BOH/FOH workflow sessions - they belong in their respective tabs
    const overviewSessions = roleFilteredSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      // Exclude BOH workflow sessions (they belong in BOH tab)
      const isBohSession = ['PAID_CONFIRMED', 'PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(status);
      // Exclude FOH workflow sessions (they belong in FOH tab)
      const isFohSession = ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status);
      // Exclude edge cases (they belong in Edge Cases tab)
      const isEdgeCase = ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'VOIDED'].includes(status);
      // Only show NEW/PENDING (awaiting payment), ACTIVE (customer stage), and CLOSED (completed)
      return !isBohSession && !isFohSession && !isEdgeCase;
    });
    
    // Helper functions to check session status
    const isUrgent = (s: any) => {
      const status = getSessionStatus(s);
      return ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED'].includes(status);
    };
    
    const needsAttention = (s: any) => {
      const status = getSessionStatus(s);
      return ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status);
    };
    
    const isActive = (s: any) => {
      const status = getSessionStatus(s);
      return status === 'ACTIVE';
    };
    
    const isNew = (s: any) => {
      const status = getSessionStatus(s);
      return status === 'NEW';
    };
    
    // Find sessions from each category
    const urgentSession = overviewSessions.find((s: any) => isUrgent(s));
    const needsAttentionSession = overviewSessions.find((s: any) => needsAttention(s) && !isUrgent(s));
    const activeSession = overviewSessions.find((s: any) => isActive(s) && !isUrgent(s) && !needsAttention(s));
    const newSessions = overviewSessions.filter((s: any) => isNew(s) && !isUrgent(s) && !needsAttention(s) && !isActive(s));
    
    // Build curated list
    const curated: any[] = [];
    if (urgentSession) curated.push(urgentSession);
    if (needsAttentionSession) curated.push(needsAttentionSession);
    if (activeSession) curated.push(activeSession);
    // Add new sessions (up to 2 more to reach 5)
    curated.push(...newSessions.slice(0, 5 - curated.length));
    
    // If we still don't have 5, fill with any remaining
    if (curated.length < 5) {
      const remaining = overviewSessions.filter((s: any) => !curated.includes(s));
      curated.push(...remaining.slice(0, 5 - curated.length));
    }
    
    // Return up to 5 sessions
    return curated.slice(0, 5);
  };

  // Only calculate sessions after mount to prevent hydration mismatch
  const displayedSessions = isMounted ? selectCuratedSessions() : [];
  
  // Get all sessions for BOH/FOH tabs (not just curated 3)
  // Define these BEFORE getFilteredSessionsForTab to avoid ReferenceError
  const getAllBohSessions = () => {
    if (!isMounted) return [];
    return roleFilteredSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return ['PAID_CONFIRMED', 'PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'STOCK_BLOCKED', 'REMAKE'].includes(status);
    });
  };

  const getAllFohSessions = () => {
    if (!isMounted) return [];
    return roleFilteredSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return ['OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE', 'STAFF_HOLD', 'REFUND_REQUESTED'].includes(status);
    });
  };
  
  // Filter sessions based on active tab
  const getFilteredSessionsForTab = () => {
    if (!isMounted) return [];
    
    switch (activeTab) {
      case 'boh':
        return getAllBohSessions();
      case 'foh':
        return getAllFohSessions();
      case 'edge':
        return roleFilteredSessions.filter((s: any) => {
          const status = getSessionStatus(s);
          return ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'VOIDED'].includes(status);
        });
      case 'overview':
      default:
        return displayedSessions; // Show curated 5 for overview
    }
  };
  
  const filteredSessionsRaw = getFilteredSessionsForTab();
  
  // Sort sessions: VIP first, then by creation time/status
  const filteredSessions = [...filteredSessionsRaw].sort((a: any, b: any) => {
    const aPriority = a.priority || 'NORMAL';
    const bPriority = b.priority || 'NORMAL';
    
    // VIP first
    if (aPriority === 'VIP' && bPriority !== 'VIP') return -1;
    if (aPriority !== 'VIP' && bPriority === 'VIP') return 1;
    
    // Then by creation time or status
    const aTime = a.createdAt || a.created_at || 0;
    const bTime = b.createdAt || b.created_at || 0;
    return aTime - bTime;
  });

  // Calculate metrics for dashboard - use all sessions
  const calculateMetrics = () => {
    const allSessions = roleFilteredSessions;
    
    // Active sessions (ACTIVE status)
    const activeSessions = allSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return status === 'ACTIVE';
    });
    
    // Completed sessions
    const completedSessions = allSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return status === 'CLOSED';
    });
    
    // Calculate average prep time from completed prep sessions
    // Prep time = time from PAID_CONFIRMED to READY_FOR_DELIVERY
    const completedPrepSessions = allSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE', 'CLOSED'].includes(status);
    });
    
    let avgPrepTime = 0;
    if (completedPrepSessions.length > 0) {
      const prepTimes = completedPrepSessions
        .map((s: any) => {
          const createdAt = s.createdAt || s.created_at || Date.now();
          const updatedAt = s.updatedAt || s.updated_at || Date.now();
          // Estimate: if status is READY_FOR_DELIVERY or later, prep is done
          // Use a reasonable estimate based on time elapsed
          const elapsed = (updatedAt - createdAt) / 1000 / 60; // minutes
          return elapsed > 0 ? Math.min(elapsed, 30) : 0; // Cap at 30 minutes
        })
        .filter(t => t > 0);
      
      if (prepTimes.length > 0) {
        avgPrepTime = Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length);
      }
    }
    
    // If no completed sessions, use current prep sessions for estimate
    if (avgPrepTime === 0) {
      const currentPrepSessions = allSessions.filter((s: any) => {
        const status = getSessionStatus(s);
        return ['PREP_IN_PROGRESS', 'HEAT_UP'].includes(status);
      });
      if (currentPrepSessions.length > 0) {
        avgPrepTime = 8; // Default estimate
      }
    }
    
    // Calculate completion rate
    const completionRate = allSessions.length > 0 
      ? Math.round((completedSessions.length / allSessions.length) * 100) 
      : 0;
    
    return {
      active: activeSessions.length,
      avgPrepTime,
      completionRate,
      total: allSessions.length
    };
  };

  const metrics = calculateMetrics();

  // Calculate session counts per tab
  // Only calculate after mount to prevent hydration mismatch
  const getTabCounts = () => {
    if (!isMounted) {
      return {
        overview: 0,
        boh: 0,
        foh: 0,
        edge: 0,
      };
    }
    
    const bohSessions = getAllBohSessions();
    const fohSessions = getAllFohSessions();
    const edgeSessions = roleFilteredSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'VOIDED'].includes(status);
    });
    return {
      overview: roleFilteredSessions.length, // All sessions for overview
      boh: bohSessions.length,
      foh: fohSessions.length,
      edge: edgeSessions.length
    };
  };

  const tabCounts = getTabCounts();

  const handleCreateSessionSave = async (sessionData: any) => {
    // Create session via proxy route (handles CORS and production URLs)
    try {
      const flavorMix = sessionData.addons && sessionData.addons.length > 0 
        ? sessionData.addons 
        : ['Custom Mix'];
      
      const response = await fetch('/api/sessions/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: sessionData.table,
          customerName: sessionData.customerName,
          customerPhone: sessionData.customerPhone || '',
          flavor: flavorMix.join(' + '),
          amount: Math.round(sessionData.basePrice * 100) + (sessionData.addons?.reduce((sum: number, addon: string) => {
            const item = [{ id: 'mint', price: 2.50 }, { id: 'mango', price: 2.00 }, { id: 'strawberry', price: 2.00 }, { id: 'peach', price: 2.50 }].find(a => a.id === addon);
            return sum + (item?.price || 0) * 100;
          }, 0) || 0),
          source: 'WALK_IN',
          notes: `Walk-in customer`,
          loungeId: 'default-lounge',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create session' }));
        throw new Error(errorData.error || 'Failed to create session');
      }

      const result = await response.json();
      
      // Refresh sessions to show new session
      await loadSessions();
      
      // Switch to overview tab
      setActiveTab('overview');
      
      alert(`Session created successfully! Session ID: ${result.session?.id || result.id || 'N/A'}`);
      setShowCreateModal(false);
    } catch (error: any) {
      alert(`Failed to create session: ${error.message}`);
    }
  };

  return (
    <div className={className}>
      {/* Enhanced Header */}
      <div className="mb-8 bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 rounded-xl p-6 border border-zinc-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                <Flame className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Control every session. Turn every table faster.
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Real-time visibility into prep, delivery, and active sessions
                </p>
              </div>
            </div>
            
            {/* Benefit Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-lg px-4 py-2 mt-4">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-400">↑ 22% faster table turns, ↓ 35% order time</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Role Selector */}
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="FOH">FOH</option>
              <option value="BOH">BOH</option>
            </select>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg transition-all shadow-lg shadow-teal-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">Active Sessions</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.active}</div>
          <div className="text-xs text-zinc-500 mt-1">Currently running</div>
        </div>
        
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">Avg Prep Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.avgPrepTime}m</div>
          <div className="text-xs text-zinc-500 mt-1">BOH average</div>
        </div>
        
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">Completion Rate</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.completionRate}%</div>
          <div className="text-xs text-zinc-500 mt-1">Sessions completed</div>
        </div>
        
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">Total Sessions</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.total}</div>
          <div className="text-xs text-zinc-500 mt-1">All time</div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateSessionSave}
        />
      )}

      {/* Enhanced Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { 
            id: 'overview', 
            label: 'OVERVIEW', 
            icon: '📊',
            description: 'All sessions',
            count: tabCounts.overview
          },
          { 
            id: 'boh', 
            label: 'BOH', 
            icon: '👨‍🍳',
            description: 'Prep & heat',
            count: tabCounts.boh,
            color: 'orange'
          },
          { 
            id: 'foh', 
            label: 'FOH', 
            icon: '👨‍💼',
            description: 'Delivery & active',
            count: tabCounts.foh,
            color: 'blue'
          },
          { 
            id: 'edge', 
            label: 'EDGE CASES', 
            icon: '⚠️',
            description: 'Requires attention',
            count: tabCounts.edge,
            color: 'yellow'
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 relative ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-zinc-700 text-zinc-300'
              }`}>
                {tab.count}
              </span>
            )}
            {tab.description && (
              <span className="hidden md:inline-block text-xs ml-2 text-zinc-500">
                {tab.description}
              </span>
            )}
          </button>
        ))}
      </div>


      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
        {/* New Session Placeholder */}
        <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-2 border-dashed border-teal-500/50 rounded-lg p-6 cursor-pointer hover:border-teal-500 transition-all"
          onClick={() => setShowCreateModal(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Create New Session</h3>
                <p className="text-sm text-zinc-400">Click to start a new session that will appear in Overview</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-teal-400" />
          </div>
        </div>
        
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 rounded-xl border border-zinc-700">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
              <Flame className="w-10 h-10 text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Start Your First Session</h3>
            <p className="text-zinc-400 mb-2 max-w-md mx-auto">
              Create a session to see real-time tracking, automated workflows, and AI-powered insights in action.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 mb-8">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Zap className="w-4 h-4 text-teal-400" />
                <span>Real-time tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Brain className="w-4 h-4 text-teal-400" />
                <span>AI-powered insights</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Automated workflows</span>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg transition-all shadow-lg shadow-teal-500/20 font-semibold flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create Your First Session
            </button>
          </div>
        ) : (
          filteredSessions.map((session: any) => {
            const sessionStatus = getSessionStatus(session);
            const sessionStage = getSessionStage(session);
            const availableActions = getAvailableActions(session);
            const sessionId = session.id || session.session_id;
            const displayName = getSessionDisplayName(sessionStatus);
            const statusColor = STATUS_COLORS[sessionStatus];
            const stateIcon = STATE_ICONS[sessionStatus];

            // Calculate priority and time-to-action
            const isUrgent = ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED'].includes(sessionStatus);
            const isActive = sessionStatus === 'ACTIVE';
            const needsAttention = ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(sessionStatus);
            
            // Calculate time in current state (mock - would use actual timestamps)
            const timeInState = session.createdAt 
              ? Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 60000)
              : Math.floor(Math.random() * 30 + 5);
            
            return (
              <div
                key={sessionId}
                className={`bg-zinc-800/50 border rounded-lg p-4 hover:bg-zinc-800/70 transition-all cursor-pointer ${
                  isUrgent 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : needsAttention
                    ? 'border-yellow-500/50 bg-yellow-500/5'
                    : 'border-zinc-700'
                }`}
                onClick={() => {
                  setSelectedSession(session as FireSession);
                  setIsModalOpen(true);
                }}
              >
                {/* Session Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${statusColor} flex-shrink-0`}>
                      {stateIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">
                          {session.table_id || session.tableId || 'Table Unknown'}
                        </h3>
                        {(session.priority === 'VIP' || session.priority === 'vip') && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            VIP
                          </span>
                        )}
                        {isUrgent && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            URGENT
                          </span>
                        )}
                        {needsAttention && !isUrgent && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                            Needs Action
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mb-1">
                        {session.customer_name || session.customerName || 'Guest Customer'}
                      </p>
                      {session.flavorMix && (
                        <p className="text-xs text-zinc-500">
                          {session.flavorMix}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColor}`}>
                      {displayName}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-zinc-500">
                        {sessionStage}
                      </span>
                      {timeInState > 0 && (
                        <span className="text-xs text-zinc-600">
                          {timeInState}m in state
                        </span>
                      )}
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

                {/* Timer Display */}
                {session.sessionTimer && (
                  <div className="mb-3 p-2 bg-zinc-900/30 rounded text-xs text-zinc-300">
                    <div className="flex items-center space-x-1 mb-1">
                      <Timer className="w-3 h-3" />
                      <span className="font-medium">Session Timer:</span>
                    </div>
                    <p className="text-lg font-mono">
                      {isMounted ? formatDuration(calculateRemainingTime(session)) : '--:--'}
                    </p>
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

                {/* Action Buttons - Show payment confirmation for NEW/PAID_CONFIRMED sessions */}
                <div className="mb-3 flex gap-2">
                  {sessionStatus === 'NEW' || sessionStatus === 'PAID_CONFIRMED' ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmPayment(sessionId);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 flex-1"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Confirm Payment</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelSession(sessionId);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                        title="Cancel session"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIntelligenceSessionId(sessionId);
                          setShowIntelligenceModal(true);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 flex-1"
                      >
                        <Brain className="w-4 h-4" />
                        <span>Intelligence</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session as FireSession);
                          setIsModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white"
                      >
                        <Info className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelSession(sessionId);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                        title="Cancel session"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

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
          })
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
            <div className="space-y-3">
              {getAllBohSessions().map((session: any) => {
                const sessionStatus = getSessionStatus(session);
                const availableActions = getAvailableActions(session);
                const sessionId = session.id || session.session_id;
                const displayName = getSessionDisplayName(sessionStatus);
                const statusColor = STATUS_COLORS[sessionStatus];
                
                // BOH actions - ordered by workflow: Claim Prep → Heat Up → Ready for Delivery → (BOH can deliver or FOH delivers)
                // Filter and order actions based on current status
                const orderedBohActions = (() => {
                  const allBohActions = availableActions.filter(action => 
                    ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED'].includes(action)
                  );
                  
                  // Order by workflow sequence
                  const actionOrder: SessionAction[] = ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED'];
                  return actionOrder.filter(action => allBohActions.includes(action));
                })();
                
                return (
                  <div key={sessionId} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{session.tableId || session.table_id || 'Unknown Table'}</h4>
                          {(session.priority === 'VIP' || session.priority === 'vip') && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
                              <Star className="w-3 h-3 inline mr-1" />
                              VIP
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 font-medium">
                          {(() => {
                            // Format flavor/order display - check flavor first (it's the formatted string)
                            if (session.flavor && session.flavor !== 'Custom Mix') {
                              return `Flavor: ${session.flavor}`;
                            }
                            
                            // Then check flavorMix
                            if (session.flavorMix) {
                              if (Array.isArray(session.flavorMix)) {
                                return session.flavorMix.length > 0 
                                  ? `Flavor: ${session.flavorMix.join(' + ')}`
                                  : 'Flavor: Custom Mix';
                              }
                              if (typeof session.flavorMix === 'string') {
                                try {
                                  const parsed = JSON.parse(session.flavorMix);
                                  if (Array.isArray(parsed) && parsed.length > 0) {
                                    return `Flavor: ${parsed.join(' + ')}`;
                                  }
                                  return parsed ? `Flavor: ${parsed}` : 'Flavor: Custom Mix';
                                } catch {
                                  return session.flavorMix ? `Flavor: ${session.flavorMix}` : 'Flavor: Custom Mix';
                                }
                              }
                            }
                            return session.flavor ? `Flavor: ${session.flavor}` : 'Flavor: Custom Mix';
                          })()}
                        </p>
                        {session.customerName && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {session.customerName}
                            {session.customerPhone && ` • ${session.customerPhone}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${statusColor}`}>{displayName}</p>
                        <p className="text-xs text-zinc-500">BOH Stage</p>
                      </div>
                    </div>
                    
                    {/* Action Controls - Workflow buttons in order */}
                    {orderedBohActions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-700">
                        <div className="flex flex-wrap gap-2">
                          {orderedBohActions.map((action) => {
                            const canPerform = canUserPerformAction(action, currentRole);
                            // Custom label for delivery action when BOH is notifying FOH
                            const isNotifyFoh =
                              action === 'DELIVER_NOW' &&
                              sessionStatus === 'READY_FOR_DELIVERY';
                            const label = isNotifyFoh
                              ? 'Notify FOH'
                              : action.replace(/_/g, ' ');

                            return (
                              <button
                                key={action}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSessionAction(action.toLowerCase(), sessionId);
                                }}
                                disabled={!canPerform}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                                  canPerform
                                    ? ACTION_COLORS[action] || 'bg-teal-600 hover:bg-teal-700 text-white'
                                    : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                }`}
                              >
                                {ACTION_ICONS[action]}
                                <span>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                        {sessionStatus === 'READY_FOR_DELIVERY' && (
                          <p className="text-xs text-zinc-500 mt-2">
                            💡 Independent operators: You can deliver yourself or have FOH deliver
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {getAllBohSessions().length === 0 && (
                <p className="text-zinc-400 text-center py-8">No BOH sessions in progress</p>
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
            <div className="space-y-3">
              {getAllFohSessions().map((session: any) => {
                const sessionStatus = getSessionStatus(session);
                const availableActions = getAvailableActions(session);
                const sessionId = session.id || session.session_id;
                const displayName = getSessionDisplayName(sessionStatus);
                const statusColor = STATUS_COLORS[sessionStatus];
                
                // FOH actions - ordered by workflow
                const orderedFohActions = (() => {
                  const allFohActions = availableActions.filter(action => 
                    ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'REQUEST_REFILL', 'CLOSE_SESSION', 'PAUSE_SESSION', 'RESUME_SESSION'].includes(action)
                  );
                  
                  // Order by workflow sequence
                  const actionOrder: SessionAction[] = ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'PAUSE_SESSION', 'RESUME_SESSION', 'REQUEST_REFILL', 'CLOSE_SESSION'];
                  return actionOrder.filter(action => allFohActions.includes(action));
                })();
                
                return (
                  <div key={sessionId} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{session.tableId || session.table_id || 'Unknown Table'}</h4>
                          {(session.priority === 'VIP' || session.priority === 'vip') && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
                              <Star className="w-3 h-3 inline mr-1" />
                              VIP
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 font-medium">
                          {(() => {
                            // Format flavor/order display
                            if (session.flavor && session.flavor !== 'Custom Mix') {
                              return `Flavor: ${session.flavor}`;
                            }
                            if (session.flavorMix) {
                              if (Array.isArray(session.flavorMix)) {
                                return session.flavorMix.length > 0 
                                  ? `Flavor: ${session.flavorMix.join(' + ')}`
                                  : 'Flavor: Custom Mix';
                              }
                              if (typeof session.flavorMix === 'string') {
                                try {
                                  const parsed = JSON.parse(session.flavorMix);
                                  if (Array.isArray(parsed) && parsed.length > 0) {
                                    return `Flavor: ${parsed.join(' + ')}`;
                                  }
                                  return parsed ? `Flavor: ${parsed}` : 'Flavor: Custom Mix';
                                } catch {
                                  return session.flavorMix ? `Flavor: ${session.flavorMix}` : 'Flavor: Custom Mix';
                                }
                              }
                            }
                            return session.flavor ? `Flavor: ${session.flavor}` : 'Flavor: Custom Mix';
                          })()}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {session.customerName || session.customer_name || 'Guest Customer'}
                          {session.customerPhone && ` • ${session.customerPhone}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${statusColor}`}>{displayName}</p>
                        <p className="text-xs text-zinc-500">FOH Stage</p>
                      </div>
                    </div>
                    
                    {/* Action Controls - Workflow buttons in order */}
                    {orderedFohActions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-700">
                        <div className="flex flex-wrap gap-2">
                          {orderedFohActions.map((action) => {
                          const canPerform = canUserPerformAction(action, currentRole);
                          return (
                            <button
                              key={action}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSessionAction(action.toLowerCase(), sessionId);
                              }}
                              disabled={!canPerform}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                                canPerform
                                  ? ACTION_COLORS[action] || 'bg-teal-600 hover:bg-teal-700 text-white'
                                  : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                              }`}
                            >
                              {ACTION_ICONS[action]}
                              <span>{action.replace(/_/g, ' ')}</span>
                            </button>
                          );
                        })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {getAllFohSessions().length === 0 && (
                <p className="text-zinc-400 text-center py-8">No FOH sessions in progress</p>
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
            <div className="space-y-3">
              {filteredSessions.filter((s: any) => ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'FAILED_PAYMENT'].includes(s.status || s.state)).map((session: any) => (
                <div key={session.id} className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{session.tableId || 'Unknown Table'}</h4>
                        {(session.priority === 'VIP' || session.priority === 'vip') && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400">{session.customerName || 'Guest Customer'}</p>
                      {session.notes && (
                        <p className="text-sm text-yellow-400 mt-1">📝 {session.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-400 font-medium">{session.status || session.state}</p>
                      <p className="text-xs text-zinc-500">Requires Attention</p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button 
                      onClick={() => handleEscalate(session.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                    >
                      Escalate
                    </button>
                    <button 
                      onClick={() => handleResolve(session.id)}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
              {filteredSessions.filter((s: any) => ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'FAILED_PAYMENT'].includes(s.status || s.state)).length === 0 && (
                <p className="text-zinc-400 text-center py-8">No edge cases requiring attention</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats with Workflow States */}
      {filteredSessions.length > 0 && (
        <div className="mt-8 space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-zinc-400">Total Sessions</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{filteredSessions.length}</p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-400" />
                <span className="text-sm text-zinc-400">Active</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {filteredSessions.filter((s: any) => (s.status || s.state) === 'ACTIVE').length}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-zinc-400">BOH Prep</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {filteredSessions.filter((s: any) => ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(s.status || s.state)).length}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-teal-400" />
                <span className="text-sm text-zinc-400">FOH Delivery</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {filteredSessions.filter((s: any) => ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status || s.state)).length}
              </p>
            </div>
          </div>

          {/* Workflow State Breakdown */}
          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Timer className="w-5 h-5 text-purple-400" />
              <span>Workflow State Breakdown</span>
              <span className="text-xs text-zinc-400 ml-2">({currentRole} View)</span>
            </h3>
            {(() => {
              const roleStatusMap: Record<string, SessionStatus[]> = {
                'BOH': ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'STAFF_HOLD', 'REMAKE'],
                'FOH': ['OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE', 'CLOSE_PENDING', 'STAFF_HOLD'],
                'MANAGER': Object.keys(STATUS_COLORS) as SessionStatus[],
                'OWNER': Object.keys(STATUS_COLORS) as SessionStatus[],
                'ADMIN': Object.keys(STATUS_COLORS) as SessionStatus[],
              };
              
              const visibleStatuses = roleStatusMap[currentRole] || Object.keys(STATUS_COLORS) as SessionStatus[];
              
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {visibleStatuses.map((status) => {
                    const count = filteredSessions.filter((s: any) => (s.status || s.state) === status).length;
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
                          <p className="text-lg font-bold text-white">{count}</p>
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
      />

      {/* Intelligence Modal */}
      {showIntelligenceModal && intelligenceSessionId && (
        <GuestIntelligenceModal
          sessionId={intelligenceSessionId}
          isOpen={showIntelligenceModal}
          onClose={() => {
            setShowIntelligenceModal(false);
            setIntelligenceSessionId(null);
          }}
        />
      )}

    </div>
  );
}
