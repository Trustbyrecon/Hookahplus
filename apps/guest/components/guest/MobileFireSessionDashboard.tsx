'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Clock, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Smartphone,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

interface SessionData {
  id: string;
  status: 'active' | 'paused' | 'completed' | 'ready';
  startTime: Date;
  duration: number; // in minutes
  timeRemaining: number; // in minutes
  totalAmount: number; // in cents
  flavors: string[];
  tableId: string;
  progress: number; // 0-100
}

interface MobileFireSessionDashboardProps {
  session: SessionData | null;
  onStartSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onEndSession: () => void;
  onRestartSession: () => void;
  isProcessing?: boolean;
}

export default function MobileFireSessionDashboard({
  session,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onEndSession,
  onRestartSession,
  isProcessing = false
}: MobileFireSessionDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'ready': return 'text-zinc-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Flame className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'ready': return <Play className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (!session) {
    return (
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flame className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">No Active Session</h3>
          <p className="text-sm text-zinc-400 mb-6">
            Start a new hookah session to begin tracking
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartSession}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-zinc-600 disabled:to-zinc-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {isProcessing ? 'Starting...' : 'Start New Session'}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 overflow-hidden">
      {/* Mobile Header with Status */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              session.status === 'active' ? 'bg-green-500/20' : 
              session.status === 'paused' ? 'bg-yellow-500/20' : 
              'bg-zinc-500/20'
            }`}>
              {getStatusIcon(session.status)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Fire Session</h3>
              <p className={`text-sm font-medium ${getStatusColor(session.status)}`}>
                {session.status.toUpperCase()}
              </p>
            </div>
          </div>
          
          {/* Mobile Status Indicators */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Wifi className="w-3 h-3" />
            <Battery className="w-3 h-3" />
            <Signal className="w-3 h-3" />
          </div>
        </div>

        {/* Session Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Progress</span>
            <span>{session.progress}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${session.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Session Details - Collapsible */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-teal-400" />
            <span className="font-medium">Session Details</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                {/* Time Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-700/30 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Duration</div>
                    <div className="font-semibold">{formatTime(session.duration)}</div>
                  </div>
                  <div className="bg-zinc-700/30 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Remaining</div>
                    <div className="font-semibold text-teal-400">{formatTime(session.timeRemaining)}</div>
                  </div>
                </div>

                {/* Table & Flavors */}
                <div className="space-y-3">
                  <div className="bg-zinc-700/30 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Table</div>
                    <div className="font-semibold">{session.tableId}</div>
                  </div>
                  
                  {session.flavors.length > 0 && (
                    <div className="bg-zinc-700/30 rounded-lg p-3">
                      <div className="text-xs text-zinc-400 mb-2">Selected Flavors</div>
                      <div className="flex flex-wrap gap-2">
                        {session.flavors.map((flavor, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-teal-500/20 text-teal-300 rounded-full"
                          >
                            {flavor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Amount</span>
                    <span className="text-xl font-bold text-teal-400">
                      {formatCurrency(session.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Action Controls */}
      <div className="p-4 border-t border-zinc-700">
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-full flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-2 gap-3">
                {session.status === 'ready' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStartSession}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-zinc-600 disabled:to-zinc-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start
                  </motion.button>
                )}

                {session.status === 'active' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onPauseSession}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </motion.button>
                )}

                {session.status === 'paused' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onResumeSession}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRestartSession}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onEndSession}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  End
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
