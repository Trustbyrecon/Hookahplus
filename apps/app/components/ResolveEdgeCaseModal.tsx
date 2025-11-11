'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, FileText } from 'lucide-react';

interface ResolveEdgeCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  edgeCaseType: string | null;
  onResolve: (sessionId: string, resolutionNotes: string) => Promise<void>;
}

export default function ResolveEdgeCaseModal({
  isOpen,
  onClose,
  sessionId,
  edgeCaseType,
  onResolve
}: ResolveEdgeCaseModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      setError('Please provide resolution notes');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onResolve(sessionId, notes.trim());
      setNotes('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve edge case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEdgeCaseDisplayName = (type: string | null): string => {
    if (!type) return 'Edge Case';
    
    const displayNames: Record<string, string> = {
      'EQUIPMENT_ISSUE': 'Equipment Issue',
      'CUSTOMER_NOT_FOUND': 'Customer Not Found',
      'PAYMENT_FAILED': 'Payment Failed',
      'HEALTH_SAFETY': 'Health & Safety',
      'OTHER': 'Other Issue'
    };
    
    return displayNames[type] || type.replace(/_/g, ' ');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl w-full max-w-2xl border border-zinc-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Resolve Edge Case</h2>
              <p className="text-sm text-zinc-400">Session: {sessionId.substring(0, 8)}...</p>
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
              Edge Case Type
            </label>
            <div className="px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <p className="text-white font-medium">{getEdgeCaseDisplayName(edgeCaseType)}</p>
            </div>
          </div>

          {/* Resolution Notes */}
          <div>
            <label htmlFor="resolution-notes" className="block text-sm font-medium text-zinc-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Resolution Notes
            </label>
            <textarea
              id="resolution-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe how this edge case was resolved. These notes will be used for daily briefings and coaching tips..."
              rows={6}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              required
            />
            <p className="mt-2 text-xs text-zinc-400">
              Detailed notes help improve operations and inform daily briefings and staff coaching.
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
              disabled={isSubmitting || !notes.trim()}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Resolving...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Resolve Edge Case</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

