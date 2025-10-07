"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Clock, Flame, Users, Activity, Zap, TrendingUp } from 'lucide-react';

interface LiveSessionStatusProps {
  className?: string;
}

interface LiveSessionData {
  activeSessions: number;
  totalRevenue: number;
  averageSessionTime: number;
  peakTime: string;
  popularFlavors: string[];
  systemStatus: 'online' | 'maintenance' | 'offline';
}

export const LiveSessionStatus: React.FC<LiveSessionStatusProps> = ({ className }) => {
  const [sessionData, setSessionData] = useState<LiveSessionData>({
    activeSessions: 0,
    totalRevenue: 0,
    averageSessionTime: 0,
    peakTime: '8:00 PM',
    popularFlavors: ['Blue Mist', 'Double Apple', 'Mint Fresh'],
    systemStatus: 'online'
  });
  const [isLive, setIsLive] = useState(true);

  // Mock data updates - in real app, this would come from API
  useEffect(() => {
    const updateData = () => {
      setSessionData(prev => ({
        ...prev,
        activeSessions: Math.floor(Math.random() * 8) + 2, // 2-10 sessions
        totalRevenue: Math.floor(Math.random() * 500) + 200, // $200-700
        averageSessionTime: Math.floor(Math.random() * 20) + 40, // 40-60 minutes
        systemStatus: Math.random() > 0.9 ? 'maintenance' : 'online'
      }));
    };

    updateData();
    const interval = setInterval(updateData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (sessionData.systemStatus) {
      case 'online': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'maintenance': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'offline': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getStatusIcon = () => {
    switch (sessionData.systemStatus) {
      case 'online': return <Activity className="w-4 h-4" />;
      case 'maintenance': return <Clock className="w-4 h-4" />;
      case 'offline': return <Zap className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Live Status Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className={cn(
            'w-3 h-3 rounded-full animate-pulse',
            sessionData.systemStatus === 'online' ? 'bg-green-400' :
            sessionData.systemStatus === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'
          )} />
          <span className="text-sm font-medium text-zinc-300">Live Status</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Hookah+ Lounge is {sessionData.systemStatus === 'online' ? 'Active' : 'In Maintenance'}
        </h2>
        <p className="text-zinc-400">
          {sessionData.systemStatus === 'online' 
            ? 'Real-time session management in progress'
            : 'System maintenance in progress - back online soon'
          }
        </p>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{sessionData.activeSessions}</div>
          <div className="text-sm text-zinc-400">Active Sessions</div>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">${sessionData.totalRevenue}</div>
          <div className="text-sm text-zinc-400">Revenue Today</div>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{sessionData.averageSessionTime}m</div>
          <div className="text-sm text-zinc-400">Avg Session</div>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{sessionData.peakTime}</div>
          <div className="text-sm text-zinc-400">Peak Time</div>
        </div>
      </div>

      {/* System Status */}
      <div className={cn(
        'p-4 rounded-lg border text-center',
        getStatusColor()
      )}>
        <div className="flex items-center justify-center space-x-2 mb-2">
          {getStatusIcon()}
          <span className="font-semibold">System Status</span>
        </div>
        <p className="text-sm opacity-75">
          {sessionData.systemStatus === 'online' && 'All systems operational - Ready for new sessions'}
          {sessionData.systemStatus === 'maintenance' && 'System maintenance in progress - Please check back soon'}
          {sessionData.systemStatus === 'offline' && 'System temporarily offline - We apologize for the inconvenience'}
        </p>
      </div>

      {/* Popular Flavors */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-teal-400" />
          Popular This Hour
        </h3>
        <div className="flex flex-wrap gap-2">
          {sessionData.popularFlavors.map((flavor, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm font-medium"
            >
              {flavor}
            </span>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      {sessionData.systemStatus === 'online' && (
        <div className="text-center">
          <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">Ready to Experience Hookah+?</h3>
            <p className="text-zinc-300 mb-4">
              Join {sessionData.activeSessions} active sessions and discover our premium hookah experience
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors">
                Start Your Session
              </button>
              <button className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors">
                View Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
