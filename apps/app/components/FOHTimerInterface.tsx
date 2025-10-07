"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Play, Pause, RotateCcw, Clock, Flame, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { Session } from '../types/session';
import { sessionTimerService } from '../lib/sessionTimerService';

interface FOHTimerInterfaceProps {
  assignedSessions: Session[];
  onTimerAction: (sessionId: string, action: 'start' | 'pause' | 'resume' | 'stop' | 'extend') => void;
  onSessionComplete: (sessionId: string) => void;
  className?: string;
}

interface TimerAlert {
  sessionId: string;
  tableId: string;
  type: 'warning' | 'critical' | 'complete';
  message: string;
  timeRemaining: number;
}

export const FOHTimerInterface: React.FC<FOHTimerInterfaceProps> = ({
  assignedSessions,
  onTimerAction,
  onSessionComplete,
  className
}) => {
  const [timerStates, setTimerStates] = useState<Map<string, any>>(new Map());
  const [alerts, setAlerts] = useState<TimerAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);

  // Filter sessions that have timers and are assigned to FOH
  const timerSessions = assignedSessions.filter(session => 
    session.timerDuration && 
    (session.state === 'ACTIVE' || session.state === 'PAUSED') &&
    session.assignedFOHId
  );

  useEffect(() => {
    // Register timers for all assigned sessions
    timerSessions.forEach(session => {
      if (!session.timerDuration) return;

      const handleTimerUpdate = (timerState: any) => {
        setTimerStates(prev => new Map(prev.set(session.id, timerState)));
        
        // Generate alerts based on time remaining
        const timeRemaining = timerState.timeRemaining;
        const totalDuration = session.timerDuration! * 60;
        const percentageRemaining = (timeRemaining / totalDuration) * 100;
        
        let alertType: 'warning' | 'critical' | 'complete' | null = null;
        let message = '';
        
        if (timeRemaining === 0) {
          alertType = 'complete';
          message = 'Session Complete!';
        } else if (percentageRemaining <= 10) {
          alertType = 'critical';
          message = 'Session ending soon!';
        } else if (percentageRemaining <= 25) {
          alertType = 'warning';
          message = 'Session time running low';
        }
        
        if (alertType) {
          const newAlert: TimerAlert = {
            sessionId: session.id,
            tableId: session.tableId,
            type: alertType,
            message,
            timeRemaining
          };
          
          setAlerts(prev => {
            const filtered = prev.filter(a => a.sessionId !== session.id);
            return [...filtered, newAlert];
          });
        }
      };

      // Start timer for this session
      sessionTimerService.startTimer(session.id, session.timerDuration, handleTimerUpdate);
    });

    return () => {
      timerSessions.forEach(session => {
        sessionTimerService.stopTimer(session.id);
      });
    };
  }, [timerSessions, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (timeRemaining: number, totalDuration: number) => {
    const percentageRemaining = (timeRemaining / totalDuration) * 100;
    if (percentageRemaining > 50) return 'text-green-400';
    if (percentageRemaining > 25) return 'text-yellow-400';
    if (percentageRemaining > 10) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressPercentage = (timeRemaining: number, totalDuration: number) => {
    return ((totalDuration - timeRemaining) / totalDuration) * 100;
  };

  const handleTimerAction = (sessionId: string, action: 'start' | 'pause' | 'resume' | 'stop' | 'extend') => {
    const session = timerSessions.find(s => s.id === sessionId);
    if (!session || !session.timerDuration) return;

    switch (action) {
      case 'start':
        sessionTimerService.startTimer(sessionId, session.timerDuration, (state) => {
          setTimerStates(prev => new Map(prev.set(sessionId, state)));
        });
        break;
      case 'pause':
        sessionTimerService.pauseTimer(sessionId);
        break;
      case 'resume':
        sessionTimerService.resumeTimer(sessionId);
        break;
      case 'stop':
        sessionTimerService.stopTimer(sessionId);
        break;
      case 'extend':
        // Add 15 minutes to the timer
        const currentState = timerStates.get(sessionId);
        if (currentState) {
          const newDuration = session.timerDuration + 15; // Add 15 minutes
          sessionTimerService.startTimer(sessionId, newDuration, (state) => {
            setTimerStates(prev => new Map(prev.set(sessionId, state)));
          });
        }
        break;
    }
    onTimerAction(sessionId, action);
  };

  const dismissAlert = (sessionId: string) => {
    setAlerts(prev => prev.filter(a => a.sessionId !== sessionId));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Alerts Section */}
      {alerts.length > 0 && showAlerts && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
              Timer Alerts
            </h3>
            <button
              onClick={() => setShowAlerts(false)}
              className="text-zinc-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  alert.type === 'critical' ? 'bg-red-500/20 border border-red-500/30' :
                  alert.type === 'warning' ? 'bg-orange-500/20 border border-orange-500/30' :
                  'bg-green-500/20 border border-green-500/30'
                )}
              >
                <div className="flex items-center space-x-3">
                  {alert.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  {alert.type === 'warning' && <Clock className="w-4 h-4 text-orange-400" />}
                  {alert.type === 'complete' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  <div>
                    <div className="font-medium text-white">Table {alert.tableId}</div>
                    <div className="text-sm text-zinc-300">{alert.message}</div>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.sessionId)}
                  className="text-zinc-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timer Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timerSessions.map(session => {
          const timerState = timerStates.get(session.id);
          if (!timerState) return null;

          const timeRemaining = timerState.timeRemaining;
          const totalDuration = session.timerDuration! * 60;
          const isRunning = timerState.isRunning;
          const isPaused = timerState.isPaused;
          const isComplete = timeRemaining === 0;

          return (
            <div
              key={session.id}
              className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-zinc-600 transition-colors"
            >
              {/* Session Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-teal-400" />
                  <span className="font-semibold text-white">Table {session.tableId}</span>
                </div>
                <div className="text-sm text-zinc-400">
                  {session.customerRef || 'Guest'}
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-4">
                <div className={cn(
                  'text-3xl font-bold mb-2',
                  getTimeColor(timeRemaining, totalDuration)
                )}>
                  {formatTime(timeRemaining)}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-700 rounded-full h-2 mb-3">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-1000',
                      isComplete ? 'bg-red-500' : 'bg-teal-500'
                    )}
                    style={{ width: `${getProgressPercentage(timeRemaining, totalDuration)}%` }}
                  />
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-center space-x-1 text-sm">
                  {isRunning && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Running</span>
                    </div>
                  )}
                  {isPaused && (
                    <div className="flex items-center space-x-1 text-orange-400">
                      <div className="w-2 h-2 bg-orange-400 rounded-full" />
                      <span>Paused</span>
                    </div>
                  )}
                  {isComplete && (
                    <div className="flex items-center space-x-1 text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                      <span>Complete</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-2">
                {!isRunning && !isComplete && (
                  <button
                    onClick={() => handleTimerAction(session.id, 'start')}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start</span>
                  </button>
                )}
                
                {isRunning && (
                  <button
                    onClick={() => handleTimerAction(session.id, 'pause')}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                )}
                
                {isPaused && (
                  <button
                    onClick={() => handleTimerAction(session.id, 'resume')}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume</span>
                  </button>
                )}
                
                {(isRunning || isPaused) && (
                  <button
                    onClick={() => handleTimerAction(session.id, 'extend')}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+15m</span>
                  </button>
                )}
                
                {(isRunning || isPaused || isComplete) && (
                  <button
                    onClick={() => handleTimerAction(session.id, 'stop')}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Sessions Message */}
      {timerSessions.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400">No active timer sessions assigned to you</p>
        </div>
      )}
    </div>
  );
};
