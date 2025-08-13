"use client";

import React, { useState, useEffect } from 'react';

interface ReflexScore {
  score: number;
  timestamp: string;
  category: 'ui' | 'ux' | 'performance' | 'accessibility';
  details: string;
}

interface MoodbookReflexPanelProps {
  initialScore?: number;
  showLogPreview?: boolean;
  enableOnboarding?: boolean;
  threshold?: number;
  className?: string;
  onScoreUpdate?: (score: number) => void;
  onOnboardingComplete?: () => void;
}

export default function MoodbookReflexPanel({
  initialScore = 0,
  showLogPreview = true,
  enableOnboarding = true,
  threshold = 92,
  className = '',
  onScoreUpdate,
  onOnboardingComplete
}: MoodbookReflexPanelProps) {
  const [reflexScore, setReflexScore] = useState<number>(initialScore);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [reflexLogs, setReflexLogs] = useState<ReflexScore[]>([]);
  const [showFallbackModal, setShowFallbackModal] = useState<boolean>(false);

  // SSR/CSR hybrid logic
  useEffect(() => {
    setIsClient(true);
    
    // Check if onboarding is needed
    if (enableOnboarding && reflexScore < threshold) {
      setIsOnboarding(true);
    }
  }, [enableOnboarding, reflexScore, threshold]);

  // Simulate reflex score calculation
  const calculateReflexScore = () => {
    const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
    const newScore = Math.min(100, baseScore + Math.floor(Math.random() * 20));
    
    setReflexScore(newScore);
    
    // Add to log
    const newLog: ReflexScore = {
      score: newScore,
      timestamp: new Date().toISOString(),
      category: ['ui', 'ux', 'performance', 'accessibility'][Math.floor(Math.random() * 4)] as any,
      details: `Reflex score calculated: ${newScore}/100`
    };
    
    setReflexLogs(prev => [newLog, ...prev.slice(0, 9)]); // Keep last 10 logs
    
    if (onScoreUpdate) {
      onScoreUpdate(newScore);
    }
    
    // Check if onboarding can be completed
    if (newScore >= threshold && isOnboarding) {
      setIsOnboarding(false);
      if (onOnboardingComplete) {
        onOnboardingComplete();
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= threshold) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreStatus = (score: number) => {
    if (score >= threshold) return 'Optimal';
    if (score >= 80) return 'Good';
    return 'Needs Improvement';
  };

  // SSR fallback modal
  const renderFallbackModal = () => {
    if (!isClient || !showFallbackModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-surface border border-text/20 rounded-2xl p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-semibold mb-4">Onboarding Required</h3>
          <p className="text-text-light mb-4">
            Your reflex score is below the optimal threshold. Complete onboarding to improve your experience.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFallbackModal(false)}
              className="px-4 py-2 border border-text/20 rounded-lg hover:bg-text/5"
            >
              Later
            </button>
            <button
              onClick={() => {
                setShowFallbackModal(false);
                setIsOnboarding(true);
              }}
              className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary-dark"
            >
              Start Onboarding
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-surface border border-text/10 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Moodbook Reflex Panel</h3>
          <p className="text-sm text-text-light">Dynamic UI/UX scoring & onboarding</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(reflexScore)}`}>
            {reflexScore}/100
          </div>
          <div className="text-sm text-text-light">{getScoreStatus(reflexScore)}</div>
        </div>
      </div>

      {/* Score Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Current Score</span>
          <span>Target: {threshold}+</span>
        </div>
        <div className="w-full bg-text/10 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              reflexScore >= threshold ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(100, (reflexScore / 100) * 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={calculateReflexScore}
          className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary-dark transition-colors"
        >
          Calculate Score
        </button>
        {enableOnboarding && reflexScore < threshold && (
          <button
            onClick={() => setIsOnboarding(true)}
            className="px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            Start Onboarding
          </button>
        )}
        {!isClient && (
          <button
            onClick={() => setShowFallbackModal(true)}
            className="px-4 py-2 border border-text/20 rounded-lg hover:bg-text/5 transition-colors"
          >
            SSR Onboarding
          </button>
        )}
      </div>

      {/* Onboarding Status */}
      {isOnboarding && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-primary font-medium">Onboarding in progress...</span>
          </div>
          <p className="text-sm text-text-light mt-2">
            Complete the onboarding process to reach the optimal reflex score threshold.
          </p>
        </div>
      )}

      {/* Log Preview */}
      {showLogPreview && reflexLogs.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Recent Reflex Logs</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {reflexLogs.map((log, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-text/5 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  log.score >= threshold ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{log.category}</span>
                    <span className={`text-sm font-bold ${getScoreColor(log.score)}`}>
                      {log.score}
                    </span>
                  </div>
                  <p className="text-xs text-text-light truncate">{log.details}</p>
                  <p className="text-xs text-text-light">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CI/CD Integration Hint */}
      <div className="mt-6 p-4 bg-text/5 rounded-lg border border-text/10">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-sm font-medium text-blue-500">CI/CD Ready</span>
        </div>
        <p className="text-xs text-text-light">
          ReflexScore integration prepared for automated preflight checks and deployment validation.
        </p>
      </div>

      {/* SSR Fallback Modal */}
      {renderFallbackModal()}
    </div>
  );
}
