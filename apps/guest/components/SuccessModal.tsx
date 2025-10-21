'use client';

import React, { useEffect } from 'react';
import { CheckCircle, X, ExternalLink } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = "Session Started Successfully!",
  message = "Your hookah session has been created and is now active. You can view the live session in the Fire Session Dashboard.",
  actionText = "Track My Session",
  onAction
}: SuccessModalProps) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="text-center p-6 pb-4">
          <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
          <p className="text-sm text-zinc-400">Hookah+ Session Management</p>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-green-400 mb-2">Session Started!</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            {onAction && (
              <button
                onClick={onAction}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {actionText}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          {/* Status Indicator */}
          <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Session is now live and being tracked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
