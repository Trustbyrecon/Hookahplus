"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Clock, Flame, AlertTriangle, CheckCircle, Zap, Timer } from 'lucide-react';

interface SessionTimerAwarenessProps {
  tableId: string;
  sessionId?: string;
  onSessionStart?: () => void;
  onSessionComplete?: () => void;
  className?: string;
}

interface SessionStatus {
  isActive: boolean;
  timeRemaining?: number;
  totalDuration?: number;
  status: 'idle' | 'starting' | 'active' | 'ending' | 'completed';
  message: string;
}

export const SessionTimerAwareness: React.FC<SessionTimerAwarenessProps> = ({
  tableId,
  sessionId,
  onSessionStart,
  onSessionComplete,
  className
}) => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isActive: false,
    status: 'idle',
    message: 'Ready to start your session'
  });
  const [showTimer, setShowTimer] = useState(false);

  // Mock session data - in real app, this would come from API
  useEffect(() => {
    // Simulate checking for active session
    const checkSessionStatus = () => {
      // Mock: Check if there's an active session for this table
      const mockActiveSession = Math.random() > 0.7; // 30% chance of active session
      
      if (mockActiveSession) {
        const timeRemaining = Math.floor(Math.random() * 1800) + 300; // 5-35 minutes
        const totalDuration = 3600; // 60 minutes
        
        setSessionStatus({
          isActive: true,
          timeRemaining,
          totalDuration,
          status: 'active',
          message: 'Your session is active'
        });
        setShowTimer(true);
      } else {
        setSessionStatus({
          isActive: false,
          status: 'idle',
          message: 'Ready to start your session'
        });
        setShowTimer(false);
      }
    };

    checkSessionStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkSessionStatus, 30000);
    return () => clearInterval(interval);
  }, [tableId, sessionId]);

  // Simulate timer countdown
  useEffect(() => {
    if (!sessionStatus.isActive || !sessionStatus.timeRemaining) return;

    const timer = setInterval(() => {
      setSessionStatus(prev => {
        if (!prev.timeRemaining || prev.timeRemaining <= 1) {
          // Session completed
          setShowTimer(false);
          onSessionComplete?.();
          return {
            isActive: false,
            status: 'completed',
            message: 'Session completed! Thank you for visiting.'
          };
        }
        
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStatus.isActive, sessionStatus.timeRemaining, onSessionComplete]);

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

  const handleStartSession = () => {
    setSessionStatus({
      isActive: true,
      timeRemaining: 3600, // 60 minutes
      totalDuration: 3600,
      status: 'starting',
      message: 'Starting your session...'
    });
    setShowTimer(true);
    onSessionStart?.();
    
    // Simulate session start delay
    setTimeout(() => {
      setSessionStatus(prev => ({
        ...prev,
        status: 'active',
        message: 'Your session is now active'
      }));
    }, 2000);
  };

  const getStatusIcon = () => {
    switch (sessionStatus.status) {
      case 'idle': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'starting': return <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case 'active': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'ending': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      default: return <Clock className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getStatusColor = () => {
    switch (sessionStatus.status) {
      case 'idle': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'starting': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'active': return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'ending': return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'completed': return 'bg-green-500/20 border-green-500/30 text-green-400';
      default: return 'bg-zinc-500/20 border-zinc-500/30 text-zinc-400';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Session Status Card */}
      <div className={cn(
        'p-4 rounded-lg border transition-all duration-300',
        getStatusColor()
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-white">Table {tableId}</h3>
              <p className="text-sm opacity-75">{sessionStatus.message}</p>
            </div>
          </div>
          <div className="text-right">
            {sessionStatus.status === 'idle' && (
              <button
                onClick={handleStartSession}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Start Session</span>
              </button>
            )}
            {sessionStatus.status === 'completed' && (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                New Session
              </button>
            )}
          </div>
        </div>

        {/* Timer Display */}
        {showTimer && sessionStatus.timeRemaining && sessionStatus.totalDuration && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Session Timer</span>
              </div>
              <div className={cn(
                'text-lg font-bold',
                getTimeColor(sessionStatus.timeRemaining, sessionStatus.totalDuration)
              )}>
                {formatTime(sessionStatus.timeRemaining)}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-1000',
                  sessionStatus.timeRemaining < 300 ? 'bg-red-500' : 'bg-teal-500'
                )}
                style={{ 
                  width: `${getProgressPercentage(sessionStatus.timeRemaining, sessionStatus.totalDuration)}%` 
                }}
              />
            </div>

            {/* Time Warnings */}
            {sessionStatus.timeRemaining < 300 && sessionStatus.timeRemaining > 0 && (
              <div className="mt-2 flex items-center space-x-1 text-orange-400 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-medium">Session ending soon!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Tips */}
      {sessionStatus.status === 'idle' && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-400" />
            Session Information
          </h4>
          <div className="text-sm text-zinc-400 space-y-1">
            <p>• Standard session duration: 60 minutes</p>
            <p>• Extensions available upon request</p>
            <p>• Timer will show your remaining time</p>
            <p>• Staff will be notified when session ends</p>
          </div>
        </div>
      )}

      {/* Active Session Tips */}
      {sessionStatus.status === 'active' && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2 flex items-center">
            <Flame className="w-4 h-4 mr-2 text-orange-400" />
            Your Session is Active
          </h4>
          <div className="text-sm text-zinc-300 space-y-1">
            <p>• Enjoy your hookah session</p>
            <p>• Need assistance? Ask our staff</p>
            <p>• Want to extend? Let us know!</p>
            <p>• Timer will alert when time is running low</p>
          </div>
        </div>
      )}
    </div>
  );
};
