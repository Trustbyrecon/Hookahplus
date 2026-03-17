"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Database, Server, Shield, BarChart3 } from 'lucide-react';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  database: 'connected' | 'disconnected';
  auth: 'enabled' | 'bypassed';
  firstLightMode: boolean;
  databaseError?: string;
}

export default function FirstLightHealthCard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionsApiReady, setSessionsApiReady] = useState<boolean | null>(null);
  const [metricsApiReady, setMetricsApiReady] = useState<boolean | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setSessionsApiReady(null);
      setMetricsApiReady(null);
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      setHealth(healthData);

      // Test sessions API
      try {
        const sessionsResponse = await fetch('/api/sessions');
        setSessionsApiReady(sessionsResponse.ok || sessionsResponse.status === 503);
      } catch {
        setSessionsApiReady(false);
      }

      // Test metrics API
      try {
        const metricsResponse = await fetch('/api/metrics/live');
        setMetricsApiReady(metricsResponse.ok || metricsResponse.status === 401);
      } catch {
        setMetricsApiReady(false);
      }
    } catch (error) {
      console.error('[FirstLightHealthCard] Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (!health) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Server className="w-5 h-5 text-zinc-400" />
          <h3 className="font-semibold text-white">System Health</h3>
        </div>
        <div className="text-sm text-zinc-400">Loading health status...</div>
      </div>
    );
  }

  const StatusIcon = ({ connected }: { connected: boolean }) => 
    connected ? (
      <CheckCircle2 className="w-4 h-4 text-green-400" />
    ) : (
      <XCircle className="w-4 h-4 text-red-400" />
    );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-zinc-400" />
          <h3 className="font-semibold text-white">System Health</h3>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="text-zinc-400 hover:text-zinc-300 transition-colors disabled:opacity-50"
          title="Refresh Health"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">Database</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon connected={health.database === 'connected'} />
            <span className={`text-sm ${health.database === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
              {health.database === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">Sessions API</span>
          </div>
          <div className="flex items-center gap-2">
            {sessionsApiReady === null ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-zinc-400">Checking...</span>
              </>
            ) : (
              <>
                <StatusIcon connected={sessionsApiReady} />
                <span className={`text-sm ${sessionsApiReady ? 'text-green-400' : 'text-red-400'}`}>
                  {sessionsApiReady ? 'Ready' : 'Blocked'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">Metrics API</span>
          </div>
          <div className="flex items-center gap-2">
            {metricsApiReady === null ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-zinc-400">Checking...</span>
              </>
            ) : (
              <>
                <StatusIcon connected={metricsApiReady} />
                <span className={`text-sm ${metricsApiReady ? 'text-green-400' : 'text-red-400'}`}>
                  {metricsApiReady ? 'Ready' : 'Blocked'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">Auth</span>
          </div>
          <div className="flex items-center gap-2">
            {health.firstLightMode ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-500 rounded-full"></div>
                <span className="text-sm text-zinc-400">Bypassed for First Light</span>
              </>
            ) : (
              <>
                <StatusIcon connected={health.auth === 'enabled'} />
                <span className={`text-sm ${health.auth === 'enabled' ? 'text-green-400' : 'text-zinc-400'}`}>
                  {health.auth === 'enabled' ? 'Enabled' : 'Bypassed'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {health.database === 'disconnected' && health.databaseError && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-800/50 rounded text-xs text-red-200">
          <div className="font-medium mb-1">Database Error:</div>
          <div className="text-red-300">{health.databaseError}</div>
        </div>
      )}
    </div>
  );
}

