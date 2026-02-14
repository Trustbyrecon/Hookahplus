'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface SessionExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  currentDuration: number; // minutes
  remainingTime: number; // seconds
  onExtensionComplete?: () => void;
}

const EXTENSION_OPTIONS = [
  { minutes: 15, label: '15 min', popular: false },
  { minutes: 30, label: '30 min', popular: true },
  { minutes: 45, label: '45 min', popular: false },
  { minutes: 60, label: '1 hour', popular: true },
  { minutes: 90, label: '1.5 hours', popular: false },
];

export default function SessionExtensionModal({
  isOpen,
  onClose,
  sessionId,
  currentDuration,
  remainingTime,
  onExtensionComplete
}: SessionExtensionModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [pricingModel, setPricingModel] = useState<'flat' | 'time-based'>('time-based');
  const [extensionCost, setExtensionCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extensionInfo, setExtensionInfo] = useState<{
    extensionCost: number;
    newDuration: number;
    canExtend: boolean;
  } | null>(null);

  // Fetch extension options when modal opens
  useEffect(() => {
    if (isOpen && sessionId) {
      fetchExtensionOptions();
    }
  }, [isOpen, sessionId, selectedMinutes, pricingModel]);

  const fetchExtensionOptions = async () => {
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/extend?minutes=${selectedMinutes}&pricingModel=${pricingModel}`
      );
      const data = await response.json();
      
      if (data.success) {
        setExtensionInfo(data);
        setExtensionCost(data.extensionCost);
      } else {
        setError(data.details || data.error || 'Failed to get extension options');
      }
    } catch (err) {
      console.error('Error fetching extension options:', err);
      setError('Failed to load extension options');
    }
  };

  const handleExtend = async () => {
    if (!extensionInfo?.canExtend) {
      setError('Session cannot be extended');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionMinutes: selectedMinutes,
          pricingModel
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = data.checkoutUrl;
        } else {
          // Immediate extension (internal lounge)
          alert(`Session extended by ${selectedMinutes} minutes!`);
          onExtensionComplete?.();
          onClose();
        }
      } else {
        setError(data.details || data.error || 'Failed to extend session');
      }
    } catch (err) {
      console.error('Error extending session:', err);
      setError('Failed to extend session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const remainingMinutes = Math.floor(remainingTime / 60);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-white">Extend Session</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Session Info */}
        <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Current Duration:</span>
              <span className="text-white font-medium">{currentDuration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Remaining Time:</span>
              <span className={`font-medium ${
                remainingMinutes < 5 ? 'text-red-400' :
                remainingMinutes < 10 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {remainingMinutes} minutes
              </span>
            </div>
          </div>
        </div>

        {/* Extension Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Select Extension Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EXTENSION_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                onClick={() => setSelectedMinutes(option.minutes)}
                className={`p-3 rounded-lg border transition-colors text-sm ${
                  selectedMinutes === option.minutes
                    ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600'
                } ${option.popular ? 'ring-2 ring-teal-500/50' : ''}`}
              >
                <div className="font-medium">{option.label}</div>
                {option.popular && (
                  <div className="text-xs text-teal-400 mt-1">Popular</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Model */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Pricing Model
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPricingModel('time-based')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                pricingModel === 'time-based'
                  ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <div className="font-medium">Time-Based</div>
              <div className="text-xs mt-1">$0.50 per minute</div>
            </button>
            <button
              onClick={() => setPricingModel('flat')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                pricingModel === 'flat'
                  ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <div className="font-medium">Flat Rate</div>
              <div className="text-xs mt-1">$30.00</div>
            </button>
          </div>
        </div>

        {/* Cost Summary */}
        {extensionInfo && (
          <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Extension:</span>
                <span className="text-white font-medium">+{selectedMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Extension Cost:</span>
                <span className="text-white font-medium">${extensionCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-700">
                <span className="text-zinc-400 font-medium">New Total Duration:</span>
                <span className="text-teal-400 font-bold">
                  {extensionInfo.newDuration} minutes
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg flex items-center space-x-2 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Validation Message */}
        {extensionInfo && !extensionInfo.canExtend && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg flex items-center space-x-2 text-yellow-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Session cannot be extended at this time</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExtend}
            disabled={loading || !extensionInfo?.canExtend}
            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                <span>Extend Session - ${extensionCost.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

