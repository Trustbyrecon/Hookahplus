'use client';

import React, { useState } from 'react';
import {
  Flame,
  Coffee,
  Plus,
  RefreshCw,
  Thermometer,
  Droplet,
  Zap,
  Sparkles,
  Timer,
  MessageCircle,
  Star
} from 'lucide-react';

interface SessionControlsProps {
  sessionId: string;
  sessionDuration: number;
  onRequestRefill: () => void;
  onRequestCoals: () => void;
  onRequestFlavorChange: () => void;
  onRequestStaff: () => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  sessionId,
  sessionDuration,
  onRequestRefill,
  onRequestCoals,
  onRequestFlavorChange,
  onRequestStaff
}) => {
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'requested' | 'confirmed' | 'fulfilled'>('idle');

  const handleRequest = async (type: string, callback: () => void) => {
    setActiveRequest(type);
    setRequestStatus('requested');
    
    // Simulate request
    setTimeout(() => {
      setRequestStatus('confirmed');
      callback();
      
      // Show confirmation
      setTimeout(() => {
        setRequestStatus('fulfilled');
        setTimeout(() => {
          setActiveRequest(null);
          setRequestStatus('idle');
        }, 2000);
      }, 1000);
    }, 1500);
  };

  const getTimeRemaining = () => {
    const minutes = Math.floor(sessionDuration / 60);
    const seconds = sessionDuration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const controls = [
    {
      id: 'refill',
      icon: <Coffee className="w-6 h-6" />,
      label: 'Request Refill',
      subtitle: 'Get more flavor',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'from-purple-600 to-pink-600',
      onClick: () => handleRequest('refill', onRequestRefill)
    },
    {
      id: 'coals',
      icon: <Flame className="w-6 h-6" />,
      label: 'New Coals',
      subtitle: 'Fresh heat',
      color: 'from-orange-500 to-red-500',
      hoverColor: 'from-orange-600 to-red-600',
      onClick: () => handleRequest('coals', onRequestCoals)
    },
    {
      id: 'flavor',
      icon: <Sparkles className="w-6 h-6" />,
      label: 'Change Flavor',
      subtitle: 'Try something new',
      color: 'from-cyan-500 to-blue-500',
      hoverColor: 'from-cyan-600 to-blue-600',
      onClick: () => handleRequest('flavor', onRequestFlavorChange)
    },
    {
      id: 'staff',
      icon: <MessageCircle className="w-6 h-6" />,
      label: 'Call Staff',
      subtitle: 'Need assistance',
      color: 'from-teal-500 to-green-500',
      hoverColor: 'from-teal-600 to-green-600',
      onClick: () => handleRequest('staff', onRequestStaff)
    }
  ];

  const getRequestStatusText = () => {
    switch (requestStatus) {
      case 'requested': return 'Sending request...';
      case 'confirmed': return 'Request confirmed!';
      case 'fulfilled': return 'On the way!';
      default: return null;
    }
  };

  const getRequestStatusColor = () => {
    switch (requestStatus) {
      case 'requested': return 'text-blue-400';
      case 'confirmed': return 'text-green-400';
      case 'fulfilled': return 'text-teal-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-black border border-zinc-700 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Session Controls</h2>
            <div className="flex items-center space-x-2 text-sm text-zinc-400">
              <Timer className="w-4 h-4" />
              <span>{getTimeRemaining()} remaining</span>
            </div>
          </div>
        </div>
        
        {requestStatus !== 'idle' && (
          <div className={`text-sm font-medium ${getRequestStatusColor()}`}>
            {getRequestStatusText()}
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        {controls.map((control) => {
          const isActive = activeRequest === control.id;
          const isRequested = isActive && requestStatus === 'requested';
          const isConfirmed = isActive && requestStatus === 'confirmed';
          const isFulfilled = isActive && requestStatus === 'fulfilled';

          return (
            <button
              key={control.id}
              onClick={control.onClick}
              disabled={requestStatus !== 'idle' && !isFulfilled}
              className={`relative p-4 rounded-xl bg-gradient-to-br ${control.color} transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive ? 'ring-4 ring-teal-400/50' : ''
              }`}
            >
              {/* Icon */}
              <div className="flex flex-col items-center space-y-2">
                <div className="text-white">
                  {control.icon}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-white">
                    {control.label}
                  </div>
                  <div className="text-xs text-white/80">
                    {control.subtitle}
                  </div>
                </div>
              </div>

              {/* Request Status Indicators */}
              {isRequested && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                </div>
              )}

              {isConfirmed && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" />
                </div>
              )}

              {isFulfilled && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-teal-400 rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Session Status */}
      <div className="mt-6 pt-6 border-t border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <Flame className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Active Session</div>
              <div className="text-xs text-zinc-400">Your hookah is ready</div>
            </div>
          </div>
          <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Rate Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionControls;

