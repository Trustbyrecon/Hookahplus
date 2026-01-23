"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Clock, MapPin, Sparkles, Users, Calendar, DollarSign, Shield, AlertCircle,
  Flame, Package, CheckCircle, Truck, Play, Pause, Coffee, RefreshCw, Home,
  Zap, RotateCcw, CreditCard, Ban, Flag
} from 'lucide-react';
import ReportEdgeCaseModal from './ReportEdgeCaseModal';
import Card from './Card';
import { FireSession, SessionAction, SessionStatus, UserRole } from '../types/enhancedSession';
import { calculateSingleSessionTrustScore, getTrustScoreColor } from '../lib/trustScoring';
import { formatDuration, isValidTransition, canPerformAction } from '../lib/sessionStateMachine';
import { ACTION_TO_STATUS } from '../types/enhancedSession';
import CloseSessionModal from './CloseSessionModal';

interface SessionDetailModalProps {
  session: FireSession | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  refreshSessions?: () => void | Promise<void>;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
  userRole = 'MANAGER',
  refreshSessions,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  useEffect(() => {
    if (session) {
      setEditedNotes(session.notes || '');
    }
  }, [session]);

  if (!isOpen || !session) return null;

  const trustScore = calculateSingleSessionTrustScore(session);
  const trustScoreColor = getTrustScoreColor(trustScore);

  // Calculate session duration
  const sessionDuration = session.sessionTimer
    ? Math.floor(session.sessionTimer.remaining / 60)
    : session.sessionDuration
    ? Math.floor(session.sessionDuration / 60)
    : 0;

  // Format start time
  const startTime = session.sessionStartTime
    ? new Date(session.sessionStartTime).toLocaleString()
    : session.createdAt
    ? new Date(session.createdAt).toLocaleString()
    : 'Not started';

  // Calculate elapsed time
  const elapsedTime = session.sessionStartTime
    ? Math.floor((Date.now() - session.sessionStartTime) / 1000 / 60)
    : 0;

