"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { 
  AlertTriangle, 
  X, 
  Send, 
  Clock, 
  User, 
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';

export interface EdgeCase {
  id: string;
  type: 'equipment_issue' | 'customer_not_found' | 'payment_failed' | 'health_safety' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedBy: string;
  sessionId?: string;
  tableId?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

interface EdgeCaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (edgeCase: Omit<EdgeCase, 'id' | 'createdAt' | 'status'>) => void;
  onResolve: (edgeCaseId: string, resolution: string) => void;
  onEscalate: (edgeCaseId: string, reason: string) => void;
  activeEdgeCases: EdgeCase[];
  className?: string;
}

export const EdgeCaseDrawer: React.FC<EdgeCaseDrawerProps> = ({
  isOpen,
  onClose,
  onReport,
  onResolve,
  onEscalate,
  activeEdgeCases,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'active' | 'resolved'>('report');
  const [formData, setFormData] = useState({
    type: 'equipment_issue' as EdgeCase['type'],
    severity: 'medium' as EdgeCase['severity'],
    description: '',
    reportedBy: '',
    sessionId: '',
    tableId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEdgeCase, setSelectedEdgeCase] = useState<EdgeCase | null>(null);

  const edgeCaseTypes = [
    { value: 'equipment_issue', label: 'Equipment Issue', icon: '🔧', color: 'text-orange-400' },
    { value: 'customer_not_found', label: 'Customer Not Found', icon: '👤', color: 'text-blue-400' },
    { value: 'payment_failed', label: 'Payment Failed', icon: '💳', color: 'text-red-400' },
    { value: 'health_safety', label: 'Health & Safety', icon: '⚠️', color: 'text-red-500' },
    { value: 'other', label: 'Other', icon: '📝', color: 'text-gray-400' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-500', description: 'Minor issue' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500', description: 'Moderate issue' },
    { value: 'high', label: 'High', color: 'bg-orange-500', description: 'Serious issue' },
    { value: 'critical', label: 'Critical', color: 'bg-red-500', description: 'Urgent issue' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      await onReport({
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        reportedBy: formData.reportedBy || 'Anonymous',
        sessionId: formData.sessionId || undefined,
        tableId: formData.tableId || undefined
      });

      // Reset form
      setFormData({
        type: 'equipment_issue',
        severity: 'medium',
        description: '',
        reportedBy: '',
        sessionId: '',
        tableId: ''
      });

      // Switch to active tab to see the new report
      setActiveTab('active');
    } catch (error) {
      console.error('Failed to report edge case:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (edgeCaseId: string, resolution: string) => {
    try {
      await onResolve(edgeCaseId, resolution);
      setSelectedEdgeCase(null);
    } catch (error) {
      console.error('Failed to resolve edge case:', error);
    }
  };

  const handleEscalate = async (edgeCaseId: string, reason: string) => {
    try {
      await onEscalate(edgeCaseId, reason);
      setSelectedEdgeCase(null);
    } catch (error) {
      console.error('Failed to escalate edge case:', error);
    }
  };

  const getSeverityColor = (severity: EdgeCase['severity']) => {
    const level = severityLevels.find(s => s.value === severity);
    return level?.color || 'bg-gray-500';
  };

  const getTypeInfo = (type: EdgeCase['type']) => {
    return edgeCaseTypes.find(t => t.value === type) || edgeCaseTypes[0];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        'absolute right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-700 shadow-2xl transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Edge Cases</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700">
          {[
            { id: 'report', label: 'Report', icon: MessageSquare },
            { id: 'active', label: 'Active', icon: Clock, count: activeEdgeCases.length },
            { id: 'resolved', label: 'Resolved', icon: CheckCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'report' && (
            <div className="p-4 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Edge Case Type */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Issue Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {edgeCaseTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value as EdgeCase['type'] }))}
                        className={cn(
                          'flex items-center space-x-2 p-2 rounded-lg border text-sm transition-colors',
                          formData.type === type.value
                            ? 'border-teal-500 bg-teal-500/20 text-teal-400'
                            : 'border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        )}
                      >
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Severity
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {severityLevels.map((severity) => (
                      <button
                        key={severity.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, severity: severity.value as EdgeCase['severity'] }))}
                        className={cn(
                          'flex items-center space-x-2 p-2 rounded-lg border text-sm transition-colors',
                          formData.severity === severity.value
                            ? 'border-teal-500 bg-teal-500/20 text-teal-400'
                            : 'border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        )}
                      >
                        <div className={cn('w-3 h-3 rounded-full', severity.color)} />
                        <span>{severity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    required
                  />
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Table ID
                    </label>
                    <input
                      type="text"
                      value={formData.tableId}
                      onChange={(e) => setFormData(prev => ({ ...prev, tableId: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., T-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Reporter
                    </label>
                    <input
                      type="text"
                      value={formData.reportedBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, reportedBy: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!formData.description.trim() || isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Reporting...' : 'Report Issue'}</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'active' && (
            <div className="p-4 space-y-3">
              {activeEdgeCases.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-zinc-400">No active edge cases</p>
                </div>
              ) : (
                activeEdgeCases.map((edgeCase) => {
                  const typeInfo = getTypeInfo(edgeCase.type);
                  return (
                    <div
                      key={edgeCase.id}
                      className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 cursor-pointer hover:bg-zinc-800/70 transition-colors"
                      onClick={() => setSelectedEdgeCase(edgeCase)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{typeInfo.icon}</span>
                          <span className="font-medium text-white">{typeInfo.label}</span>
                          <div className={cn('w-2 h-2 rounded-full', getSeverityColor(edgeCase.severity))} />
                        </div>
                        <span className="text-xs text-zinc-400">
                          {formatTimeAgo(edgeCase.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 mb-2">{edgeCase.description}</p>
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Table: {edgeCase.tableId || 'N/A'}</span>
                        <span>By: {edgeCase.reportedBy}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'resolved' && (
            <div className="p-4">
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-zinc-400">Resolved cases will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
