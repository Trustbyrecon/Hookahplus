"use client";

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Flame, 
  Plus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useSessionTimer } from '../hooks/useSessionTimer';

interface SessionTimerBarProps {
  sessionId: string;
  durationMinutes: number;
  onComplete?: () => void;
  onExtend?: (minutes: number) => void;
  showControls?: boolean;
  showProgress?: boolean;
  showAlerts?: boolean;
  className?: string;
  variant?: 'compact' | 'full' | 'minimal';
}

export const SessionTimerBar: React.FC<SessionTimerBarProps> = ({
  sessionId,
  durationMinutes,
  onComplete,
  onExtend,
  showControls = true,
  showProgress = true,
  showAlerts = true,
  className,
  variant = 'full'
}) => {
  const [showExtendOptions, setShowExtendOptions] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  const timer = useSessionTimer({
    sessionId,
    durationMinutes,
    onComplete: () => {
      if (onComplete) onComplete();
      if (showAlerts) {
        setAlerts(prev => [...prev, 'Session completed!']);
        setTimeout(() => setAlerts(prev => prev.slice(1)), 5000);
      }
    },
    onWarning: (timeRemaining) => {
      if (showAlerts) {
        setAlerts(prev => [...prev, `Warning: ${Math.floor(timeRemaining / 60)} minutes remaining`]);
        setTimeout(() => setAlerts(prev => prev.slice(1)), 3000);
      }
    },
    onCritical: (timeRemaining) => {
      if (showAlerts) {
        setAlerts(prev => [...prev, `Critical: ${timeRemaining} seconds remaining!`]);
        setTimeout(() => setAlerts(prev => prev.slice(1)), 2000);
      }
    }
  });

  const handleExtend = (minutes: number) => {
    timer.extend(minutes);
    if (onExtend) onExtend(minutes);
    setShowExtendOptions(false);
  };

  const dismissAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Clock className="w-4 h-4 text-zinc-400" />
        <span className={cn('text-sm font-medium', timer.getTimeColor())}>
          {timer.formatTime(timer.timeRemaining)}
        </span>
        {timer.isLowTime && <Flame className="w-3 h-3 text-orange-400" />}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {/* Timer Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className={cn('text-lg font-bold', timer.getTimeColor())}>
              {timer.formatTime(timer.timeRemaining)}
            </span>
            {timer.isLowTime && <Flame className="w-4 h-4 text-orange-400" />}
            {timer.isTimeUp && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-1">
              {!timer.isRunning && !timer.isTimeUp && (
                <button
                  onClick={timer.start}
                  className="p-1 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  <Play className="w-3 h-3" />
                </button>
              )}
              {timer.isRunning && (
                <button
                  onClick={timer.pause}
                  className="p-1 bg-orange-600 hover:bg-orange-700 text-white rounded"
                >
                  <Pause className="w-3 h-3" />
                </button>
              )}
              {timer.isPaused && (
                <button
                  onClick={timer.resume}
                  className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  <Play className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={timer.reset}
                className="p-1 bg-zinc-600 hover:bg-zinc-700 text-white rounded"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-1000',
                timer.isTimeUp ? 'bg-red-500' : 'bg-teal-500'
              )}
              style={{ width: `${timer.getProgressPercentage()}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn('space-y-4', className)}>
      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-400 text-sm"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{alert}</span>
              </div>
              <button
                onClick={() => dismissAlert(index)}
                className="text-orange-400 hover:text-orange-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Timer Display */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-teal-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Session Timer</h3>
              <p className="text-sm text-zinc-400">
                {timer.isTimeUp ? 'Session Complete' : 
                 timer.isPaused ? 'Session Paused' : 
                 timer.isRunning ? 'Session Active' : 'Session Ready'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={cn('text-3xl font-bold', timer.getTimeColor())}>
              {timer.formatTime(timer.timeRemaining)}
            </div>
            <div className="text-sm text-zinc-400">
              {timer.formatTime(timer.elapsedTime)} elapsed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full bg-zinc-700 rounded-full h-3 mb-4">
            <div
              className={cn(
                'h-3 rounded-full transition-all duration-1000',
                timer.isTimeUp ? 'bg-red-500' : 'bg-teal-500'
              )}
              style={{ width: `${timer.getProgressPercentage()}%` }}
            />
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {timer.isLowTime && !timer.isTimeUp && (
              <div className="flex items-center space-x-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span>Time running low!</span>
              </div>
            )}
            {timer.isTimeUp && (
              <div className="flex items-center space-x-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Session Complete!</span>
              </div>
            )}
          </div>
          
          <div className="text-zinc-400">
            {Math.round(timer.getProgressPercentage())}% complete
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-center space-x-3 mt-4 pt-4 border-t border-zinc-700">
            {!timer.isRunning && !timer.isTimeUp && (
              <button
                onClick={timer.start}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Start</span>
              </button>
            )}
            
            {timer.isRunning && (
              <button
                onClick={timer.pause}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}
            
            {timer.isPaused && (
              <button
                onClick={timer.resume}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
            )}
            
            <button
              onClick={timer.reset}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            {onExtend && (
              <div className="relative">
                <button
                  onClick={() => setShowExtendOptions(!showExtendOptions)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Extend</span>
                </button>
                
                {showExtendOptions && (
                  <div className="absolute top-full right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg p-2 shadow-lg z-10">
                    <div className="space-y-1">
                      {[15, 30, 45, 60].map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => handleExtend(minutes)}
                          className="block w-full text-left px-3 py-1 text-sm text-white hover:bg-zinc-700 rounded"
                        >
                          +{minutes} minutes
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
