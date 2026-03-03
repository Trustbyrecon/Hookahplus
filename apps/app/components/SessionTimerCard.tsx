"use client";

import React, { useState, useEffect } from 'react';
import { Session } from '../types/session';
import { SessionTimerService, TimerState } from '../lib/sessionTimerService';
import { Play, Pause, RotateCcw, Clock, Flame, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

interface SessionTimerCardProps {
  session: Session;
  onTimerUpdate?: (sessionId: string, timerState: TimerState) => void;
  onTimerComplete?: (sessionId: string) => void;
  className?: string;
}

export function SessionTimerCard({ 
  session, 
  onTimerUpdate, 
  onTimerComplete,
  className 
}: SessionTimerCardProps) {
  const [timerState, setTimerState] = useState<TimerState>(
    SessionTimerService.calculateTimerState(session)
  );
  const [isInitialized, setIsInitialized] = useState(false);

  const timerService = SessionTimerService.getInstance();

  useEffect(() => {
    if (!isInitialized && session.timerDuration) {
      setIsInitialized(true);
      
      const handleTimerUpdate = (state: TimerState) => {
        setTimerState(state);
        onTimerUpdate?.(session.id, state);
        
        if (state.timeRemaining <= 0) {
          onTimerComplete?.(session.id);
        }
      };

      // If session is active and timer should be running, start it
      if (session.state === 'ACTIVE' && session.timerStatus === 'running') {
        timerService.startTimer(session.id, session.timerDuration, handleTimerUpdate);
      }
    }

    return () => {
      timerService.stopTimer(session.id);
    };
  }, [session.id, session.timerDuration, session.state, session.timerStatus, isInitialized, onTimerUpdate, onTimerComplete, timerService]);

  const handleStart = () => {
    if (session.timerDuration) {
      timerService.startTimer(session.id, session.timerDuration, (state) => {
        setTimerState(state);
        onTimerUpdate?.(session.id, state);
      });
    }
  };

  const handlePause = () => {
    timerService.pauseTimer(session.id);
  };

  const handleResume = () => {
    timerService.resumeTimer(session.id);
  };

  const handleReset = () => {
    timerService.stopTimer(session.id);
    const resetState = SessionTimerService.calculateTimerState(session);
    setTimerState(resetState);
  };

  const formatTime = (seconds: number) => {
    return SessionTimerService.formatTime(seconds);
  };

  const getTimerColor = () => {
    if (!session.timerDuration) return 'text-zinc-400';
    return SessionTimerService.getTimerColor(timerState.timeRemaining, session.timerDuration * 60);
  };

  const getProgressPercentage = () => {
    if (!session.timerDuration) return 0;
    return ((session.timerDuration * 60 - timerState.timeRemaining) / (session.timerDuration * 60)) * 100;
  };

  const isTimeUp = timerState.timeRemaining <= 0;
  const isLowTime = timerState.timeRemaining < 300; // Less than 5 minutes
  const isCriticalTime = timerState.timeRemaining < 60; // Less than 1 minute

  if (!session.timerDuration) {
    return null;
  }

  return (
    <div className={cn(
      'bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 rounded-xl p-4',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-teal-400" />
          <h4 className="text-sm font-semibold text-white">Session Timer</h4>
        </div>
        <div className="text-xs text-zinc-400">
          Table {session.tableId}
        </div>
      </div>

      <div className="text-center mb-4">
        <div className={cn(
          'text-3xl font-bold mb-2',
          getTimerColor()
        )}>
          {formatTime(timerState.timeRemaining)}
        </div>

        <div className="w-full bg-zinc-700 rounded-full h-2 mb-3">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-1000',
              isTimeUp ? 'bg-red-500' : 
              isCriticalTime ? 'bg-red-400' :
              isLowTime ? 'bg-orange-400' : 'bg-teal-500'
            )}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {isLowTime && !isTimeUp && (
          <div className="flex items-center justify-center space-x-2 text-orange-400 animate-pulse">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isCriticalTime ? 'Time almost up!' : 'Time running low!'}
            </span>
          </div>
        )}

        {isTimeUp && (
          <div className="flex items-center justify-center space-x-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Session Complete!</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {!timerState.isRunning && !timerState.isPaused && (
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </button>
        )}

        {timerState.isRunning && (
          <button
            onClick={handlePause}
            className="flex-1 flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>
        )}

        {timerState.isPaused && (
          <button
            onClick={handleResume}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Resume</span>
          </button>
        )}

        <button
          onClick={handleReset}
          className="flex items-center justify-center space-x-2 bg-zinc-600 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 text-xs text-zinc-400 text-center">
        {timerState.isRunning && 'Timer running'}
        {timerState.isPaused && 'Timer paused'}
        {!timerState.isRunning && !timerState.isPaused && 'Timer stopped'}
      </div>
    </div>
  );
}
