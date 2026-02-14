"use client";

import React, { useState } from "react";
import { CheckCircle, AlertTriangle, Clock, User, MessageSquare, X, Edit3, Trash2 } from "lucide-react";
import Button from "./Button";

export interface ResolutionNote {
  id: string;
  sessionId: string;
  issueType: 'premature_close' | 'equipment_failure' | 'customer_complaint' | 'staff_error' | 'other';
  description: string;
  resolution: string;
  resolvedBy: string;
  resolvedAt: Date;
  status: 'resolved' | 'escalated' | 'pending_review';
  escalatedTo?: string;
  customerCompensation?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
}

interface ResolutionNotesProps {
  sessionId: string;
  sessionState: string;
  onResolutionAdded?: (note: ResolutionNote) => void;
  onResolutionUpdated?: (noteId: string, updates: Partial<ResolutionNote>) => void;
  onResumeSession?: () => void;
}

export function ResolutionNotes({ 
  sessionId, 
  sessionState, 
  onResolutionAdded, 
  onResolutionUpdated,
  onResumeSession 
}: ResolutionNotesProps) {
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [editingResolution, setEditingResolution] = useState<ResolutionNote | null>(null);
  const [resolutions, setResolutions] = useState<ResolutionNote[]>([
    {
      id: 'res_1',
      sessionId: sessionId,
      issueType: 'premature_close',
      description: 'Session closed prematurely due to equipment malfunction',
      resolution: 'Equipment replaced and session can be resumed',
      resolvedBy: 'Mike Rodriguez',
      resolvedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'resolved',
      customerCompensation: 'Free refill offered',
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
    }
  ]);

  const [newResolution, setNewResolution] = useState({
    issueType: 'premature_close' as ResolutionNote['issueType'],
    description: '',
    resolution: '',
    customerCompensation: '',
    escalatedTo: '',
    followUpRequired: false
  });

  const handleCreateResolution = () => {
    if (!newResolution.description.trim() || !newResolution.resolution.trim()) return;

    const resolution: ResolutionNote = {
      id: `res_${Date.now()}`,
      sessionId,
      issueType: newResolution.issueType,
      description: newResolution.description,
      resolution: newResolution.resolution,
      resolvedBy: 'Current User',
      resolvedAt: new Date(),
      status: 'resolved',
      escalatedTo: newResolution.escalatedTo || undefined,
      customerCompensation: newResolution.customerCompensation || undefined,
      followUpRequired: newResolution.followUpRequired,
      followUpDate: newResolution.followUpRequired ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
    };

    setResolutions(prev => [resolution, ...prev]);
    setNewResolution({
      issueType: 'premature_close',
      description: '',
      resolution: '',
      customerCompensation: '',
      escalatedTo: '',
      followUpRequired: false
    });
    setShowResolutionModal(false);
    onResolutionAdded?.(resolution);
  };

  const handleUpdateResolution = (resolutionId: string, updates: Partial<ResolutionNote>) => {
    setResolutions(prev => prev.map(res => 
      res.id === resolutionId ? { ...res, ...updates } : res
    ));
    onResolutionUpdated?.(resolutionId, updates);
    setEditingResolution(null);
  };

  const handleResumeSession = () => {
    onResumeSession?.();
  };

  const getIssueTypeColor = (type: ResolutionNote['issueType']) => {
    switch (type) {
      case 'premature_close': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'equipment_failure': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'customer_complaint': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'staff_error': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getStatusColor = (status: ResolutionNote['status']) => {
    switch (status) {
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'escalated': return 'text-orange-400 bg-orange-500/20';
      case 'pending_review': return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getIssueTypeIcon = (type: ResolutionNote['issueType']) => {
    switch (type) {
      case 'premature_close': return '⚠️';
      case 'equipment_failure': return '🔧';
      case 'customer_complaint': return '😞';
      case 'staff_error': return '👤';
      default: return '❓';
    }
  };

  const canResumeSession = sessionState === 'CANCELLED' || sessionState === 'COMPLETED';
  const hasResolutions = resolutions.length > 0;

  return (
    <div className="space-y-4">
      {/* Resolution Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-semibold text-zinc-300">Resolution Notes</span>
          {hasResolutions && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
              {resolutions.length}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowResolutionModal(true)}
          className="text-green-400 border-green-500/30 hover:bg-green-500/10"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          Add Resolution
        </Button>
      </div>

      {/* Resolution List */}
      {hasResolutions ? (
        <div className="space-y-3">
          {resolutions.map(resolution => (
            <div key={resolution.id} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIssueTypeColor(resolution.issueType)}`}>
                    <span className="mr-1">{getIssueTypeIcon(resolution.issueType)}</span>
                    {resolution.issueType.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resolution.status)}`}>
                    {resolution.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingResolution(resolution)}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateResolution(resolution.id, { status: 'escalated' })}
                    className="text-orange-400 hover:text-orange-300 p-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-xs text-zinc-400">Issue Description:</label>
                  <p className="text-sm text-zinc-300">{resolution.description}</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Resolution:</label>
                  <p className="text-sm text-zinc-300">{resolution.resolution}</p>
                </div>
                {resolution.customerCompensation && (
                  <div>
                    <label className="text-xs text-zinc-400">Customer Compensation:</label>
                    <p className="text-sm text-green-400">{resolution.customerCompensation}</p>
                  </div>
                )}
                {resolution.escalatedTo && (
                  <div>
                    <label className="text-xs text-zinc-400">Escalated To:</label>
                    <p className="text-sm text-orange-400">{resolution.escalatedTo}</p>
                  </div>
                )}
                {resolution.followUpRequired && resolution.followUpDate && (
                  <div>
                    <label className="text-xs text-zinc-400">Follow-up Required:</label>
                    <p className="text-sm text-yellow-400">
                      {resolution.followUpDate.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700">
                <div className="flex items-center space-x-3 text-xs text-zinc-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{resolution.resolvedBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{resolution.resolvedAt.toLocaleTimeString()}</span>
                  </div>
                </div>
                {canResumeSession && resolution.status === 'resolved' && (
                  <Button
                    size="sm"
                    onClick={handleResumeSession}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resume Session
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-zinc-500">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No resolution notes yet</p>
          <p className="text-xs text-zinc-600 mt-1">
            Add resolution notes when issues occur
          </p>
        </div>
      )}

      {/* Add Resolution Modal */}
      {showResolutionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Resolution Note</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowResolutionModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Issue Type</label>
                <select
                  value={newResolution.issueType}
                  onChange={(e) => setNewResolution(prev => ({ ...prev, issueType: e.target.value as ResolutionNote['issueType'] }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                >
                  <option value="premature_close">Premature Close</option>
                  <option value="equipment_failure">Equipment Failure</option>
                  <option value="customer_complaint">Customer Complaint</option>
                  <option value="staff_error">Staff Error</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Issue Description</label>
                <textarea
                  value={newResolution.description}
                  onChange={(e) => setNewResolution(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what went wrong..."
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Resolution</label>
                <textarea
                  value={newResolution.resolution}
                  onChange={(e) => setNewResolution(prev => ({ ...prev, resolution: e.target.value }))}
                  placeholder="How was this resolved?"
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Customer Compensation (Optional)</label>
                <input
                  type="text"
                  value={newResolution.customerCompensation}
                  onChange={(e) => setNewResolution(prev => ({ ...prev, customerCompensation: e.target.value }))}
                  placeholder="e.g., Free refill, Discount, etc."
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Escalate To (Optional)</label>
                <input
                  type="text"
                  value={newResolution.escalatedTo}
                  onChange={(e) => setNewResolution(prev => ({ ...prev, escalatedTo: e.target.value }))}
                  placeholder="Manager, Admin, etc."
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={newResolution.followUpRequired}
                  onChange={(e) => setNewResolution(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                  className="w-4 h-4 text-green-500 bg-zinc-800 border-zinc-700 rounded"
                />
                <label htmlFor="followUpRequired" className="text-sm text-zinc-300">
                  Follow-up required
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowResolutionModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateResolution}
                disabled={!newResolution.description.trim() || !newResolution.resolution.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Add Resolution
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