  // Get available actions for this session
  const getAvailableActions = (): SessionAction[] => {
    if (!session) return [];
    
    const status = session.status as SessionStatus;
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

  // Action icons mapping
  const ACTION_ICONS: Record<SessionAction, React.ReactNode> = {
    'CLAIM_PREP': <Package className="w-4 h-4" />,
    'HEAT_UP': <Flame className="w-4 h-4" />,
    'READY_FOR_DELIVERY': <CheckCircle className="w-4 h-4" />,
    'DELIVER_NOW': <Truck className="w-4 h-4" />,
    'MARK_DELIVERED': <CheckCircle className="w-4 h-4" />,
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
    'VOID_SESSION': <Ban className="w-4 h-4" />
  };

  // Action colors mapping
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

  // Action labels
  const ACTION_LABELS: Record<SessionAction, string> = {
    'CLAIM_PREP': 'Claim Prep',
    'HEAT_UP': 'Heat Up',
    'READY_FOR_DELIVERY': 'Ready for Delivery',
    'DELIVER_NOW': 'Deliver Now',
    'MARK_DELIVERED': 'Mark Delivered',
    'START_ACTIVE': 'Start Active',
    'PAUSE_SESSION': 'Pause Session',
    'RESUME_SESSION': 'Resume Session',
    'REQUEST_REFILL': 'Request Refill',
    'COMPLETE_REFILL': 'Complete Refill',
    'CLOSE_SESSION': 'Close Session',
    'PUT_ON_HOLD': 'Put on Hold',
    'RESOLVE_HOLD': 'Resolve Hold',
    'REQUEST_REMAKE': 'Request Remake',
    'PROCESS_REFUND': 'Process Refund',
    'VOID_SESSION': 'Void Session'
  };

  const handleSessionAction = async (action: SessionAction) => {
    if (!session || isExecutingAction) return;

    // Close session is special: optional staff note capture, non-blocking
    if (action === 'CLOSE_SESSION') {
      setShowCloseModal(true);
      return;
    }

    setIsExecutingAction(true);
    try {
      // Special handling for refill actions
      if (action === 'REQUEST_REFILL') {
        const response = await fetch(`/api/sessions/${session.id}/refill`, {
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
          if (refreshSessions) await refreshSessions();
        } else {
          throw new Error(result.details || result.error || 'Failed to request refill');
        }
        return;
      }

      if (action === 'COMPLETE_REFILL') {
        const response = await fetch(`/api/sessions/${session.id}/refill`, {
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
          if (refreshSessions) await refreshSessions();
        } else {
          throw new Error(result.details || result.error || 'Failed to complete refill');
        }
        return;
      }

      // Standard action handling
      const response = await fetch(`/api/sessions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action,
          userRole: userRole || 'MANAGER',
          operatorId: `user-${userRole?.toLowerCase() || 'manager'}`,
          notes: `Action ${action} executed by ${userRole || 'MANAGER'}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        // Use detailed error message from API if available
        const errorMessage = errorData.details || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success) {
        // Show success message
        const actionLabel = ACTION_LABELS[action] || action;
        alert(`✅ ${actionLabel} executed successfully!`);
        
        // Refresh sessions
        if (refreshSessions) {
          await refreshSessions();
        } else {
          window.location.reload();
        }
      } else {
        throw new Error(result.error || result.details || 'Action failed');
      }
    } catch (error) {
      console.error('Error executing session action:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute action';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleReportEdgeCase = async (edgeCaseData: {
    sessionId: string;
    edgeCase: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reportedBy: string;
    tableId?: string;
  }) => {
    try {
      const response = await fetch('/api/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report',
          data: edgeCaseData
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ Issue reported successfully!\n\nA manager will review this issue and take appropriate action.`);
        if (refreshSessions) await refreshSessions();
      } else {
        throw new Error(result.error || 'Failed to report issue');
      }
    } catch (error) {
      console.error('Error reporting edge case:', error);
      throw error;
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'UPDATE_NOTES',
          notes: editedNotes,
          userRole: userRole || 'MANAGER'
        })
      });
      
      if (response.ok) {
        setIsEditingNotes(false);
        alert('Notes saved successfully!');
        if (refreshSessions) await refreshSessions();
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to save notes' }));
        alert(`Failed to save notes: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-zinc-900 border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Session Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Session Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Session ID */}
          <div className="p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-zinc-400" />
              <span className="text-sm text-zinc-400">Session ID</span>
            </div>
            <p className="text-white font-mono text-sm">{session.id}</p>
          </div>

          {/* Table */}
          <div className="p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-zinc-400" />
              <span className="text-sm text-zinc-400">Table</span>
            </div>
            <p className="text-white font-semibold">{session.tableId}</p>
          </div>

          {/* Status */}
          <div className="p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-zinc-400">Status</span>
            </div>
            <p className="text-white font-semibold">{session.status}</p>
          </div>

          {/* Stage */}
          <div className="p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-zinc-400">Stage</span>
            </div>
            <p className="text-white font-semibold">{session.currentStage}</p>
          </div>

          {/* Flavor Mix */}
          {session.flavor && (
            <div className="p-4 bg-zinc-800 rounded-lg md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Flavor Mix</span>
              </div>
              <p className="text-white">{session.flavor}</p>
            </div>
          )}

          {/* Amount */}
          <div className="p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-zinc-400" />
              <span className="text-sm text-zinc-400">Amount</span>
            </div>
            <p className="text-green-400 font-semibold">
              ${(session.amount / 100).toFixed(2)}
            </p>
          </div>

          {/* Trust Score */}
          <div className="p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-zinc-400" />
              <span className="text-sm text-zinc-400">Trust Score</span>
            </div>
            <p className={`font-semibold text-xl ${trustScoreColor}`}>
              {trustScore}/100
            </p>
          </div>
        </div>

        {/* Timer Information */}
        {session.sessionTimer && (
          <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-zinc-400" />
              <span className="text-lg font-semibold text-white">Session Timer</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-zinc-400">Remaining:</span>
                <p className="text-white font-semibold">
                  {formatDuration(session.sessionTimer.remaining)}
                </p>
              </div>
              <div>
                <span className="text-sm text-zinc-400">Total Duration:</span>
                <p className="text-white font-semibold">
                  {formatDuration(session.sessionTimer.total)}
                </p>
              </div>
              <div>
                <span className="text-sm text-zinc-400">Status:</span>
                <p className="text-white font-semibold">
                  {session.sessionTimer.isActive ? 'Active' : 'Paused'}
                </p>
              </div>
              <div>
                <span className="text-sm text-zinc-400">Elapsed:</span>
                <p className="text-white font-semibold">
                  {elapsedTime} minutes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Staff Assignment */}
        <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-zinc-400" />
            <span className="text-lg font-semibold text-white">Staff Assignment</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-zinc-400">BOH:</span>
              <p className="text-white font-semibold">
                {session.assignedStaff?.boh || 'Not assigned'}
              </p>
            </div>
            <div>
              <span className="text-sm text-zinc-400">FOH:</span>
              <p className="text-white font-semibold">
                {session.assignedStaff?.foh || 'Not assigned'}
              </p>
            </div>
          </div>
        </div>

        {/* Session Timeline */}
        <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-zinc-400" />
            <span className="text-lg font-semibold text-white">Timeline</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Created:</span>
              <span className="text-white">
                {new Date(session.createdAt).toLocaleString()}
              </span>
            </div>
            {session.sessionStartTime && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Started:</span>
                <span className="text-white">{startTime}</span>
              </div>
            )}
            {session.updatedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Last Updated:</span>
                <span className="text-white">
                  {new Date(session.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400 font-medium">Session Notes:</span>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
          {isEditingNotes ? (
            <div className="space-y-2">
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder="Add session notes..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-600/50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditedNotes(session.notes || '');
                    setIsEditingNotes(false);
                  }}
                  disabled={isSaving}
                  className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white">{session.notes || 'No notes added yet'}</p>
          )}
        </div>

        {/* Edge Case */}
        {session.edgeCase && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">Edge Case</span>
            </div>
            <p className="text-yellow-200">{session.edgeCase}</p>
          </div>
        )}

        {/* Session Actions */}
        <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-zinc-400" />
            <span className="text-lg font-semibold text-white">Session Actions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getAvailableActions().map((action) => {
              const canPerform = canPerformAction(userRole as UserRole, action);
              return (
                <button
                  key={action}
                  onClick={() => handleSessionAction(action)}
                  disabled={!canPerform || isExecutingAction}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    canPerform && !isExecutingAction
                      ? ACTION_COLORS[action]
                      : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                  } text-white`}
                  title={!canPerform ? `This action requires different permissions` : ACTION_LABELS[action]}
                >
                  {ACTION_ICONS[action]}
                  <span>{ACTION_LABELS[action]}</span>
                </button>
              );
            })}
            {getAvailableActions().length === 0 && (
              <p className="text-zinc-400 text-sm">No actions available for this session state.</p>
            )}
            {/* Report Issue Button - Available for all staff roles */}
            {(userRole === 'BOH' || userRole === 'FOH' || userRole === 'MANAGER' || userRole === 'ADMIN') && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-600 hover:bg-red-700 text-white"
                title="Report an issue that requires manager attention"
              >
                <Flag className="w-4 h-4" />
                <span>Report Issue</span>
              </button>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </Card>

      {/* Report Edge Case Modal */}
      <ReportEdgeCaseModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        sessionId={session.id}
        tableId={session.tableId}
        onReport={handleReportEdgeCase}
        userRole={userRole}
      />

      <CloseSessionModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        sessionId={session.id}
        userRole={userRole}
        operatorId={`user-${userRole?.toLowerCase() || 'manager'}`}
        refreshSessions={refreshSessions}
      />
    </div>
  );
};

export default SessionDetailModal;
