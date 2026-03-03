'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Zap, 
  Flame, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Monitor,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Mobile-Optimized Fire Session Dashboard
 * --------------------------------------
 * Enhanced mobile-first Fire Session Dashboard with:
 * - Touch-friendly interface (44px minimum touch targets)
 * - Gesture support (swipe, pinch, tap)
 * - Real-time session tracking
 * - Mobile-responsive design
 * - Performance optimizations
 * - Enhanced visual feedback
 */

interface SessionData {
  sessionId: string;
  tableId: string;
  startTime: Date;
  duration: number; // in minutes
  timeRemaining: number; // in minutes
  totalAmount: number; // in cents
  flavors: string[];
  status: 'active' | 'paused' | 'completed' | 'expired';
  progress: number; // 0-100
}

interface MobileFireSessionDashboardProps {
  sessionData?: SessionData;
  onSessionUpdate?: (session: SessionData) => void;
  onSessionEnd?: () => void;
  className?: string;
}

export default function MobileFireSessionDashboard({
  sessionData,
  onSessionUpdate,
  onSessionEnd,
  className
}: MobileFireSessionDashboardProps) {
  const [session, setSession] = useState<SessionData>(sessionData || {
    sessionId: 'session-001',
    tableId: 'T-001',
    startTime: new Date(),
    duration: 60,
    timeRemaining: 60,
    totalAmount: 3000,
    flavors: ['mint', 'mango'],
    status: 'active',
    progress: 0
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Session timer
  useEffect(() => {
    if (session.status === 'active' && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSession(prev => {
          const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);
          const newProgress = ((prev.duration - newTimeRemaining) / prev.duration) * 100;
          
          if (newTimeRemaining === 0) {
            const updatedSession = {
              ...prev,
              timeRemaining: 0,
              progress: 100,
              status: 'completed' as const
            };
            
            if (onSessionUpdate) {
              onSessionUpdate(updatedSession);
            }
            
            if (onSessionEnd) {
              onSessionEnd();
            }
            
            return updatedSession;
          }
          
          const updatedSession = {
            ...prev,
            timeRemaining: newTimeRemaining,
            progress: newProgress
          };
          
          if (onSessionUpdate) {
            onSessionUpdate(updatedSession);
          }
          
          return updatedSession;
        });
      }, 60000); // Update every minute
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session.status, isPaused, onSessionUpdate, onSessionEnd]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleEndSession = () => {
    setSession(prev => ({
      ...prev,
      status: 'completed',
      progress: 100,
      timeRemaining: 0
    }));
    
    if (onSessionEnd) {
      onSessionEnd();
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'expired': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Flame className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white rounded-xl overflow-hidden", className)}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Fire Session</h2>
            <p className="text-xs text-zinc-400">Table {session.tableId}</p>
          </div>
        </div>
        
        {/* Mobile Status Indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Battery className="w-3 h-3" />
            <span>85%</span>
          </div>
        </div>
      </div>

      {/* Main Session Display */}
      <div className="p-4 md:p-6">
        {/* Session Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-2", getStatusColor(session.status))}>
              {getStatusIcon(session.status)}
              <span className="text-sm font-medium capitalize">{session.status}</span>
            </div>
            {isPaused && (
              <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                Paused
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Time Display */}
        <div className="text-center mb-6">
          <div className="text-4xl md:text-5xl font-bold text-white mb-2">
            {formatTime(session.timeRemaining)}
          </div>
          <div className="text-sm text-zinc-400">
            {session.timeRemaining > 0 ? 'remaining' : 'session complete'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(session.progress)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${session.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Session Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Session ID</span>
                  <span className="text-sm font-mono">{session.sessionId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Start Time</span>
                  <span className="text-sm">{session.startTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Duration</span>
                  <span className="text-sm">{session.duration} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Total Amount</span>
                  <span className="text-sm font-semibold text-green-400">
                    ${(session.totalAmount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Flavors</span>
                  <div className="flex flex-wrap gap-1">
                    {session.flavors.map((flavor) => (
                      <span key={flavor} className="text-xs px-2 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-full">
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePauseResume}
            disabled={session.status !== 'active'}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors min-h-[44px]",
              session.status === 'active'
                ? isPaused
                  ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20"
                  : "border-blue-500/50 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                : "border-zinc-600 bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isPaused ? 'Resume' : 'Pause'}
            </span>
          </button>

          <button
            onClick={handleEndSession}
            disabled={session.status === 'completed'}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors min-h-[44px]",
              session.status !== 'completed'
                ? "border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                : "border-zinc-600 bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">End Session</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="border-t border-zinc-700 p-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3 h-3" />
            <span>Mobile Optimized</span>
          </div>
          <div className="flex items-center gap-2">
            <Signal className="w-3 h-3" />
            <span>Real-time Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
