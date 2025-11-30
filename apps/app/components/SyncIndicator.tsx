'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface SyncIndicatorProps {
  lastUpdated: Date | null;
  isLoading?: boolean;
  error?: string | null;
  autoRefreshInterval?: number; // in seconds
  className?: string;
  isDemoMode?: boolean; // Hide errors in demo mode
}

export default function SyncIndicator({
  lastUpdated,
  isLoading = false,
  error = null,
  autoRefreshInterval = 30,
  className = '',
  isDemoMode = false
}: SyncIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdated) {
        setTimeAgo('Never');
        return;
      }

      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000); // seconds

      if (diff < 5) {
        setTimeAgo('Just now');
      } else if (diff < 60) {
        setTimeAgo(`${diff}s ago`);
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(diff / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getStatusColor = () => {
    if (error) return 'text-red-400';
    if (isLoading) return 'text-blue-400';
    if (!lastUpdated) return 'text-zinc-400';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diff < 60) return 'text-green-400';
    if (diff < 300) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="w-3 h-3" />;
    if (isLoading) return <RefreshCw className="w-3 h-3 animate-spin" />;
    if (!lastUpdated) return <Clock className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  const isStale = lastUpdated && (new Date().getTime() - lastUpdated.getTime()) > (autoRefreshInterval * 1000);

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      {!isDemoMode && (
        <div className={`flex items-center gap-1.5 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>Last updated: {timeAgo}</span>
        </div>
      )}
      {isStale && !isDemoMode && (
        <span className="text-yellow-400 text-xs">• Data may be stale</span>
      )}
      {error && !isDemoMode && (
        <span className="text-red-400 text-xs">• {error}</span>
      )}
      {!error && !isLoading && lastUpdated && (
        <span className="text-zinc-500 text-xs">• Auto-refresh: {autoRefreshInterval}s</span>
      )}
    </div>
  );
}

