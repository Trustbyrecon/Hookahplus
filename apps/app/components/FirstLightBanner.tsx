"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Play, ExternalLink, RefreshCw } from 'lucide-react';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  database: 'connected' | 'disconnected';
  auth: 'enabled' | 'bypassed';
  firstLightMode: boolean;
  databaseError?: string;
}

export default function FirstLightBanner({ onRunTest }: { onRunTest?: () => void }) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
      setLastCheck(new Date());
    } catch (error) {
      console.error('[FirstLightBanner] Health check failed:', error);
      setHealth({
        status: 'down',
        database: 'disconnected',
        auth: 'enabled',
        firstLightMode: false,
        databaseError: 'Failed to reach health endpoint'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return (
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-zinc-400">Checking First Light status...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const getStatusConfig = () => {
    if (health.status === 'ok' && health.database === 'connected') {
      return {
        bg: 'bg-green-900/20 border-green-700/50',
        icon: CheckCircle2,
        iconColor: 'text-green-400',
        text: 'text-green-100',
        statusText: 'READY',
        buttonText: 'Run First Light Test',
        buttonBg: 'bg-green-600 hover:bg-green-700'
      };
    } else if (health.status === 'degraded' || (health.database === 'connected' && health.status !== 'down')) {
      return {
        bg: 'bg-yellow-900/20 border-yellow-700/50',
        icon: AlertCircle,
        iconColor: 'text-yellow-400',
        text: 'text-yellow-100',
        statusText: 'PARTIAL',
        buttonText: 'Continue Session Test',
        buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
      };
    } else {
      return {
        bg: 'bg-red-900/20 border-red-700/50',
        icon: XCircle,
        iconColor: 'text-red-400',
        text: 'text-red-100',
        statusText: 'BLOCKED',
        buttonText: 'Retry Health Check',
        buttonBg: 'bg-red-600 hover:bg-red-700'
      };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border-b px-4 py-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${config.text}`}>
                FIRST LIGHT STATUS: {config.statusText}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              {health.database === 'connected' 
                ? 'Database connected. Sessions engine is live.'
                : health.databaseError || 'Database connection is not active.'}
              {health.status === 'ok' && ' You are cleared to create your first real session.'}
            </div>
            {lastCheck && (
              <div className="text-xs text-zinc-500 mt-0.5">
                Last check: {lastCheck.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {health.status === 'ok' && onRunTest && (
            <button
              onClick={onRunTest}
              className={`${config.buttonBg} text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors`}
            >
              <Play className="w-4 h-4" />
              {config.buttonText}
            </button>
          )}
          {health.status !== 'ok' && (
            <>
              <button
                onClick={checkHealth}
                className={`${config.buttonBg} text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors`}
              >
                <RefreshCw className="w-4 h-4" />
                {config.buttonText}
              </button>
              <a
                href="/docs/setup-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-300 text-sm flex items-center gap-1"
              >
                <span>Setup Guide</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </>
          )}
        </div>
      </div>
      {health.database === 'disconnected' && health.databaseError && (
        <div className="mt-2 text-xs text-zinc-400 bg-zinc-900/50 rounded p-2">
          <div className="font-medium mb-1">Technical Details:</div>
          <div>{health.databaseError}</div>
          <div className="mt-1">
            Likely causes: DATABASE_URL missing, database unreachable, or driver mismatch.
          </div>
        </div>
      )}
    </div>
  );
}

