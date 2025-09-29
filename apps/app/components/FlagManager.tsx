"use client";

import React, { useState } from "react";
import { AlertTriangle, Flag, CheckCircle, X, Clock, User } from "lucide-react";
import Button from "./Button";

export interface FlagIssue {
  id: string;
  sessionId: string;
  type: 'payment' | 'equipment' | 'customer' | 'staff' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: Date;
}

interface FlagManagerProps {
  sessionId: string;
  onFlagCreated?: (flag: FlagIssue) => void;
  onFlagResolved?: (flagId: string) => void;
}

export function FlagManager({ sessionId, onFlagCreated, onFlagResolved }: FlagManagerProps) {
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FlagIssue | null>(null);
  const [flags, setFlags] = useState<FlagIssue[]>([
    {
      id: 'flag_1',
      sessionId: sessionId,
      type: 'equipment',
      severity: 'medium',
      description: 'Hookah base cracked during session',
      reportedBy: 'BOH Staff',
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'open',
      assignedTo: 'Maintenance Team'
    }
  ]);

  const [newFlag, setNewFlag] = useState({
    type: 'equipment' as FlagIssue['type'],
    severity: 'medium' as FlagIssue['severity'],
    description: '',
    assignedTo: ''
  });

  const [resolution, setResolution] = useState('');

  const handleCreateFlag = () => {
    if (!newFlag.description.trim()) return;

    const flag: FlagIssue = {
      id: `flag_${Date.now()}`,
      sessionId,
      type: newFlag.type,
      severity: newFlag.severity,
      description: newFlag.description,
      reportedBy: 'Current User',
      reportedAt: new Date(),
      status: 'open',
      assignedTo: newFlag.assignedTo || undefined
    };

    setFlags(prev => [flag, ...prev]);
    setNewFlag({ type: 'equipment', severity: 'medium', description: '', assignedTo: '' });
    setShowFlagModal(false);
    onFlagCreated?.(flag);
  };

  const handleResolveFlag = (flagId: string) => {
    setFlags(prev => prev.map(flag => 
      flag.id === flagId 
        ? { 
            ...flag, 
            status: 'resolved' as const, 
            resolution, 
            resolvedAt: new Date() 
          }
        : flag
    ));
    setResolution('');
    setShowResolveModal(false);
    setSelectedFlag(null);
    onFlagResolved?.(flagId);
  };

  const getSeverityColor = (severity: FlagIssue['severity']) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
    }
  };

  const getStatusColor = (status: FlagIssue['status']) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-500/20';
      case 'investigating': return 'text-yellow-400 bg-yellow-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'closed': return 'text-gray-400 bg-gray-500/20';
    }
  };

  const openFlags = flags.filter(flag => flag.status === 'open' || flag.status === 'investigating');

  return (
    <div className="space-y-4">
      {/* Flag Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flag className="w-5 h-5 text-orange-400" />
          <span className="font-semibold">Flags ({openFlags.length})</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowFlagModal(true)}
          className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
        >
          <Flag className="w-4 h-4 mr-1" />
          Flag Issue
        </Button>
      </div>

      {/* Active Flags */}
      {openFlags.length > 0 ? (
        <div className="space-y-2">
          {openFlags.map(flag => (
            <div key={flag.id} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                      {flag.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}>
                      {flag.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-400">{flag.type}</span>
                  </div>
                  <p className="text-sm text-zinc-300 mb-2">{flag.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-zinc-400">
                    <span>Reported by: {flag.reportedBy}</span>
                    <span>{flag.reportedAt.toLocaleTimeString()}</span>
                    {flag.assignedTo && <span>Assigned to: {flag.assignedTo}</span>}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedFlag(flag);
                    setShowResolveModal(true);
                  }}
                  className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-zinc-400">
          <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No active flags</p>
        </div>
      )}

      {/* Flag Issue Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Flag Issue</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFlagModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Issue Type</label>
                <select
                  value={newFlag.type}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, type: e.target.value as FlagIssue['type'] }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="equipment">Equipment</option>
                  <option value="payment">Payment</option>
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Severity</label>
                <select
                  value={newFlag.severity}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, severity: e.target.value as FlagIssue['severity'] }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newFlag.description}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue..."
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Assign To (Optional)</label>
                <input
                  type="text"
                  value={newFlag.assignedTo}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Staff member or team"
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowFlagModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFlag}
                disabled={!newFlag.description.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <Flag className="w-4 h-4 mr-2" />
                Flag Issue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Issue Modal */}
      {showResolveModal && selectedFlag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Resolve Issue</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowResolveModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedFlag.severity)}`}>
                  {selectedFlag.severity.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-400">{selectedFlag.type}</span>
              </div>
              <p className="text-sm text-zinc-300">{selectedFlag.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Resolution</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="How was this issue resolved?"
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowResolveModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleResolveFlag(selectedFlag.id)}
                disabled={!resolution.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve Issue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
