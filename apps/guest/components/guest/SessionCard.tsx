'use client';

import React, { useState, useEffect } from 'react';
import { GuestProfile, FeatureFlags } from '../../../types/guest';
import { createGhostLogEntry } from '../../libs/ghostlog/hash';
import { Clock, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

interface SessionCardProps {
  guestProfile: GuestProfile;
  flags: FeatureFlags;
  onSessionUpdate: () => void;
}

interface SessionState {
  sessionId: string;
  status: 'started' | 'in_progress' | 'served' | 'closed' | 'cancelled';
  startedAt: string;
  estimatedWait?: number;
  tableId?: string;
  staffAssigned?: {
    foh?: string;
    boh?: string;
  };
}

export default function SessionCard({ guestProfile, flags, onSessionUpdate }: SessionCardProps) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, [guestProfile.guestId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session && session.status === 'in_progress' && timeRemaining !== null) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, timeRemaining]);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In production, this would fetch the actual session
      // For now, we'll simulate a session
      const mockSession: SessionState = {
        sessionId: `session_${Date.now()}`,
        status: 'started',
        startedAt: new Date().toISOString(),
        estimatedWait: 5,
        tableId: 'T-001'
      };

      setSession(mockSession);
      
      // Simulate session progression
      setTimeout(() => {
        setSession(prev => prev ? { ...prev, status: 'in_progress' } : null);
        setTimeRemaining(1800); // 30 minutes
      }, 2000);

    } catch (err) {
      console.error('Load session error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    try {
      const response = await fetch('/api/guest/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loungeId: 'default', // In production, get from context
          guestId: guestProfile.guestId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start session');
      }

      const sessionData = await response.json();
      setSession({
        sessionId: sessionData.sessionId,
        status: 'started',
        startedAt: new Date().toISOString(),
        estimatedWait: sessionData.estimatedWait,
        tableId: sessionData.tableId
      });

      onSessionUpdate();

    } catch (err) {
      console.error('Start session error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'started': return 'text-blue-400';
      case 'in_progress': return 'text-green-400';
      case 'served': return 'text-yellow-400';
      case 'closed': return 'text-gray-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'started': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'served': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Session Status</h2>
            <p className="text-sm text-zinc-400">Loading...</p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Session Error</h2>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
        <button
          onClick={loadSession}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Start Your Session</h2>
            <p className="text-sm text-zinc-400">Ready to begin your hookah experience</p>
          </div>
        </div>
        
        <button
          onClick={handleStartSession}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Play className="w-5 h-5" />
          <span>Start Session</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Clock className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Session Status</h2>
          <p className="text-sm text-zinc-400">
            {session.tableId ? `Table ${session.tableId}` : 'Your session'}
          </p>
        </div>
      </div>

      {/* Session Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(session.status).replace('text-', 'bg-').replace('-400', '-500/20')}`}>
              {getStatusIcon(session.status)}
            </div>
            <div>
              <div className={`text-sm font-medium ${getStatusColor(session.status)}`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('_', ' ')}
              </div>
              <div className="text-xs text-zinc-400">
                Started: {new Date(session.startedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          {session.status === 'in_progress' && timeRemaining !== null && (
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-zinc-400">Time Remaining</div>
            </div>
          )}
        </div>
      </div>

      {/* Session Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-400 mb-1">Session ID</div>
            <div className="text-sm font-mono text-white">{session.sessionId}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400 mb-1">Table</div>
            <div className="text-sm text-white">{session.tableId || 'TBD'}</div>
          </div>
        </div>

        {session.estimatedWait && session.status === 'started' && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">
                Estimated wait time: {session.estimatedWait} minutes
              </span>
            </div>
          </div>
        )}

        {session.staffAssigned && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-sm text-green-400">
              Staff assigned: {session.staffAssigned.foh || 'TBD'} (FOH), {session.staffAssigned.boh || 'TBD'} (BOH)
            </div>
          </div>
        )}

        {/* Timer Progress Bar */}
        {session.status === 'in_progress' && timeRemaining !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Session Progress</span>
              <span>{formatTime(timeRemaining)} remaining</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.max(0, ((1800 - timeRemaining) / 1800) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {session.status === 'started' && (
        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => {
              setSession(prev => prev ? { ...prev, status: 'in_progress' } : null);
              setTimeRemaining(1800);
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start Timer</span>
          </button>
        </div>
      )}

      {session.status === 'in_progress' && (
        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => {
              setSession(prev => prev ? { ...prev, status: 'served' } : null);
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Served</span>
          </button>
          <button
            onClick={() => {
              setSession(prev => prev ? { ...prev, status: 'closed' } : null);
              setTimeRemaining(0);
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete</span>
          </button>
        </div>
      )}
    </div>
  );
}
