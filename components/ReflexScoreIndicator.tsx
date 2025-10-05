// components/ReflexScoreIndicator.tsx
// Reflex Score Indicator - Real-time score display component

import React from 'react';
import type { ReflexScore, GateDecision } from '../types/reflex';

interface ReflexScoreIndicatorProps {
  score: ReflexScore;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showGateDecision?: boolean;
  className?: string;
}

export default function ReflexScoreIndicator({
  score,
  showDetails = false,
  size = 'md',
  showGateDecision = true,
  className = ''
}: ReflexScoreIndicatorProps) {
  const getScoreColor = (value: number): string => {
    if (value >= 0.92) return 'text-green-600';
    if (value >= 0.87) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (value: number): string => {
    if (value >= 0.92) return 'bg-green-100';
    if (value >= 0.87) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getGateIcon = (decision: GateDecision): string => {
    switch (decision) {
      case 'proceed': return '✅';
      case 'recover': return '⚠️';
      case 'halt': return '❌';
      default: return '❓';
    }
  };

  const getGateColor = (decision: GateDecision): string => {
    switch (decision) {
      case 'proceed': return 'text-green-600';
      case 'recover': return 'text-yellow-600';
      case 'halt': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-2',
          score: 'text-lg',
          label: 'text-xs',
          detail: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-6',
          score: 'text-4xl',
          label: 'text-lg',
          detail: 'text-sm'
        };
      default: // md
        return {
          container: 'p-4',
          score: 'text-2xl',
          label: 'text-sm',
          detail: 'text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`${getScoreBgColor(score.value)} rounded-lg ${sizeClasses.container} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`${getScoreColor(score.value)} font-bold ${sizeClasses.score}`}>
            {Math.round(score.value * 100)}
          </div>
          <div>
            <div className={`${getScoreColor(score.value)} font-medium ${sizeClasses.label}`}>
              Reflex Score
            </div>
            {showGateDecision && (
              <div className={`${getGateColor(score.gateDecision)} ${sizeClasses.detail} flex items-center`}>
                <span className="mr-1">{getGateIcon(score.gateDecision)}</span>
                {score.gateDecision.toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        {showDetails && (
          <div className="text-right">
            <div className={`text-gray-600 ${sizeClasses.detail}`}>
              Confidence: {Math.round(score.confidence * 100)}%
            </div>
            <div className={`text-gray-500 ${sizeClasses.detail}`}>
              {new Date(score.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium text-gray-700">Score Components</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Accuracy</span>
              <span className={`text-xs font-medium ${getScoreColor(score.components.accuracy)}`}>
                {Math.round(score.components.accuracy * 100)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Completeness</span>
              <span className={`text-xs font-medium ${getScoreColor(score.components.completeness)}`}>
                {Math.round(score.components.completeness * 100)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Consistency</span>
              <span className={`text-xs font-medium ${getScoreColor(score.components.consistency)}`}>
                {Math.round(score.components.consistency * 100)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Efficiency</span>
              <span className={`text-xs font-medium ${getScoreColor(score.components.efficiency)}`}>
                {Math.round(score.components.efficiency * 100)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Security</span>
              <span className={`text-xs font-medium ${getScoreColor(score.components.security)}`}>
                {Math.round(score.components.security * 100)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
