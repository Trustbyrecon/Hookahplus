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
  TrackerStage,
  STATUS_COLORS,
  ACTION_TO_STATUS,
  STATUS_TO_STAGE,
  STATUS_TO_TRACKER_STAGE
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
import { getSessionHealth } from '../lib/session-utils';
import { calculateSingleSessionTrustScore, getTrustScoreColor } from '../lib/trustScoring';
import { getFeatureFlags } from '../lib/feature-flags';
import SessionDetailModal from './SessionDetailModal';
import GuestIntelligenceModal from './GuestIntelligenceModal';
import ResolveEdgeCaseModal from './ResolveEdgeCaseModal';
import SessionExtensionModal from './SessionExtensionModal';
import CloseSessionModal from './CloseSessionModal';
import CodigoFloorPlan from './CodigoFloorPlan';
import { LayoutGrid } from 'lucide-react';

interface SimpleFSDDesignProps {
  sessions?: any[];
  userRole?: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onSessionAction?: (sessionId: string, action: string) => void;
  onCreateSession?: (sessionData: any) => Promise<string | undefined>;
  refreshSessions?: () => void | Promise<void>;
  className?: string;
  isDemoMode?: boolean;
  scopeLabel?: string;
  loungeId?: string;
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
  onCreateSession,
  refreshSessions,
  className = '',
  isDemoMode = false,
  scopeLabel,
  loungeId
}: SimpleFSDDesignProps) {
  // Initialize feature flags with defaults to avoid hydration mismatch
  const [featureFlags, setFeatureFlags] = useState({
    showTestSessionButton: false,
    isDevelopment: false,
    firstLightCompleted: false,
    firstLightFocus: false,
    metricsEnabled: false,
    alphaStabilityActive: false,
    isProduction: false,
    isDemoMode: false,
    showFirstLightBanner: false,
    showFirstLightHealthCard: false,
    showFirstLightChecklist: false,
    showClearOldSessions: false,
    showFirstLightFocusToggle: false,
    showAlphaStabilityBanners: false,
    showFlywheelBanner: false,
  });
  
  // Load feature flags after mount to avoid hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFeatureFlags(getFeatureFlags());
    }
  }, []);
  
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
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeSessionId, setCloseSessionId] = useState<string>('');
  
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
    
    // Check if we're in demo mode OR if this is a demo session (starts with 'demo-session-')
    const isDemoMode = typeof window !== 'undefined' && 
      window.location &&
      new URLSearchParams(window.location.search).get('mode') === 'demo';
    const isDemoSession = sessionId.startsWith('demo-session-');

    // In demo mode OR for demo sessions, use the callback (which updates in-memory state) instead of API
    if ((isDemoMode || isDemoSession) && onSessionAction) {
      console.log(`[Demo Mode] 🎭 Using callback for action: ${action} on session: ${sessionId}`);
      try {
        await onSessionAction(sessionId, action);
        
        // Show success message for demo mode (same as API path)
        const actionMap: Record<string, string> = {
          'claim_prep': 'CLAIM_PREP',
          'heat_up': 'HEAT_UP',
          'ready_for_delivery': 'READY_FOR_DELIVERY',
          'deliver_now': 'DELIVER_NOW',
          'mark_delivered': 'MARK_DELIVERED',
          'start_active': 'START_ACTIVE',
        };
        const mappedAction = actionMap[action.toLowerCase()] || action.toUpperCase();
        
        const successMessages: Record<string, string> = {
          'CLAIM_PREP': '✅ Prep claimed successfully! BOH is now preparing the hookah.',
          'HEAT_UP': '🔥 Coals heating... Final preparation phase in progress.',
          'READY_FOR_DELIVERY': '✅ Hookah ready! Awaiting FOH pickup.',
          'DELIVER_NOW': '🚚 Out for delivery! FOH transporting hookah to table.',
          'MARK_DELIVERED': '✅ Delivered to table! Hookah setup complete.',
          'START_ACTIVE': '🔥 Session is LIT! Timer started. Customer can now enjoy.',
        };
        
        const successMessage = successMessages[mappedAction] || `✅ ${mappedAction.replace(/_/g, ' ')} successful!`;
        
        if (successMessage) {
          // Show success notification (non-blocking)
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
          notification.style.whiteSpace = 'pre-line';
          notification.textContent = successMessage;
          document.body.appendChild(notification);
          
          // Remove after 3 seconds
          setTimeout(() => {
            notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => notification.remove(), 300);
          }, 3000);
        }
        
        if (refreshSessions) {
          await refreshSessions();
        }
        return;
      } catch (error) {
        console.error('[Demo Mode] Error in callback:', error);
        alert(`Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }
    
    // If it's a demo session but no callback, warn and return early
    if (isDemoSession && !onSessionAction) {
      console.warn('[Demo Mode] Demo session action attempted but no callback provided:', { action, sessionId });
      alert('Demo session actions require demo mode. Please access via /demo/[slug] or with ?mode=demo');
      return;
    }
    
    // Special handling for RESOLVE_HOLD - show modal instead of direct API call
    if (action.toLowerCase() === 'resolve_hold' || action === 'RESOLVE_HOLD') {
      const session = sessions.find(s => s.id === sessionId);
      setResolveSessionId(sessionId);
      setResolveEdgeCaseType(session?.edgeCase || null);
      setShowResolveModal(true);
      return;
    }

    // Demo mode: refill and flavor upsell handled in-memory by onSessionAction
    if (isDemoMode && (action.toLowerCase() === 'request_refill' || action === 'REQUEST_REFILL' || action.toLowerCase() === 'complete_refill' || action === 'COMPLETE_REFILL' || action.toLowerCase() === 'request_flavor_bowl')) {
      onSessionAction?.(sessionId, action.toLowerCase());
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
            operatorId: `foh-${userRole.toLowerCase()}`,
            refillType: 'coal'
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
        } else if (result.details === 'Refill already requested' || result.error === 'Refill already requested') {
          // Idempotent: refill already in queue
          alert('Refill already requested — BOH is on it.');
          if (refreshSessions) await refreshSessions();
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

    // Flavor upsell (non-demo): POST refill with refillType flavor
    if (action.toLowerCase() === 'request_flavor_bowl') {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/refill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userRole,
            operatorId: `foh-${userRole.toLowerCase()}`,
            refillType: 'flavor'
          })
        });
        const result = await response.json();
        if (result.success) {
          alert('Flavor bowl requested! BOH will prepare new bowl.');
          if (refreshSessions) await refreshSessions();
        } else if (result.details === 'Refill already requested' || result.error === 'Refill already requested') {
          alert('Refill already requested — BOH is on it.');
          if (refreshSessions) await refreshSessions();
        } else {
          throw new Error(result.details || result.error || 'Failed to request flavor bowl');
        }
        return;
      } catch (error) {
        console.error('Error requesting flavor bowl:', error);
        alert(`Failed to request flavor bowl: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      // Close session is special: optional staff note capture, non-blocking
      if (mappedAction === 'CLOSE_SESSION') {
        setCloseSessionId(sessionId);
        setShowCloseModal(true);
        return;
      }
      
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
        const errorMessage = errorData.details || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('[SimpleFSDDesign] API Error:', {
          status: response.status,
          error: errorData,
          sessionId,
          action: mappedAction
        });
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        console.log('Session action successful:', result);
        
        // Immediately refresh sessions to show updated state before showing success message
        if (refreshSessions) {
          try {
            await refreshSessions();
          } catch (refreshError) {
            console.warn('Failed to refresh sessions after action, will retry:', refreshError);
          }
        }
        
        // Show success feedback based on action
        const successMessages: Record<string, string> = {
          'CLAIM_PREP': '✅ Prep claimed successfully! BOH is now preparing the hookah.',
          'HEAT_UP': '🔥 Coals heating... Final preparation phase in progress.',
          'READY_FOR_DELIVERY': '✅ Hookah ready! Awaiting FOH pickup.',
          'DELIVER_NOW': '🚚 Out for delivery! FOH transporting hookah to table.',
          'MARK_DELIVERED': '✅ Delivered to table! Hookah setup complete.',
          'START_ACTIVE': '🔥 Session is LIT! Timer started. Customer can now enjoy.',
          'PAUSE_SESSION': '⏸️ Session paused.',
          'RESUME_SESSION': '▶️ Session resumed.',
          'CLOSE_SESSION': '✅ Session closed.',
          'PUT_ON_HOLD': '⏸️ Session put on hold.',
          'RESOLVE_HOLD': '✅ Hold resolved. Session resuming.',
        };
        
        let successMessage = successMessages[mappedAction] || `✅ ${mappedAction.replace(/_/g, ' ')} successful!`;
        
        // Add next action suggestion if available
        if (result.primaryNextAction && result.nextActionDescription) {
          const nextActionName = result.primaryNextAction.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
          successMessage += `\n\nNext: ${nextActionName} - ${result.nextActionDescription}`;
        }
        
        if (successMessage) {
          // Show brief success notification (non-blocking)
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
          notification.style.whiteSpace = 'pre-line';
          notification.textContent = successMessage;
          document.body.appendChild(notification);
          
          // Remove after 5 seconds (longer if next action is shown)
          setTimeout(() => {
            notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => notification.remove(), 300);
          }, result.primaryNextAction ? 5000 : 3000);
        }
        
        // Auto-scroll to next action button if primary next action exists
        if (result.primaryNextAction) {
          setTimeout(() => {
            const nextActionButton = document.querySelector(`[data-action="${result.primaryNextAction}"]`);
            if (nextActionButton) {
              nextActionButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight the button briefly
              nextActionButton.classList.add('ring-2', 'ring-teal-400', 'ring-opacity-75');
              setTimeout(() => {
                nextActionButton.classList.remove('ring-2', 'ring-teal-400', 'ring-opacity-75');
              }, 2000);
            }
          }, 500);
        }
        
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
          // Show the detailed error message from the API which includes current status, target status, and valid transitions
          // The API returns detailed info in the error message, so use it directly
          errorMessage = error.message;
          
          // If the session is already in the target state, provide a helpful message
          if (error.message.includes('PREP_IN_PROGRESS') && error.message.includes('CLAIM_PREP')) {
            errorMessage = '✅ This session is already in prep! The prep was already claimed. Refresh the page to see the updated status and continue with "Heat Coals".';
            // Auto-refresh sessions to show updated state
            if (refreshSessions) {
              setTimeout(() => refreshSessions(), 1000);
            }
          }
        } else if (error.message.includes('Permission denied') || error.message.includes('403')) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('500') || error.message.includes('Internal server')) {
          errorMessage = 'Server error. Please try again in a moment.';
        } else {
          // Use the full error message which should contain detailed API response
          errorMessage = error.message;
        }
      }
      
      // Show user-friendly error with actionable message
      // For state transition errors, show the full detailed message
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
      onSessionAction(sessionId, action);
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
    // Always check the actual database fields first, not the cached status
    // This ensures we show the correct state even if the session object has stale data
    // For demo sessions, check status first if state is not available
    const state = session.state || (session.status === 'PAID_CONFIRMED' ? 'PENDING' : session.status === 'PREP_IN_PROGRESS' ? 'ACTIVE' : 'NEW');
    const hasPayment = session.paymentStatus === 'succeeded' || 
                      (session.externalRef && (
                        session.externalRef.startsWith('cs_') || 
                        session.externalRef.startsWith('test_cs_') ||
                        session.externalRef.startsWith('guest-') // Guest sessions from guest build are treated as paid
                      )) ||
                      session.status === 'PAID_CONFIRMED' || // Demo mode: status indicates payment
                      (session.amount && session.amount > 0); // Has amount = paid
    const assignedBOHId = session.assignedBOHId || session.assigned_boh_id || session.assignedStaff?.boh;
    const explicitStatus = session.status as SessionStatus | undefined;
    
    // Trust explicit status first so we don't get stuck on legacy table notes
    if (explicitStatus && explicitStatus !== 'NEW') {
      return explicitStatus;
    }
    
    // Debug logging for troubleshooting (can be removed later)
    if (session.id && (state === 'ACTIVE' || session.status === 'PAID_CONFIRMED' || session.status === 'PREP_IN_PROGRESS')) {
      console.log('[getSessionStatus] Debug:', {
        sessionId: session.id,
        state,
        assignedBOHId,
        hasPayment,
        paymentStatus: session.paymentStatus,
        externalRef: session.externalRef,
        cachedStatus: session.status,
        assignedStaff: session.assignedStaff
      });
    }
    
    // Special handling: ACTIVE + assignedBOHId + payment confirmed = PREP_IN_PROGRESS
    // This MUST match the logic in mapPrismaStateToFireSession (session-utils-prisma.ts)
    // This handles CLAIM_PREP action which sets state to ACTIVE but should show as PREP_IN_PROGRESS
    if (state === 'ACTIVE' && assignedBOHId && hasPayment) {
      // Check tableNotes for workflow stage hints (HEAT_UP, READY_FOR_DELIVERY, etc.)
      // Since database only stores ACTIVE for workflow stages, we infer from tableNotes
      const notes = session.tableNotes || '';
      
      // Check for most recent workflow action in notes (work backwards from most recent)
      if (notes.includes('Action START_ACTIVE') || notes.includes('Action MARK_DELIVERED')) {
        // Delivered and active - check if it's ACTIVE or DELIVERED
        if (notes.includes('Action START_ACTIVE')) {
          return 'ACTIVE';
        }
        return 'DELIVERED';
      }
      if (notes.includes('Action DELIVER_NOW') || notes.includes('Action OUT_FOR_DELIVERY')) {
        console.log('[getSessionStatus] Mapping ACTIVE + assignedBOHId + DELIVER note → OUT_FOR_DELIVERY');
        return 'OUT_FOR_DELIVERY';
      }
      if (notes.includes('Action READY_FOR_DELIVERY') || notes.includes('Ready for delivery') || notes.includes('Ready')) {
        console.log('[getSessionStatus] Mapping ACTIVE + assignedBOHId + READY note → READY_FOR_DELIVERY');
        return 'READY_FOR_DELIVERY';
      }
      if (notes.includes('Action HEAT_UP') || notes.includes('Heat Up') || notes.includes('Coals heating')) {
        console.log('[getSessionStatus] Mapping ACTIVE + assignedBOHId + HEAT_UP note → HEAT_UP');
        return 'HEAT_UP';
      }
      // Default: ACTIVE + assignedBOHId = PREP_IN_PROGRESS (after CLAIM_PREP, before HEAT_UP)
      console.log('[getSessionStatus] Mapping ACTIVE + assignedBOHId + payment → PREP_IN_PROGRESS');
      return 'PREP_IN_PROGRESS';
    }
    
    // Also handle ACTIVE without assignedBOHId (could be delivered/active session)
    if (state === 'ACTIVE' && !assignedBOHId && hasPayment) {
      const notes = session.tableNotes || '';
      if (notes.includes('Action START_ACTIVE')) {
        return 'ACTIVE';
      }
      if (notes.includes('Action MARK_DELIVERED')) {
        return 'DELIVERED';
      }
      // Default: ACTIVE without BOH = active session (delivered and running)
      return 'ACTIVE';
    }
    
    // Special handling: PENDING + payment confirmed = PAID_CONFIRMED
    // This MUST match the logic in mapPrismaStateToFireSession
    if (state === 'PENDING' && hasPayment) {
      return 'PAID_CONFIRMED';
    }
    
    // Map database state to FireSession status
    // Define stateMap here so it can be used in the cached status check below
    const stateMap: Record<string, SessionStatus> = {
      'PENDING': hasPayment ? 'PAID_CONFIRMED' : 'NEW',
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
      // Handle lowercase variants (just in case)
      'pending': hasPayment ? 'PAID_CONFIRMED' : 'NEW',
      'active': assignedBOHId && hasPayment ? 'PREP_IN_PROGRESS' : 'ACTIVE',
      'new': 'NEW',
      'prep_in_progress': 'PREP_IN_PROGRESS',
      'heat_up': 'HEAT_UP',
      'ready_for_delivery': 'READY_FOR_DELIVERY',
      'out_for_delivery': 'OUT_FOR_DELIVERY',
      'delivered': 'DELIVERED',
      'paid_confirmed': 'PAID_CONFIRMED',
    };
    
    // If session already has a status from API conversion and state doesn't override it, use it
    // But only if the state mapping logic above didn't catch it
    if (session.status && session.status !== 'NEW') {
      // Double-check: if state is ACTIVE with assignedBOHId, we should show PREP_IN_PROGRESS
      // This handles cases where the API conversion might have missed it
      if (state === 'ACTIVE' && assignedBOHId && hasPayment && session.status === 'PAID_CONFIRMED') {
        console.log('[getSessionStatus] Overriding cached PAID_CONFIRMED → PREP_IN_PROGRESS (ACTIVE + assignedBOHId + payment)');
        return 'PREP_IN_PROGRESS';
      }
      // Don't trust cached status if state has changed - always check state first
      // Only use cached status if state mapping doesn't provide a clear answer
      // This prevents stale cached status from overriding actual database state
      const mappedStatus = stateMap[state];
      if (mappedStatus && mappedStatus !== 'NEW') {
        // State mapping provides a clear status - use it instead of cached
        return mappedStatus;
      }
      
      // Fallback to cached status only if state mapping is unclear
      return session.status as SessionStatus;
    }
    
    // Always prioritize state mapping over cached status
    const mappedStatus = stateMap[state];
    if (mappedStatus) {
      return mappedStatus;
    }
    
    // Last resort: use cached status or default to NEW
    return (session.status as SessionStatus) || 'NEW';
  };

  const TRACKER_STAGE_ORDER: TrackerStage[] = ['Payment', 'Prep', 'Ready', 'Deliver', 'Light'];

  const getTrackerStage = (session: any): TrackerStage => {
    const status = getSessionStatus(session);
    const stage = (session.stage as TrackerStage) || STATUS_TO_TRACKER_STAGE[status] || 'Payment';
    return stage;
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

  // Reusable function to render a session card
  const renderSessionCard = (session: any) => {
    const sessionStatus = getSessionStatus(session);
    const sessionStage = getTrackerStage(session);
    const availableActions = getAvailableActions(session);
    const sessionId = session.id || session.session_id;
    const displayName = getSessionDisplayName(sessionStatus);
    const statusColor = STATUS_COLORS[sessionStatus];
    const stateIcon = STATE_ICONS[sessionStatus];
    
    // Get primary next action (first action in workflow sequence)
    const primaryActions = ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE'];
    const primaryNextAction = availableActions.find(a => primaryActions.includes(a));

    const trustScore = calculateSingleSessionTrustScore(session as FireSession);
    const trustScoreColor = getTrustScoreColor(trustScore);
    const { status: healthStatus, issues } = getSessionHealth(session as FireSession);

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
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              {sessionStage}
              {(() => {
                const substateLabel: Record<SessionStatus, string> = {
                  'HEAT_UP': 'Heating Coals',
                  'READY_FOR_DELIVERY': 'Ready for FOH',
                  'OUT_FOR_DELIVERY': 'Out for Delivery',
                  'DELIVERED': 'Delivered',
                  'ACTIVE': 'Lighted',
                  'PREP_IN_PROGRESS': '',
                  'PAID_CONFIRMED': '',
                  'NEW': '',
                  'CLOSE_PENDING': '',
                  'CLOSED': '',
                  'STAFF_HOLD': '',
                  'STOCK_BLOCKED': '',
                  'REMAKE': '',
                  'REFUND_REQUESTED': '',
                  'REFUNDED': '',
                  'FAILED_PAYMENT': '',
                  'VOIDED': '',
                };
                const label = (typeof session.action === 'string' && session.action) 
                  ? session.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())
                  : substateLabel[sessionStatus];
                return label ? (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-200 border border-zinc-700">
                    {label}
                  </span>
                ) : null;
              })()}
            </span>
            {/* Payment Confirmed Indicator */}
            {sessionStatus === 'PAID_CONFIRMED' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-900/40 border border-green-500/50 rounded">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-xs font-semibold text-green-300">PAID</span>
              </div>
            )}
            {/* Payment Pending Indicator */}
            {sessionStatus === 'NEW' && !session.externalRef && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/40 border border-yellow-500/50 rounded">
                <CreditCard className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-300">AWAITING PAYMENT</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900/50 rounded">
              <Shield className="w-3 h-3 text-zinc-400" />
              <span className={`text-xs font-semibold ${trustScoreColor}`}>
                {trustScore}
              </span>
            </div>
            {healthStatus !== 'healthy' && (
              <div
                className="flex items-center gap-1 px-2 py-1 bg-teal-900/40 border border-teal-500/40 rounded"
                title={issues.join('; ') || 'Reflex detected a potential issue'}
              >
                <Zap className="w-3 h-3 text-teal-300" />
                <span className="text-[10px] font-semibold text-teal-200">Reflex</span>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Progress Indicator */}
        {['PAID_CONFIRMED', 'PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE'].includes(sessionStatus) && (
          <div className="mb-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-400">Night After Night Flow</span>
              <span className="text-xs font-semibold text-teal-400">{sessionStage}</span>
            </div>
            {(() => {
              const stageIndex = TRACKER_STAGE_ORDER.indexOf(sessionStage);
              const barClass = (idx: number) =>
                stageIndex >= idx
                  ? stageIndex === idx
                    ? 'bg-teal-400 animate-pulse'
                    : 'bg-green-500'
                  : 'bg-zinc-700';
              return (
                <>
                  <div className="flex items-center gap-1">
                    <div className={`flex-1 h-2 rounded transition-all ${barClass(0)}`} title="Payment" />
                    <div className={`flex-1 h-2 rounded transition-all ${barClass(1)}`} title="Prep" />
                    <div className={`flex-1 h-2 rounded transition-all ${barClass(2)}`} title="Ready" />
                    <div className={`flex-1 h-2 rounded transition-all ${barClass(3)}`} title="Deliver" />
                    <div className={`flex-1 h-2 rounded transition-all ${barClass(4)}`} title="Light Session" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px]">
                    <span className={stageIndex === 0 ? 'text-teal-400 font-semibold' : 'text-zinc-500'}>Payment</span>
                    <span className={stageIndex === 1 ? 'text-teal-400 font-semibold' : 'text-zinc-500'}>Prep</span>
                    <span className={stageIndex === 2 ? 'text-teal-400 font-semibold' : 'text-zinc-500'}>Ready</span>
                    <span className={stageIndex === 3 ? 'text-teal-400 font-semibold' : 'text-zinc-500'}>Deliver</span>
                    <span className={stageIndex === 4 ? 'text-orange-400 font-semibold' : 'text-zinc-500'}>Light</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Session Details - High Value Data */}
        <div className="mb-3 space-y-2">
          {/* Customer Name */}
          {session.customer_name || session.customerName ? (
            <div className="p-2 bg-zinc-900/50 rounded text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Customer:</span>
                <span className="text-white font-medium">{session.customer_name || session.customerName}</span>
              </div>
            </div>
          ) : null}
          
          {/* Flavor Mix */}
          {session.flavor ? (
            <div className="p-2 bg-zinc-900/50 rounded text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Flavor Mix:</span>
                <span className="text-white font-medium">{session.flavor}</span>
              </div>
            </div>
          ) : null}
          
          {/* Table ID */}
          <div className="p-2 bg-zinc-900/50 rounded text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Table:</span>
              <span className="text-white font-medium">{session.table_id || session.tableId}</span>
            </div>
          </div>
          
          {/* Amount */}
          {session.amount ? (
            <div className="p-2 bg-zinc-900/50 rounded text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Amount:</span>
                <span className="text-green-400 font-semibold">${(session.amount / 100).toFixed(2)}</span>
              </div>
            </div>
          ) : null}
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
            {/* P1: Timer nudge — habit formation when session ending soon */}
            {(session.sessionTimer?.isActive && (timerUpdates[session.id] ?? calculateRemainingTime(session)) > 0 && (timerUpdates[session.id] ?? calculateRemainingTime(session)) <= 5 * 60) && (
              <p className="text-xs text-amber-300 mt-1">Session ending soon — offer extension or close.</p>
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

        {/* Next Steps Section - Highlight primary next action */}
        {availableActions.length > 0 && primaryNextAction && (
          <div className="mt-3 pt-3 border-t border-zinc-700 bg-teal-900/20 border-teal-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-300">Next Step:</span>
            </div>
            <p className="text-xs text-zinc-400 mb-2">
              {ACTION_DESCRIPTIONS[primaryNextAction]}
            </p>
          </div>
        )}

        {/* Quick Action Controls - Prominent buttons for common actions */}
        {availableActions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-700 space-y-3">
            {/* Primary Quick Actions - Most common workflow actions */}
            <div className="flex flex-wrap gap-2">
              {/* CLAIM_PREP - For PAID_CONFIRMED sessions */}
              {availableActions.includes('CLAIM_PREP') && canUserPerformAction('CLAIM_PREP', userRole) && (
                <button
                  data-action="CLAIM_PREP"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionAction('claim_prep', sessionId);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors flex-1 min-w-[140px] justify-center ${
                    primaryNextAction === 'CLAIM_PREP' 
                      ? 'bg-orange-600 hover:bg-orange-700 ring-2 ring-orange-400 ring-opacity-50' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                  title={ACTION_DESCRIPTIONS['CLAIM_PREP']}
                >
                  <ChefHat className="w-4 h-4" />
                  <span className="text-sm font-medium">Claim Prep</span>
                  {primaryNextAction === 'CLAIM_PREP' && <Zap className="w-3 h-3 ml-1" />}
                </button>
              )}
              
              {/* HEAT_UP - For PREP_IN_PROGRESS sessions */}
              {availableActions.includes('HEAT_UP') && canUserPerformAction('HEAT_UP', userRole) && (
                <button
                  data-action="HEAT_UP"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionAction('heat_up', sessionId);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors flex-1 min-w-[140px] justify-center ${
                    primaryNextAction === 'HEAT_UP' 
                      ? 'bg-red-600 hover:bg-red-700 ring-2 ring-red-400 ring-opacity-50' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                  title={ACTION_DESCRIPTIONS['HEAT_UP']}
                >
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">Heat Coals</span>
                  {primaryNextAction === 'HEAT_UP' && <Zap className="w-3 h-3 ml-1" />}
                </button>
              )}
              
              {/* READY_FOR_DELIVERY - For HEAT_UP sessions */}
              {availableActions.includes('READY_FOR_DELIVERY') && canUserPerformAction('READY_FOR_DELIVERY', userRole) && (
                <button
                  data-action="READY_FOR_DELIVERY"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionAction('ready_for_delivery', sessionId);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors flex-1 min-w-[140px] justify-center ${
                    primaryNextAction === 'READY_FOR_DELIVERY' 
                      ? 'bg-green-600 hover:bg-green-700 ring-2 ring-green-400 ring-opacity-50' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                  title={ACTION_DESCRIPTIONS['READY_FOR_DELIVERY']}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Ready</span>
                  {primaryNextAction === 'READY_FOR_DELIVERY' && <Zap className="w-3 h-3 ml-1" />}
                </button>
              )}
              
              {/* DELIVER_NOW - For READY_FOR_DELIVERY sessions */}
              {availableActions.includes('DELIVER_NOW') && canUserPerformAction('DELIVER_NOW', userRole) && (
                <button
                  data-action="DELIVER_NOW"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionAction('deliver_now', sessionId);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors flex-1 min-w-[140px] justify-center ${
                    primaryNextAction === 'DELIVER_NOW' 
                      ? 'bg-purple-600 hover:bg-purple-700 ring-2 ring-purple-400 ring-opacity-50' 
                      : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                  title={ACTION_DESCRIPTIONS['DELIVER_NOW']}
                >
                  <Truck className="w-4 h-4" />
                  <span className="text-sm font-medium">Deliver</span>
                  {primaryNextAction === 'DELIVER_NOW' && <Zap className="w-3 h-3 ml-1" />}
                </button>
              )}
              
              {/* MARK_DELIVERED - For OUT_FOR_DELIVERY sessions */}
              {availableActions.includes('MARK_DELIVERED') && canUserPerformAction('MARK_DELIVERED', userRole) && (
                <button
                  data-action="MARK_DELIVERED"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionAction('mark_delivered', sessionId);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors flex-1 min-w-[140px] justify-center ${
                    primaryNextAction === 'MARK_DELIVERED' 
                      ? 'bg-teal-600 hover:bg-teal-700 ring-2 ring-teal-400 ring-opacity-50' 
                      : 'bg-teal-500 hover:bg-teal-600'
                  }`}
                  title={ACTION_DESCRIPTIONS['MARK_DELIVERED']}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Delivered</span>
                  {primaryNextAction === 'MARK_DELIVERED' && <Zap className="w-3 h-3 ml-1" />}
                </button>
              )}
              
              {/* START_ACTIVE (Light Session) - For DELIVERED sessions */}
              {availableActions.includes('START_ACTIVE') && canUserPerformAction('START_ACTIVE', userRole) && (
                <button
                  data-action="START_ACTIVE"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionAction('start_active', sessionId);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors flex-1 min-w-[140px] justify-center font-bold shadow-lg ${
                    primaryNextAction === 'START_ACTIVE' 
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 ring-2 ring-red-400 ring-opacity-50 shadow-red-500/50' 
                      : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-red-500/50'
                  }`}
                  title={ACTION_DESCRIPTIONS['START_ACTIVE']}
                >
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">🔥 Light Session</span>
                  {primaryNextAction === 'START_ACTIVE' && <Zap className="w-3 h-3 ml-1" />}
                </button>
              )}
            </div>
            
            {/* Staff – verbal / outside QR: coal refill & flavor upsell (ACTIVE sessions) */}
            {sessionStatus === 'ACTIVE' && (
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center space-x-1 text-xs text-zinc-400 mb-2">
                  <UserCheck className="w-3 h-3" />
                  <span className="font-medium">Staff – verbal / outside QR:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableActions.includes('REQUEST_REFILL') && canUserPerformAction('REQUEST_REFILL', userRole) && (session.refillStatus !== 'requested') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSessionAction('request_refill', sessionId); }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                      title="Customer asked for new coals (verbal or outside QR)"
                    >
                      <Coffee className="w-3 h-3" />
                      <span>Coal refill</span>
                    </button>
                  )}
                  {sessionStatus === 'ACTIVE' && canUserPerformAction('REQUEST_REFILL', userRole) && (session.refillStatus !== 'requested') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSessionAction('request_flavor_bowl', sessionId); }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium bg-violet-500 hover:bg-violet-600 text-white transition-colors"
                      title="Customer asked for new flavor bowl (verbal or outside QR)"
                    >
                      <Flame className="w-3 h-3" />
                      <span>New flavor bowl</span>
                    </button>
                  )}
                  {availableActions.includes('COMPLETE_REFILL') && canUserPerformAction('COMPLETE_REFILL', userRole) && (session.refillStatus === 'requested') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSessionAction('complete_refill', sessionId); }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                      title="Mark refill/flavor bowl delivered"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Complete refill</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Secondary Actions - Less common but available */}
            {(availableActions.filter(a => !['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE'].includes(a)).length > 0) && (
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center space-x-1 text-xs text-zinc-400 mb-2">
                  <Zap className="w-3 h-3" />
                  <span className="font-medium">More Actions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableActions
                    .filter(a => !['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE'].includes(a))
                    .map((action) => {
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
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
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
              </div>
            )}
            
            {/* Intelligence Button */}
            <div className="pt-2 border-t border-zinc-800">
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
        
        {/* No Actions Available Message */}
        {/* Show actions even if getAvailableActions returns empty - check workflow state directly */}
        {availableActions.length === 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-700">
            <div className="text-center py-4">
              <p className="text-xs text-zinc-500 mb-2">
                {sessionStatus === 'ACTIVE' && session.sessionTimer?.isActive 
                  ? 'Session is active. Use pause/refill/close actions from session detail modal.'
                  : sessionStatus === 'CLOSED'
                  ? 'Session completed.'
                  : 'No actions available for this session state.'}
              </p>
              {/* Fallback: Show workflow actions if status detection failed but we're in workflow */}
              {['PAID_CONFIRMED', 'PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(sessionStatus) && (
                <div className="mt-2 text-xs text-yellow-400">
                  <p>Status detection may be delayed. Try refreshing or check session detail modal for actions.</p>
                </div>
              )}
              <p className="text-xs text-zinc-600">
                Current status: <span className="font-medium text-zinc-400">{getSessionDisplayName(sessionStatus)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Session Details */}
        <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
          {session.sessionType && (
            <p className="text-sm text-zinc-400">
              <span className="font-medium">Pricing:</span>{' '}
              {session.sessionType === 'TIME_BASED' ? 'Time-based session' : 'Flat session'}
            </p>
          )}
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
            {scopeLabel ? (
              <div className="mt-2 inline-flex items-center rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-200">
                Scoped to: {scopeLabel}
              </div>
            ) : null}
          </div>
        </div>
        
        {sessions.length > 0 && loungeId !== 'CODIGO' && (
          <button
            onClick={handleCreateSession}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Order</span>
          </button>
        )}
        {/* Test Session Button - Show only in development mode based on feature flags. Hidden for CODIGO. */}
        {!isDemoMode && featureFlags.showTestSessionButton && loungeId !== 'CODIGO' && (
          <button
            onClick={async () => {
              try {
                const toDisplayTableId = (id: string) => {
                  const m = id?.toLowerCase().match(/^table-0*(\d{1,4})$/);
                  if (!m) return id;
                  const pad = String(parseInt(m[1], 10)).padStart(3, '0');
                  return `T-${pad}`;
                };

                const response = await fetch('/api/test-session/create-paid', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tableId: `table-${Math.floor(Math.random() * 100) + 1}`,
                    customerName: `Test Customer ${Math.floor(Math.random() * 100)}`,
                    flavorMix: ['Mint', 'Grape'],
                    amount: 3000
                  })
                });
                
                const result = await response.json();
                if (result.success) {
                  // If this is a fallback/ephemeral response, inject it into the in-memory dashboard
                  // so it shows up immediately even when GET /api/sessions returns empty fallbackMode.
                  if (result?.fallbackMode && result?.session?.id) {
                    try {
                      window.dispatchEvent(new CustomEvent('hp:addDemoSession', {
                        detail: {
                          session: {
                            id: result.session.id,
                            tableId: toDisplayTableId(result.session.tableId || 'table-001'),
                            customerName: result.session.customerName || 'Test Customer',
                            customerPhone: '',
                            flavor: 'Mint + Grape',
                            amount: result.session.amount || 3000,
                            status: 'PAID_CONFIRMED',
                            state: 'PENDING',
                            paymentStatus: 'succeeded',
                            externalRef: result.session.externalRef || `test_cs_${result.session.id}`,
                            currentStage: 'BOH',
                            assignedStaff: { boh: undefined, foh: undefined },
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                            sessionStartTime: undefined,
                            sessionDuration: 45 * 60,
                            coalStatus: 'active',
                            refillStatus: 'none',
                            notes: 'Ephemeral paid test session (DB not configured)',
                            edgeCase: null,
                            bohState: 'PREPARING',
                            guestTimerDisplay: false
                          }
                        }
                      }));
                    } catch (e) {
                      // non-blocking
                    }
                  }

                  alert(`✅ Test session created!\n\nSession ID: ${result.session.id}\nTable: ${result.session.tableId}\nStatus: ${result.session.status}\n\nRefresh to see it in the dashboard.`);
                  if (refreshSessions) {
                    await refreshSessions();
                  } else {
                    window.location.reload();
                  }
                } else {
                  throw new Error(result.error || 'Failed to create test session');
                }
              } catch (error) {
                console.error('Error creating test session:', error);
                alert(`Failed to create test session: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            title="Create a test session with payment already confirmed - ready for workflow testing"
          >
            <Plus className="w-4 h-4" />
            <span>Create Test Paid Session</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'All Orders', icon: '📊' },
          { id: 'boh', label: 'Kitchen', icon: '👨‍🍳' },
          { id: 'foh', label: 'Floor', icon: '👨‍💼' },
          { id: 'edge', label: 'Issues', icon: '⚠️' }
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
          {/* Next Action Now - Priority Actions for Operators */}
          <div className="bg-gradient-to-r from-orange-500/10 to-teal-500/10 border-2 border-orange-500/30 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">What Needs Your Attention Now</h3>
                <p className="text-sm text-zinc-400">Take action on these items to keep orders moving</p>
              </div>
              <div className="flex items-center gap-2">
                {loungeId === 'CODIGO' && (
                  <button
                    onClick={() => setActiveTab('foh')}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Open Floor
                  </button>
                )}
                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full">{sessions.length} total</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Context-Aware Actions - Only show when sessions are available */}
              {(() => {
                // Find first unpaid session
                const unpaidSession = sessions.find(s => {
                  const status = getSessionStatus(s);
                  return status === 'NEW';
                });

                // Find first session ready for BOH prep
                const prepSession = sessions.find(s => {
                  const status = getSessionStatus(s);
                  return status === 'NEW' || status === 'PAID_CONFIRMED';
                });

                // Find first session ready for FOH delivery
                const deliverySession = sessions.find(s => {
                  const status = getSessionStatus(s);
                  return status === 'READY_FOR_DELIVERY';
                });

                // Find first session ready to light
                const lightSession = sessions.find(s => {
                  const status = getSessionStatus(s);
                  return status === 'DELIVERED';
                });

                return (
                  <>
                    {/* Take Payment - Show if unpaid session exists */}
                    {unpaidSession && (
                      <button
                        onClick={async () => {
                          const amount = unpaidSession.amount || 3000;
                  
                          // Demo mode: Mock payment confirmation and trigger NAN workflow
                          if (isDemoMode) {
                            try {
                              const sessionId = unpaidSession.id;
                              if (!sessionId) {
                                throw new Error('Session ID not found');
                              }
                              
                              console.log('[Demo Mode] 🎭 Mocking payment confirmation for session:', sessionId);
                              
                              // Call demo-session complete API to trigger NAN workflow
                              const response = await fetch('/api/demo-session/complete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  sessionId: sessionId,
                                  amount: amount,
                                  flavorMix: unpaidSession.flavor || unpaidSession.flavorMix || 'Custom Mix',
                                  tableId: unpaidSession.tableId,
                                  customerPhone: unpaidSession.customerPhone,
                                })
                              });
                              
                              const data = await response.json();
                              
                              if (data.success) {
                                alert(`✅ Payment confirmed (Demo Mode)!\n\nSession "${unpaidSession.customerName || unpaidSession.tableId}" is now ready for BOH prep → FOH delivery → Light!`);
                                
                                // Refresh sessions to show updated state
                                if (refreshSessions) {
                                  await refreshSessions();
                                }
                              } else {
                                throw new Error(data.error || 'Failed to confirm payment');
                              }
                            } catch (error) {
                              console.error('[Demo Mode] Payment confirmation error:', error);
                              alert(`❌ Demo payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            }
                            return;
                          }
                          
                          // Production mode: Check if payment already exists or create Stripe checkout
                          try {
                            // SECURITY: Use existing session ID (session already exists)
                            const sessionId = unpaidSession.id;
                            if (!sessionId) {
                              throw new Error('Session ID not found');
                            }
                            
                            // Check if session already has a payment (externalRef might be Stripe checkout session ID)
                            if (unpaidSession.externalRef && unpaidSession.externalRef.startsWith('cs_')) {
                              // Session already has a Stripe checkout session - check if it's paid
                              try {
                                const checkoutResponse = await fetch(`/api/checkout-session/${unpaidSession.externalRef}`);
                                if (checkoutResponse.ok) {
                                  const checkoutData = await checkoutResponse.json();
                                  if (checkoutData.session?.payment_status === 'paid') {
                                    alert(`✅ Payment already confirmed for ${unpaidSession.tableId || unpaidSession.table_id}.\n\nSession is ready for BOH prep → FOH delivery → Light!`);
                                    // Refresh to show updated status
                                    if (refreshSessions) await refreshSessions();
                                    return;
                                  } else {
                                    // Payment not completed - open existing checkout
                                    const checkoutUrl = checkoutData.session?.url;
                                    if (checkoutUrl) {
                                      window.open(checkoutUrl, '_blank');
                                      alert(`✅ Opening existing payment checkout for ${unpaidSession.tableId || unpaidSession.table_id}.\n\nComplete payment to proceed.`);
                                      return;
                                    }
                                  }
                                }
                              } catch (checkoutError) {
                                console.warn('[Payment] Could not check existing checkout, creating new one:', checkoutError);
                              }
                            }
                            
                            // No existing checkout - create new Stripe checkout session
                            const response = await fetch('/api/checkout-session', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                sessionId: sessionId, // SECURITY: Only send opaque session ID to Stripe
                                flavors: unpaidSession.flavor ? [unpaidSession.flavor] : ['Custom Mix'],
                                tableId: unpaidSession.tableId || unpaidSession.table_id,
                                amount: amount, // Already in cents
                                total: amount / 100, // For display
                                sessionDuration: unpaidSession.durationSecs || unpaidSession.sessionDuration || 2700,
                                dollarTestMode: true // Use $1 test mode for sandbox
                              })
                            });
                            
                            const data = await response.json();
                            if (data.success && data.sessionUrl) {
                              // Open Stripe checkout in new window
                              window.open(data.sessionUrl, '_blank');
                              alert(`✅ Payment checkout opened for ${unpaidSession.tableId || unpaidSession.table_id}.\n\nAfter payment confirmation, session will be ready for BOH prep → FOH delivery → Light!`);
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
                        className="px-5 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm font-semibold shadow-lg"
                        title={`Take payment for ${unpaidSession.tableId}${unpaidSession.customerName ? ` (${unpaidSession.customerName})` : ''}`}
                      >
                        <DollarSign className="w-5 h-5" />
                        <span>Take Payment → {unpaidSession.tableId}</span>
                      </button>
                    )}

                    {/* Start Prep - Show if prep session exists */}
                    {prepSession && (
                      <button
                        onClick={async () => {
                          await handleSessionAction('claim_prep', prepSession.id);
                        }}
                        className="px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm font-semibold shadow-lg"
                        title={`Start preparing hookah for ${prepSession.tableId}${prepSession.customerName ? ` (${prepSession.customerName})` : ''}`}
                      >
                        <ChefHat className="w-5 h-5" />
                        <span>Start Prep → {prepSession.tableId}</span>
                      </button>
                    )}

                    {/* Deliver to Table - Show if delivery session exists */}
                    {deliverySession && (
                      <button
                        onClick={async () => {
                          await handleSessionAction('deliver_now', deliverySession.id);
                        }}
                        className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm font-semibold shadow-lg"
                        title={`Take hookah to ${deliverySession.tableId}${deliverySession.customerName ? ` (${deliverySession.customerName})` : ''}`}
                      >
                        <Truck className="w-5 h-5" />
                        <span>Deliver to Table → {deliverySession.tableId}</span>
                      </button>
                    )}

                    {/* Light Hookah - Show if light session exists */}
                    {lightSession && (
                      <button
                        onClick={async () => {
                          await handleSessionAction('start_active', lightSession.id);
                          alert(`🔥 Hookah at ${lightSession.tableId} is now lit! Timer started.`);
                        }}
                        className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm font-semibold shadow-lg"
                        title={`Light hookah for ${lightSession.tableId}${lightSession.customerName ? ` (${lightSession.customerName})` : ''}`}
                      >
                        <Flame className="w-5 h-5" />
                        <span>Light Hookah → {lightSession.tableId}</span>
                      </button>
                    )}

                    {/* Update - Always available */}
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
                      className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Update</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <Flame className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">No Active Sessions</h3>
              <p className="text-zinc-500 mb-4">
                {loungeId === 'CODIGO' ? 'Use the Floor tab to start sessions from the floor plan.' : 'Create your first session to get started'}
              </p>
              {loungeId !== 'CODIGO' && (
                <button
                  onClick={handleCreateSession}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors inline-flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Order</span>
                </button>
              )}
            </div>
          ) : (
            sessions.map(renderSessionCard)
          )}
        </div>
      )}

      {/* BOH Tab */}
      {activeTab === 'boh' && (
        <div className="space-y-4">
          {/* Guest refill requests (coal / flavor) — notify BOH to process */}
          {(() => {
            const refillRequestSessions = sessions.filter(
              (s) =>
                (s.state === 'ACTIVE' || getSessionStatus(s) === 'ACTIVE') &&
                (s.edgeCase === 'refill_requested' || s.refillStatus === 'requested')
            );
            if (refillRequestSessions.length === 0) return null;
            return (
              <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-4">
                <h3 className="text-base font-semibold text-amber-200 mb-3 flex items-center space-x-2">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <span>Guest Refill Requests — Kitchen</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-xs font-medium">
                    {refillRequestSessions.length}
                  </span>
                </h3>
                <p className="text-xs text-amber-200/80 mb-3">
                  Guest requested coal refill or new bowl via app. Prepare and complete refill.
                </p>
                <div className="space-y-2">
                  {refillRequestSessions.map((s) => renderSessionCard(s))}
                </div>
              </div>
            );
          })()}

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Package className="w-5 h-5 text-orange-400" />
              <span>Kitchen Orders</span>
            </h3>
            <div className="space-y-4">
              {(() => {
                const bohSessions = sessions.filter(s => {
                  const status = getSessionStatus(s);
                  // Exclude voided sessions - they are no longer viable transactions
                  if (status === 'VOIDED' || s.state === 'CANCELED') return false;
                  // Include PAID_CONFIRMED (ready for prep), PREP_IN_PROGRESS, HEAT_UP, READY_FOR_DELIVERY
                  // Also include STAFF_HOLD and REMAKE (edge cases that need BOH attention)
                  return ['PAID_CONFIRMED', 'PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'STAFF_HOLD', 'REMAKE'].includes(status);
                });
                return bohSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                    <h3 className="text-lg font-medium text-zinc-300 mb-2">No Kitchen Orders</h3>
                    <p className="text-zinc-500">No orders currently in kitchen</p>
                  </div>
                ) : (
                  bohSessions.map(renderSessionCard)
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* FOH Tab */}
      {activeTab === 'foh' && (
        <div className="space-y-4">
          {loungeId === 'CODIGO' && onCreateSession ? (
            <>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                <LayoutGrid className="w-5 h-5 text-teal-400" />
                <span>CODIGO Floor Plan</span>
              </h3>
              <CodigoFloorPlan
                sessions={sessions}
                loungeId={loungeId}
                onStartSession={async ({ seatLabel, flavorId, flavorName }) => {
                  await onCreateSession({
                    tableId: seatLabel,
                    table_id: seatLabel,
                    customerName: 'Walk-in',
                    customer_name: 'Walk-in',
                    flavor_mix: [flavorName],
                    flavor: flavorName,
                    amount: 60,
                    lounge_id: loungeId,
                    loungeId,
                    source: 'POS',
                    session_type: 'walk-in',
                    isDemo: true, // CODIGO operator: Toast handles payment, treat as paid
                    codigoOperator: true, // Skip to ACTIVE for floor display
                  });
                }}
                onEndSession={async (sessionId) => {
                  if (onSessionAction) {
                    await onSessionAction(sessionId, 'CLOSE_SESSION');
                  }
                }}
                onOpenSession={(sessionId) => {
                  const s = sessions.find((sess: any) => sess.id === sessionId);
                  if (s) {
                    setSelectedSession(s);
                    setIsModalOpen(true);
                  }
                }}
                refreshSessions={refreshSessions}
              />
            </>
          ) : (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-teal-400" />
                <span>Floor Orders</span>
              </h3>
              <div className="space-y-4">
                {(() => {
                  const fohSessions = sessions.filter(s => {
                    const status = getSessionStatus(s);
                    if (status === 'VOIDED' || s.state === 'CANCELED') return false;
                    return ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE', 'CLOSE_PENDING'].includes(status);
                  });
                  return fohSessions.length === 0 ? (
                    <div className="text-center py-12">
                      <Truck className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                      <h3 className="text-lg font-medium text-zinc-300 mb-2">No Floor Orders</h3>
                      <p className="text-zinc-500">No orders currently ready for floor service</p>
                    </div>
                  ) : (
                    fohSessions.map(renderSessionCard)
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}


      {/* Edge Cases Tab */}
      {activeTab === 'edge' && (
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Issues & Problems</span>
            </h3>
            <div className="space-y-4">
              {sessions.filter(s => {
                const status = getSessionStatus(s);
                // Exclude voided sessions - they should not appear in FSD at all
                if (status === 'VOIDED' || s.state === 'CANCELED') return false;
                return ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'FAILED_PAYMENT'].includes(status);
              }).length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <h3 className="text-lg font-medium text-zinc-300 mb-2">No Issues</h3>
                  <p className="text-zinc-500">All orders are running smoothly</p>
                </div>
              ) : (
                sessions.filter(s => {
                  const status = getSessionStatus(s);
                  // Exclude voided sessions - they should not appear in FSD at all
                  if (status === 'VOIDED' || s.state === 'CANCELED') return false;
                  return ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'FAILED_PAYMENT'].includes(status);
                }).map(renderSessionCard)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats with Workflow States */}
      {sessions.length > 0 && (
        <div className="mt-8 space-y-4">
          {/* Main Stats - Actionable for Operators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-zinc-400">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {isMounted ? sessions.length : '...'}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-400" />
                <span className="text-sm text-zinc-400">Active Now</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {isMounted ? sessions.filter(s => (s.status || s.state) === 'ACTIVE').length : '...'}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-zinc-400">In Kitchen</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {isMounted ? sessions.filter(s => ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(s.status || s.state)).length : '...'}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-teal-400" />
                <span className="text-sm text-zinc-400">Ready to Deliver</span>
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
        isDemoMode={isDemoMode}
        onSessionAction={onSessionAction}
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

      <CloseSessionModal
        isOpen={showCloseModal}
        onClose={() => {
          setShowCloseModal(false);
          setCloseSessionId('');
        }}
        sessionId={closeSessionId}
        userRole={userRole}
        operatorId={`user-${userRole?.toLowerCase() || 'manager'}`}
        refreshSessions={refreshSessions}
      />
    </div>
  );
}
