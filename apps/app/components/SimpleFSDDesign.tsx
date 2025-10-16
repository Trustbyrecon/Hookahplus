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
  AlertTriangle,
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

  const handleCreateSession = () => {
    window.dispatchEvent(new CustomEvent('openCreateSessionModal'));
  };

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
          sessions.map((session) => {
            const sessionStatus = getSessionStatus(session);
            const sessionStage = getSessionStage(session);
            const availableActions = getAvailableActions(session);
            const sessionId = session.id || session.session_id;
            const displayName = getSessionDisplayName(sessionStatus);
            const statusColor = STATUS_COLORS[sessionStatus];
            const stateIcon = STATE_ICONS[sessionStatus];

            return (
              <div
                key={sessionId}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors"
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
                      {formatDuration(calculateRemainingTime(session))}
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
                              onClick={() => canPerform && handleSessionAction(action.toLowerCase(), sessionId)}
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
                        onClick={() => window.open(`/guest-intelligence?sessionId=${sessionId}`, '_blank')}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors w-full justify-center"
                      >
                        <Brain className="w-4 h-4" />
                        <span className="text-sm font-medium">View Intelligence</span>
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
              {sessions.filter(s => ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(s.status || s.state)).map((session) => (
                <div key={session.id} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{session.tableId || 'Unknown Table'}</h4>
                      <p className="text-sm text-zinc-400">{session.flavor || 'Custom Mix'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-orange-400 font-medium">{session.status || session.state}</p>
                      <p className="text-xs text-zinc-500">BOH Stage</p>
                    </div>
                  </div>
                </div>
              ))}
              {sessions.filter(s => ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(s.status || s.state)).length === 0 && (
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
              {sessions.filter(s => ['OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE'].includes(s.status || s.state)).map((session) => (
                <div key={session.id} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{session.tableId || 'Unknown Table'}</h4>
                      <p className="text-sm text-zinc-400">{session.customerName || 'Guest Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-teal-400 font-medium">{session.status || session.state}</p>
                      <p className="text-xs text-zinc-500">FOH Stage</p>
                    </div>
                  </div>
                </div>
              ))}
              {sessions.filter(s => ['OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE'].includes(s.status || s.state)).length === 0 && (
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
              {sessions.filter(s => ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'FAILED_PAYMENT'].includes(s.status || s.state)).map((session) => (
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
              {sessions.filter(s => ['STAFF_HOLD', 'STOCK_BLOCKED', 'REMAKE', 'REFUND_REQUESTED', 'FAILED_PAYMENT'].includes(s.status || s.state)).length === 0 && (
                <p className="text-zinc-400 text-center py-8">No edge cases requiring attention</p>
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
              <p className="text-2xl font-bold text-white mt-1">{sessions.length}</p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-400" />
                <span className="text-sm text-zinc-400">Active</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {sessions.filter(s => (s.status || s.state) === 'ACTIVE').length}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-zinc-400">BOH Prep</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {sessions.filter(s => ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(s.status || s.state)).length}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-teal-400" />
                <span className="text-sm text-zinc-400">FOH Delivery</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {sessions.filter(s => ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status || s.state)).length}
              </p>
            </div>
          </div>

          {/* Workflow State Breakdown */}
          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Timer className="w-5 h-5 text-purple-400" />
              <span>Workflow State Breakdown</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(STATUS_COLORS).map(([status, colorClass]) => {
                const count = sessions.filter(s => (s.status || s.state) === status).length;
                const displayName = getSessionDisplayName(status as SessionStatus);
                const icon = STATE_ICONS[status as SessionStatus];
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
          </div>
        </div>
      )}
    </div>
  );
}
