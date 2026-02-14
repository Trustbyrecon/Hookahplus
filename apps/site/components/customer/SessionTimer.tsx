"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Card from '../Card';
import { Play, Pause, RotateCcw, Clock, Flame } from 'lucide-react';

export interface SessionTimerProps {
  duration: number; // in minutes
  onTimeUp?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  className?: string;
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  duration,
  onTimeUp,
  onPause,
  onResume,
  onReset,
  className
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, timeRemaining, onTimeUp]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration * 60 - timeRemaining) / (duration * 60)) * 100;
  };

  const getTimeColor = () => {
    const percentage = getProgressPercentage();
    if (percentage < 25) return 'text-green-400';
    if (percentage < 50) return 'text-yellow-400';
    if (percentage < 75) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsRunning(false);
    onPause?.();
  };

  const handleResume = () => {
    setIsPaused(false);
    setIsRunning(true);
    onResume?.();
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(duration * 60);
    onReset?.();
  };

  const isTimeUp = timeRemaining === 0;
  const isLowTime = timeRemaining < 300; // Less than 5 minutes

  return (
    <Card className={cn('p-6', className)}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Clock className="w-6 h-6 text-teal-400" />
          <h3 className="text-xl font-semibold text-white">Session Timer</h3>
        </div>
        
        <div className={cn(
          'text-4xl font-bold mb-2',
          getTimeColor()
        )}>
          {formatTime(timeRemaining)}
        </div>

        <div className="w-full bg-zinc-800 rounded-full h-3 mb-4">
          <div
            className={cn(
              'h-3 rounded-full transition-all duration-1000',
              isTimeUp ? 'bg-red-500' : 'bg-teal-500'
            )}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {isLowTime && !isTimeUp && (
          <div className="flex items-center justify-center space-x-2 text-orange-400 animate-pulse">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">Time running low!</span>
          </div>
        )}

        {isTimeUp && (
          <div className="flex items-center justify-center space-x-2 text-red-400">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">Session Complete!</span>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        {!isRunning && !isPaused && (
          <button
            onClick={handleStart}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Start Session</span>
          </button>
        )}

        {isRunning && (
          <button
            onClick={handlePause}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Pause className="w-5 h-5" />
            <span>Pause</span>
          </button>
        )}

        {isPaused && (
          <button
            onClick={handleResume}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Resume</span>
          </button>
        )}

        <button
          onClick={handleReset}
          className="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-zinc-400">
          Session Duration: {duration} minutes
        </p>
      </div>
    </Card>
  );
};

export default SessionTimer;
