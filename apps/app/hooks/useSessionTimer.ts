"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionTimerService, TimerState } from '../lib/sessionTimerService';

export interface UseSessionTimerOptions {
  sessionId: string;
  durationMinutes?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  onUpdate?: (state: TimerState) => void;
  onWarning?: (timeRemaining: number) => void;
  onCritical?: (timeRemaining: number) => void;
}

export interface UseSessionTimerReturn {
  // Timer state
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  elapsedTime: number; // in seconds
  totalDuration: number; // in seconds
  
  // Timer controls
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  extend: (minutes: number) => void;
  
  // Utility functions
  formatTime: (seconds: number) => string;
  getProgressPercentage: () => number;
  getTimeColor: () => string;
  isTimeUp: boolean;
  isLowTime: boolean;
  isCriticalTime: boolean;
}

export const useSessionTimer = (options: UseSessionTimerOptions): UseSessionTimerReturn => {
  const {
    sessionId,
    durationMinutes = 60,
    autoStart = false,
    onComplete,
    onUpdate,
    onWarning,
    onCritical
  } = options;

  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    timeRemaining: durationMinutes * 60,
    elapsedTime: 0,
    pausedDuration: 0
  });

  const totalDuration = durationMinutes * 60;
  const isTimeUp = timerState.timeRemaining <= 0;
  const isLowTime = timerState.timeRemaining > 0 && timerState.timeRemaining <= 300; // Less than 5 minutes
  const isCriticalTime = timerState.timeRemaining > 0 && timerState.timeRemaining <= 60; // Less than 1 minute

  // Callbacks ref to avoid stale closures
  const callbacksRef = useRef({ onComplete, onUpdate, onWarning, onCritical });
  callbacksRef.current = { onComplete, onUpdate, onWarning, onCritical };

  // Handle timer updates
  const handleTimerUpdate = useCallback((state: TimerState) => {
    setTimerState(state);
    
    // Call update callback
    if (callbacksRef.current.onUpdate) {
      callbacksRef.current.onUpdate(state);
    }

    // Check for warnings and critical alerts
    if (state.timeRemaining > 0) {
      if (state.timeRemaining <= 60 && callbacksRef.current.onCritical) {
        callbacksRef.current.onCritical(state.timeRemaining);
      } else if (state.timeRemaining <= 300 && callbacksRef.current.onWarning) {
        callbacksRef.current.onWarning(state.timeRemaining);
      }
    } else if (state.timeRemaining <= 0 && callbacksRef.current.onComplete) {
      callbacksRef.current.onComplete();
    }
  }, []);

  // Timer controls
  const start = useCallback(() => {
    sessionTimerService.startTimer(sessionId, durationMinutes, handleTimerUpdate);
  }, [sessionId, durationMinutes, handleTimerUpdate]);

  const pause = useCallback(() => {
    sessionTimerService.pauseTimer(sessionId);
  }, [sessionId]);

  const resume = useCallback(() => {
    sessionTimerService.resumeTimer(sessionId);
  }, [sessionId]);

  const stop = useCallback(() => {
    sessionTimerService.stopTimer(sessionId);
  }, [sessionId]);

  const reset = useCallback(() => {
    sessionTimerService.stopTimer(sessionId);
    setTimerState({
      isRunning: false,
      isPaused: false,
      timeRemaining: durationMinutes * 60,
      elapsedTime: 0,
      pausedDuration: 0
    });
  }, [sessionId, durationMinutes]);

  const extend = useCallback((minutes: number) => {
    const newDuration = durationMinutes + minutes;
    sessionTimerService.startTimer(sessionId, newDuration, handleTimerUpdate);
  }, [sessionId, durationMinutes, handleTimerUpdate]);

  // Utility functions
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getProgressPercentage = useCallback((): number => {
    if (totalDuration === 0) return 0;
    return ((totalDuration - timerState.timeRemaining) / totalDuration) * 100;
  }, [timerState.timeRemaining, totalDuration]);

  const getTimeColor = useCallback((): string => {
    const percentage = (timerState.timeRemaining / totalDuration) * 100;
    if (percentage < 10) return 'text-red-400';
    if (percentage < 25) return 'text-orange-400';
    if (percentage < 50) return 'text-yellow-400';
    return 'text-green-400';
  }, [timerState.timeRemaining, totalDuration]);

  // Auto-start timer if enabled
  useEffect(() => {
    if (autoStart && !timerState.isRunning && !timerState.isPaused) {
      start();
    }
  }, [autoStart, timerState.isRunning, timerState.isPaused, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionTimerService.stopTimer(sessionId);
    };
  }, [sessionId]);

  return {
    // Timer state
    isRunning: timerState.isRunning,
    isPaused: timerState.isPaused,
    timeRemaining: timerState.timeRemaining,
    elapsedTime: timerState.elapsedTime,
    totalDuration,
    
    // Timer controls
    start,
    pause,
    resume,
    stop,
    reset,
    extend,
    
    // Utility functions
    formatTime,
    getProgressPercentage,
    getTimeColor,
    isTimeUp,
    isLowTime,
    isCriticalTime
  };
};
