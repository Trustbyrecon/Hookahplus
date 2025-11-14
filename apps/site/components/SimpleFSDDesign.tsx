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
  Activity
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

  // Fix hydration mismatch by only rendering time-dependent content after mount
  useEffect(() => {
    setIsMounted(true);
    
    // Update timer every second for active sessions
    const interval = setInterval(() => {
      setTimerKey(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSessionAction = async (action: string, sessionId: string) => {
    // Use proxy endpoint to forward to app build
    // This triggers Reflex Ops flywheel: experience → possibilities → take action → review → build experience
    console.log(`[Site Build] Action: ${action} on session: ${sessionId}`);
    
    try {
      // Map action to SessionAction format for app build API
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
      
      // Use proxy endpoint to forward to app build
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

      if (!response.ok) {
        const responseText = await response.text();
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { details: responseText || `HTTP ${response.status}` };
        }
        throw new Error(error.details || error.error || `Failed to ${action} session ${sessionId}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('[Site Build] Session action successful:', result);
        // Trigger Reflex Ops flywheel: experience → possibilities → take action → review → build experience
        // Refresh the page to show updated session state
        window.location.reload();
      } else {
        console.error('[Site Build] Session action failed:', result);
        alert(`Action failed: ${result.error || result.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Site Build] Error executing session action:', error);
      alert(`Failed to execute action: ${error instanceof Error ? error.message : 'Please try again.'}`);
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

  // Generate demo sessions if none provided
  const displaySessions = sessions.length > 0 ? sessions : mockSiteData.sessions;

  // Filter sessions by role permissions
  const getFilteredSessions = () => {
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

  // Select exactly 3 curated sessions: 1 urgent (red), 1 needs attention (yellow), 1 active (green)
  const selectCuratedSessions = () => {
    const allSessions = roleFilteredSessions;
    
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
    
    // Find one session from each category
    const urgentSession = allSessions.find((s: any) => isUrgent(s));
    const needsAttentionSession = allSessions.find((s: any) => needsAttention(s) && !isUrgent(s));
    const activeSession = allSessions.find((s: any) => isActive(s) && !isUrgent(s) && !needsAttention(s));
    
    // Build curated list, filling gaps if any category is missing
    const curated: any[] = [];
    if (urgentSession) curated.push(urgentSession);
    if (needsAttentionSession) curated.push(needsAttentionSession);
    if (activeSession) curated.push(activeSession);
    
    // If we don't have 3 sessions yet, fill with next priority sessions
    if (curated.length < 3) {
      const remaining = allSessions.filter((s: any) => !curated.includes(s));
      curated.push(...remaining.slice(0, 3 - curated.length));
    }
    
    // Return exactly 3 sessions
    return curated.slice(0, 3);
  };

  const displayedSessions = selectCuratedSessions();
  const filteredSessions = displayedSessions;

  // Calculate metrics for dashboard - sync with displayed sessions
  const calculateMetrics = () => {
    // Use displayedSessions (the 3 curated sessions) for metrics
    const activeSessions = displayedSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return status === 'ACTIVE';
    });
    
    const completedSessions = displayedSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return status === 'CLOSED';
    });
    
    // Calculate average prep time from displayed prep sessions
    const prepSessions = displayedSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(status);
    });
    const avgPrepTime = prepSessions.length > 0 ? Math.floor(Math.random() * 8 + 5) : 0; // Mock: 5-12 minutes
    
    // Calculate completion rate based on displayed sessions
    const completionRate = displayedSessions.length > 0 
      ? Math.round((completedSessions.length / displayedSessions.length) * 100) 
      : 0;
    
    return {
      active: activeSessions.length,
      avgPrepTime,
      completionRate,
      total: displayedSessions.length // Show count of displayed sessions (3)
    };
  };

  const metrics = calculateMetrics();

  // Get all sessions for BOH/FOH tabs (not just curated 3)
  const getAllBohSessions = () => {
    return roleFilteredSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'STOCK_BLOCKED', 'REMAKE'].includes(status);
    });
  };

  const getAllFohSessions = () => {
    return roleFilteredSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return ['OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE', 'STAFF_HOLD', 'REFUND_REQUESTED'].includes(status);
    });
  };

  // Calculate session counts per tab
  const getTabCounts = () => {
    const bohSessions = getAllBohSessions();
    const fohSessions = getAllFohSessions();
    const edgeSessions = roleFilteredSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'VOIDED'].includes(status);
    });
    const waitlistSessions = roleFilteredSessions.filter((s: any) => {
      const status = getSessionStatus(s);
      return status === 'NEW' || status === 'PAID_CONFIRMED';
    });
    
    return {
      overview: filteredSessions.length,
      boh: bohSessions.length,
      foh: fohSessions.length,
      edge: edgeSessions.length,
      waitlist: waitlistSessions.length
    };
  };

  const tabCounts = getTabCounts();

  const handleCreateSessionSave = async (sessionData: any) => {
    try {
      // For site build demo - create a mock session locally
      // In production, this would call the app build API
      const newSession = {
        id: `session-${Date.now()}`,
        customerName: sessionData.customerName || 'Guest',
        tableId: sessionData.table || 'T-001',
        status: 'NEW' as SessionStatus,
        flavorMix: sessionData.addons.length > 0 ? sessionData.addons.join(' + ') : 'Standard Mix',
        amount: sessionData.basePrice + sessionData.addons.reduce((sum: number, id: string) => {
          const addon = [{ id: 'mint', price: 2.50 }, { id: 'mango', price: 2.00 }, { id: 'strawberry', price: 2.00 }, { id: 'peach', price: 2.50 }].find(a => a.id === id);
          return sum + (addon?.price || 0);
        }, 0),
        createdAt: new Date().toISOString(),
        source: sessionData.sessionType || 'walk-in'
      };

      // Show success message
      alert(`Session created successfully!\n\nSession ID: ${newSession.id}\nCustomer: ${newSession.customerName}\nTable: ${newSession.tableId}\nFlavor: ${newSession.flavorMix}\nAmount: $${newSession.amount.toFixed(2)}`);
      
      // Refresh the page to show the new session in demo data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    }
    setShowCreateModal(false);
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
          },
          { 
            id: 'waitlist', 
            label: 'WAITLIST', 
            icon: '⏰',
            description: 'Pending start',
            count: tabCounts.waitlist,
            color: 'purple'
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

                {/* Overview is read-only - only show Intelligence button */}
                <div className="mb-3 flex gap-2">
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
                
                // BOH can move to FOH or deliver themselves
                const bohActions = availableActions.filter(action => 
                  ['READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'HEAT_UP', 'CLAIM_PREP'].includes(action)
                );
                
                return (
                  <div key={sessionId} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{session.tableId || session.table_id || 'Unknown Table'}</h4>
                        <p className="text-sm text-zinc-400">{session.flavor || session.flavorMix || 'Custom Mix'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${statusColor}`}>{displayName}</p>
                        <p className="text-xs text-zinc-500">BOH Stage</p>
                      </div>
                    </div>
                    
                    {/* Action Controls */}
                    {bohActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-700">
                        {bohActions.map((action) => {
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
                                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                  : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                              }`}
                            >
                              {ACTION_ICONS[action]}
                              <span>{action.replace(/_/g, ' ')}</span>
                            </button>
                          );
                        })}
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
                
                // FOH actions
                const fohActions = availableActions.filter(action => 
                  ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'REQUEST_REFILL', 'CLOSE_SESSION', 'PAUSE_SESSION', 'RESUME_SESSION'].includes(action)
                );
                
                return (
                  <div key={sessionId} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{session.tableId || session.table_id || 'Unknown Table'}</h4>
                        <p className="text-sm text-zinc-400">{session.customerName || session.customer_name || 'Guest Customer'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${statusColor}`}>{displayName}</p>
                        <p className="text-xs text-zinc-500">FOH Stage</p>
                      </div>
                    </div>
                    
                    {/* Action Controls */}
                    {fohActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-700">
                        {fohActions.map((action) => {
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
                                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                  : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                              }`}
                            >
                              {ACTION_ICONS[action]}
                              <span>{action.replace(/_/g, ' ')}</span>
                            </button>
                          );
                        })}
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

      {/* Waitlist Tab */}
      {activeTab === 'waitlist' && (
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span>Customer Waitlist</span>
              </h3>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add to Waitlist</span>
              </button>
            </div>
            
            {/* Search and Filters */}
            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <select className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                <option value="waiting">Waiting</option>
                <option value="seated">Seated</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                <option value="all">All Priority</option>
                <option value="vip">VIP</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            {/* Waitlist Entries */}
            <div className="space-y-3">
              {/* Sample waitlist entries */}
              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Sarah Johnson</h4>
                      <p className="text-sm text-zinc-400">4 people • +1-555-0123 • 25m wait</p>
                      <p className="text-xs text-zinc-500">Booth preferred • Regular customer</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">NORMAL</span>
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">WAITING</span>
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                      Seat
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Mike Chen</h4>
                      <p className="text-sm text-zinc-400">2 people • +1-555-0456 • 15m wait</p>
                      <p className="text-xs text-zinc-500">VIP member</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">VIP</span>
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">WAITING</span>
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                      Seat
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Alex Rodriguez</h4>
                      <p className="text-sm text-zinc-400">6 people • +1-555-0789 • 45m wait</p>
                      <p className="text-xs text-zinc-500">Large table needed • Birthday party</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">NORMAL</span>
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">WAITING</span>
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                      Seat
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
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
                      <h4 className="font-medium text-white">{session.tableId || 'Unknown Table'}</h4>
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
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                      Escalate
                    </button>
                    <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors">
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
