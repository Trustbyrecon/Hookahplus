import React, { useState, useEffect } from 'react';

interface ActiveSessionTimerProps {
  sessionId: string;
  startTime: string;
  isActive: boolean;
  onStatusUpdate?: (sessionId: string, status: string) => void;
}

export const ActiveSessionTimer: React.FC<ActiveSessionTimerProps> = ({
  sessionId,
  startTime,
  isActive,
  onStatusUpdate
}) => {
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(isActive);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(startTime).getTime();
        const elapsed = Math.floor((now - start) / 1000);
        setDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCoalStatus = (duration: number) => {
    // Coal typically needs refill every 45-60 minutes
    const coalRefillInterval = 45 * 60; // 45 minutes in seconds
    const timeUntilRefill = coalRefillInterval - (duration % coalRefillInterval);
    
    if (timeUntilRefill <= 5 * 60) { // Last 5 minutes
      return {
        status: 'needs_refill',
        message: 'Coals need refill soon',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    } else if (timeUntilRefill <= 10 * 60) { // Last 10 minutes
      return {
        status: 'warning',
        message: `${Math.ceil(timeUntilRefill / 60)} min until coal refill`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      };
    } else {
      return {
        status: 'good',
        message: `${Math.ceil(timeUntilRefill / 60)} min until coal refill`,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    }
  };

  const coalStatus = getCoalStatus(duration);

  const handleStartTimer = async () => {
    try {
      const response = await fetch('/api/fire-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start_timer',
          sessionId: sessionId
        }),
      });

      if (response.ok) {
        setIsRunning(true);
        onStatusUpdate?.(sessionId, 'active');
      }
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    onStatusUpdate?.(sessionId, 'completed');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Active Session Timer</h3>
        <div className="flex space-x-2">
          {!isRunning ? (
            <button
              onClick={handleStartTimer}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Start Timer
            </button>
          ) : (
            <button
              onClick={handleStopTimer}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Stop Timer
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Session Duration */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-gray-900">
            {formatDuration(duration)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Session Duration
          </div>
        </div>

        {/* Coal Status */}
        <div className={`p-3 rounded-lg ${coalStatus.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔥</span>
              <span className={`font-medium ${coalStatus.color}`}>
                Coal Status
              </span>
            </div>
            <span className={`text-sm ${coalStatus.color}`}>
              {coalStatus.message}
            </span>
          </div>
        </div>

        {/* Session Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Session ID: {sessionId}</div>
          <div>Started: {new Date(startTime).toLocaleTimeString()}</div>
          <div>Status: {isRunning ? 'Active' : 'Paused'}</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ 
              width: `${Math.min((duration / (60 * 60)) * 100, 100)}%` // 1 hour max for demo
            }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Progress (1 hour max session)
        </div>
      </div>
    </div>
  );
};

export default ActiveSessionTimer;
