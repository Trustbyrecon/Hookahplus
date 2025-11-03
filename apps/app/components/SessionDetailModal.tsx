"use client";

import React from 'react';
import { X, Clock, MapPin, Sparkles, Users, Calendar, DollarSign, Shield, AlertCircle } from 'lucide-react';
import Card from './Card';
import { FireSession } from '../types/enhancedSession';
import { calculateSingleSessionTrustScore, getTrustScoreColor } from '../lib/trustScoring';
import { formatDuration } from '../lib/sessionStateMachine';

interface SessionDetailModalProps {
  session: FireSession | null;
  isOpen: boolean;
  onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
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
        {session.notes && (
          <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
            <span className="text-sm text-zinc-400 mb-2 block">Notes:</span>
            <p className="text-white">{session.notes}</p>
          </div>
        )}

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
    </div>
  );
};

export default SessionDetailModal;

