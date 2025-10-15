"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Users, 
  CheckCircle, 
  Pause, 
  Play,
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
  Zap
} from 'lucide-react';

interface SimpleFSDDesignProps {
  sessions?: any[];
  userRole?: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onSessionAction?: (action: string, sessionId: string) => void;
  className?: string;
}

// Business Logic Framework - Complete Hookah Lounge Operations
const BUSINESS_LOGIC = {
  // BOH Actions
  START_PREP: {
    icon: <Package className="w-4 h-4" />,
    color: "bg-orange-500 hover:bg-orange-600",
    businessLogic: "BOH begins hookah preparation: coals heating, bowl packing, flavor mixing, quality preparation starts",
    nextState: "PREP_IN_PROGRESS"
  },
  PREP_COMPLETE: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "bg-green-500 hover:bg-green-600",
    businessLogic: "BOH completes preparation: hookah assembled, coals ready, quality checked, ready for FOH pickup",
    nextState: "READY_FOR_DELIVERY"
  },
  PREP_ISSUE: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "bg-red-500 hover:bg-red-600",
    businessLogic: "BOH encounters issue: equipment problem, flavor shortage, quality concern, needs resolution",
    nextState: "PREP_ISSUE"
  },
  BOH_REFILL: {
    icon: <RefreshCw className="w-4 h-4" />,
    color: "bg-orange-500 hover:bg-orange-600",
    businessLogic: "BOH handles refill: new coals, fresh flavor, bowl cleaning, preparation for continued session",
    nextState: "PREP_IN_PROGRESS"
  },
  HOLD_AT_BOH: {
    icon: <Home className="w-4 h-4" />,
    color: "bg-yellow-500 hover:bg-yellow-600",
    businessLogic: "Hold at BOH: customer not ready, table issue, special preparation needed, temporary hold",
    nextState: "BOH_HOLD"
  },

  // FOH Actions
  FOH_PICKUP: {
    icon: <Truck className="w-4 h-4" />,
    color: "bg-teal-500 hover:bg-teal-600",
    businessLogic: "FOH collects prepared hookah from BOH station, verifies completeness, begins delivery to table",
    nextState: "FOH_PICKUP"
  },
  DELIVER_TO_TABLE: {
    icon: <ArrowRight className="w-4 h-4" />,
    color: "bg-purple-500 hover:bg-purple-600",
    businessLogic: "FOH delivers hookah to table: setup complete, customer briefed, session begins",
    nextState: "ACTIVE"
  },
  RETURN_TO_BOH: {
    icon: <ArrowLeft className="w-4 h-4" />,
    color: "bg-red-500 hover:bg-red-600",
    businessLogic: "Return hookah to BOH: customer not at table, table issue, needs re-preparation",
    nextState: "PREP_IN_PROGRESS"
  },

  // Session Management
  PAUSE_SESSION: {
    icon: <Pause className="w-4 h-4" />,
    color: "bg-yellow-500 hover:bg-yellow-600",
    businessLogic: "Pause session: customer stepped away, coals cooling, timer paused, ready to resume",
    nextState: "PAUSED"
  },
  RESUME_SESSION: {
    icon: <Play className="w-4 h-4" />,
    color: "bg-green-500 hover:bg-green-600",
    businessLogic: "Resume session: customer returned, coals reheated, timer restarted, session continues",
    nextState: "ACTIVE"
  },
  REFILL_REQUEST: {
    icon: <Coffee className="w-4 h-4" />,
    color: "bg-blue-500 hover:bg-blue-600",
    businessLogic: "Customer requests refill: return to BOH for new coals/flavor, maintain session continuity",
    nextState: "REFILL_NEEDED"
  },
  COMPLETE_SESSION: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "bg-gray-500 hover:bg-gray-600",
    businessLogic: "Complete session: customer finished, cleanup required, payment processed, session closed",
    nextState: "COMPLETED"
  }
};

