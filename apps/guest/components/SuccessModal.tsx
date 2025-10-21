'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, X, ExternalLink, Flame, Sparkles, Star } from 'lucide-react';

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
  const [animationStep, setAnimationStep] = useState(0);

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

  // Animation sequence
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimationStep(1), 500);
      const timer2 = setTimeout(() => setAnimationStep(2), 1000);
      const timer3 = setTimeout(() => setAnimationStep(3), 1500);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setAnimationStep(0);
    }
  }, [isOpen]);

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
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Flavor Wheel Inspired Background */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 -right-10 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        {/* Header */}
        <div className="relative text-center p-6 pb-4">
          <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
          <p className="text-sm text-zinc-400">Hookah+ Session Management</p>
        </div>

        {/* Enhanced Success Icon with Flavor Wheel Animation */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative">
            {/* Outer Ring - Flavor Wheel Style */}
            <div className={`w-20 h-20 border-4 border-purple-500/30 rounded-full flex items-center justify-center transition-all duration-1000 ${
              animationStep >= 1 ? 'animate-spin' : 'opacity-0'
            }`}>
              <div className="w-16 h-16 border-4 border-pink-500/30 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500/30 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className={`w-6 h-6 text-green-400 transition-all duration-500 ${
                      animationStep >= 2 ? 'scale-110' : 'scale-0'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Flavor Elements */}
            {animationStep >= 2 && (
              <>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-100">
                  <Sparkles className="w-2 h-2 text-purple-400" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-300">
                  <Star className="w-2 h-2 text-pink-400" />
                </div>
                <div className="absolute top-0 -left-4 w-3 h-3 bg-orange-400 rounded-full animate-bounce delay-500">
                  <Flame className="w-2 h-2 text-orange-400" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 relative">
          <div className="text-center mb-6">
            <h3 className={`text-lg font-bold text-green-400 mb-2 transition-all duration-500 ${
              animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Session Started!
            </h3>
            <p className={`text-zinc-300 text-sm leading-relaxed transition-all duration-500 delay-200 ${
              animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {message}
            </p>
          </div>

          {/* Enhanced Action Buttons */}
          <div className={`space-y-3 transition-all duration-500 delay-300 ${
            animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {onAction && (
              <button
                onClick={onAction}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/25"
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

          {/* Enhanced Status Indicator */}
          <div className={`mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 transition-all duration-500 delay-500 ${
            animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
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
