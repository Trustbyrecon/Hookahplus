'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, FileText, Flag } from 'lucide-react';

interface ReportEdgeCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  tableId?: string;
  onReport: (edgeCaseData: {
    sessionId: string;
    edgeCase: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reportedBy: string;
    tableId?: string;
  }) => Promise<void>;
  userRole?: string;
}

const EDGE_CASE_TYPES = [
  { value: 'EQUIPMENT_ISSUE', label: 'Equipment Issue', description: 'Hookah equipment malfunction or problem' },
  { value: 'CUSTOMER_COMPLAINT', label: 'Customer Complaint', description: 'Customer dissatisfaction or issue' },
  { value: 'STAFF_SHORTAGE', label: 'Staff Shortage', description: 'Not enough staff for current workload' },
  { value: 'INVENTORY_ISSUE', label: 'Inventory Issue', description: 'Missing flavors, coals, or supplies' },
  { value: 'PAYMENT_ISSUE', label: 'Payment Issue', description: 'Payment processing problem' },
  { value: 'SAFETY_CONCERN', label: 'Safety Concern', description: 'Health or safety issue requiring attention' },
  { value: 'OTHER', label: 'Other Issue', description: 'Other issue requiring manager attention' }
];

const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  { value: 'HIGH', label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { value: 'CRITICAL', label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' }
];

export default function ReportEdgeCaseModal({
  isOpen,
  onClose,
  sessionId,
  tableId,
  onReport,
  userRole = 'STAFF'
}: ReportEdgeCaseModalProps) {
  const [edgeCaseType, setEdgeCaseType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!edgeCaseType) {
      setError('Please select an issue type');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onReport({
        sessionId,
        edgeCase: edgeCaseType,
        description: description.trim(),
        severity,
        reportedBy: userRole,
        tableId
      });
      
      // Reset form
      setEdgeCaseType('');
      setDescription('');
      setSeverity('MEDIUM');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report edge case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = EDGE_CASE_TYPES.find(t => t.value === edgeCaseType);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl w-full max-w-2xl border border-zinc-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Flag className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Report Issue</h2>
              <p className="text-sm text-zinc-400">
                Session: {sessionId.substring(0, 8)}... {tableId && `• Table: ${tableId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Edge Case Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Issue Type <span className="text-red-400">*</span>
            </label>
            <select
              value={edgeCaseType}
              onChange={(e) => setEdgeCaseType(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select an issue type...</option>
              {EDGE_CASE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {selectedType && (
              <p className="mt-2 text-xs text-zinc-400">{selectedType.description}</p>
            )}
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Severity <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setSeverity(level.value as any)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    severity === level.value
                      ? `${level.bg} border-${level.value.toLowerCase()}-500 ${level.color}`
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-sm font-medium">{level.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail. This will be sent to the manager for review..."
              rows={6}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              required
            />
            <p className="mt-2 text-xs text-zinc-400">
              Provide as much detail as possible. The manager will review this and take appropriate action.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !edgeCaseType || !description.trim()}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Reporting...</span>
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4" />
                  <span>Report Issue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