// Workflow State Definitions
const WORKFLOW_STATES = {
  CREATED: {
    name: "Created",
    color: "text-blue-400 bg-blue-500/10",
    icon: <Package className="w-4 h-4" />,
    description: "BOH begins hookah preparation: coals heating, bowl packing, flavor mixing",
    availableActions: ['START_PREP']
  },
  PREP_IN_PROGRESS: {
    name: "Prep In Progress",
    color: "text-orange-400 bg-orange-500/10",
    icon: <RefreshCw className="w-4 h-4" />,
    description: "BOH completes preparation: hookah assembled, coals ready, quality checked",
    availableActions: ['PREP_COMPLETE', 'PREP_ISSUE']
  },
  READY_FOR_DELIVERY: {
    name: "Ready for Delivery",
    color: "text-green-400 bg-green-500/10",
    icon: <Truck className="w-4 h-4" />,
    description: "FOH collects prepared hookah from BOH station, verifies completeness",
    availableActions: ['FOH_PICKUP', 'HOLD_AT_BOH']
  },
  FOH_PICKUP: {
    name: "FOH Pickup",
    color: "text-teal-400 bg-teal-500/10",
    icon: <Truck className="w-4 h-4" />,
    description: "FOH delivers hookah to table: setup complete, customer briefed",
    availableActions: ['DELIVER_TO_TABLE', 'RETURN_TO_BOH']
  },
  ACTIVE: {
    name: "Active",
    color: "text-green-400 bg-green-500/10",
    icon: <Play className="w-4 h-4" />,
    description: "Session running: customer enjoying hookah, timer active",
    availableActions: ['PAUSE_SESSION', 'REFILL_REQUEST', 'COMPLETE_SESSION']
  },
  PAUSED: {
    name: "Paused",
    color: "text-yellow-400 bg-yellow-500/10",
    icon: <Pause className="w-4 h-4" />,
    description: "Customer stepped away: coals cooling, timer paused",
    availableActions: ['RESUME_SESSION', 'COMPLETE_SESSION']
  },
  REFILL_NEEDED: {
    name: "Refill Needed",
    color: "text-blue-400 bg-blue-500/10",
    icon: <Coffee className="w-4 h-4" />,
    description: "Customer requests refill: return to BOH for new coals/flavor",
    availableActions: ['BOH_REFILL', 'COMPLETE_SESSION']
  },
  COMPLETED: {
    name: "Completed",
    color: "text-gray-400 bg-gray-500/10",
    icon: <CheckCircle className="w-4 h-4" />,
    description: "Session finished: customer completed, cleanup required",
    availableActions: []
  }
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

  const handleSessionAction = (action: string, sessionId: string) => {
    if (onSessionAction) {
      onSessionAction(action, sessionId);
    }
  };

  const getSessionState = (session: any) => {
    const status = session.status || session.state || 'CREATED';
    return WORKFLOW_STATES[status as keyof typeof WORKFLOW_STATES] || WORKFLOW_STATES.CREATED;
  };

  const getAvailableActions = (session: any) => {
    const state = getSessionState(session);
    return state.availableActions.map(actionKey => ({
      key: actionKey,
      ...BUSINESS_LOGIC[actionKey as keyof typeof BUSINESS_LOGIC]
    }));
  };

  const canUserPerformAction = (actionKey: string, userRole: string) => {
    // BOH Actions
    if (['START_PREP', 'PREP_COMPLETE', 'PREP_ISSUE', 'BOH_REFILL', 'HOLD_AT_BOH'].includes(actionKey)) {
      return ['BOH', 'MANAGER', 'ADMIN'].includes(userRole);
    }
    // FOH Actions
    if (['FOH_PICKUP', 'DELIVER_TO_TABLE', 'RETURN_TO_BOH'].includes(actionKey)) {
      return ['FOH', 'MANAGER', 'ADMIN'].includes(userRole);
    }
    // Universal Actions
    if (['PAUSE_SESSION', 'RESUME_SESSION', 'REFILL_REQUEST', 'COMPLETE_SESSION'].includes(actionKey)) {
      return true;
    }
    return false;
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
        {['overview', 'boh', 'foh'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-orange-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Sessions List */}
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
            const sessionState = getSessionState(session);
            const availableActions = getAvailableActions(session);
            const sessionId = session.id || session.session_id;

            return (
              <div
                key={sessionId}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors"
              >
                {/* Session Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${sessionState.color}`}>
                      {sessionState.icon}
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${sessionState.color}`}>
                      {sessionState.name}
                    </span>
                  </div>
                </div>

                {/* Business Logic Description */}
                <div className="mb-3 p-2 bg-zinc-900/50 rounded text-xs text-zinc-300">
                  <div className="flex items-center space-x-1 mb-1">
                    <Info className="w-3 h-3" />
                    <span className="font-medium">Current State:</span>
                  </div>
                  <p>{sessionState.description}</p>
                </div>

                {/* Available Actions */}
                {availableActions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1 text-xs text-zinc-400">
                      <Zap className="w-3 h-3" />
                      <span className="font-medium">Available Actions:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableActions.map((action) => {
                        const canPerform = canUserPerformAction(action.key, userRole);
                        return (
                          <div key={action.key} className="relative">
                            <button
                              onClick={() => canPerform && handleSessionAction(action.key.toLowerCase(), sessionId)}
                              disabled={!canPerform}
                              onMouseEnter={() => setHoveredAction(action.key)}
                              onMouseLeave={() => setHoveredAction(null)}
                              className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                canPerform 
                                  ? action.color 
                                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {action.icon}
                              <span>{action.key.replace(/_/g, ' ')}</span>
                              <Info className="w-3 h-3" />
                            </button>
                            
                            {/* Business Logic Tooltip */}
                            {hoveredAction === action.key && (
                              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-10">
                                <div className="flex items-center space-x-1 mb-1">
                                  <Info className="w-3 h-3 text-blue-400" />
                                  <span className="text-xs font-medium text-blue-400">Business Logic</span>
                                </div>
                                <p className="text-xs text-zinc-300">{action.businessLogic}</p>
                                <div className="mt-2 pt-2 border-t border-zinc-700">
                                  <p className="text-xs text-zinc-400">
                                    <span className="font-medium">Next State:</span> {action.nextState.replace(/_/g, ' ')}
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

                {/* Session Details */}
                <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
                  {session.flavor_mix && (
                    <p className="text-sm text-zinc-400">
                      <span className="font-medium">Flavors:</span> {Array.isArray(session.flavor_mix) ? session.flavor_mix.join(', ') : session.flavor_mix}
                    </p>
                  )}
                  {session.timer_duration && (
                    <p className="text-sm text-zinc-400">
                      <span className="font-medium">Duration:</span> {session.timer_duration} minutes
                    </p>
                  )}
                  {session.boh_staff && (
                    <p className="text-sm text-zinc-400">
                      <span className="font-medium">BOH Staff:</span> {session.boh_staff}
                    </p>
                  )}
                  {session.foh_staff && (
                    <p className="text-sm text-zinc-400">
                      <span className="font-medium">FOH Staff:</span> {session.foh_staff}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

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
                {sessions.filter(s => ['CREATED', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY'].includes(s.status || s.state)).length}
              </p>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-teal-400" />
                <span className="text-sm text-zinc-400">FOH Delivery</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {sessions.filter(s => ['FOH_PICKUP'].includes(s.status || s.state)).length}
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
              {Object.entries(WORKFLOW_STATES).map(([key, state]) => {
                const count = sessions.filter(s => (s.status || s.state) === key).length;
                return (
                  <div key={key} className="flex items-center space-x-2 p-2 rounded bg-zinc-900/50">
                    <div className={`p-1 rounded ${state.color}`}>
                      {state.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300 truncate">{state.name}</p>
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
