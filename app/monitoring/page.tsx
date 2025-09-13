'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  metrics: {
    totalEvents: number;
    recentEvents: number;
    errorCount: number;
    criticalCount: number;
    uptime: number;
    recentErrors: number;
    recentCritical: number;
    trustLockVerified: boolean;
  };
  recentEvents: Array<{
    id: string;
    type: string;
    level: string;
    message: string;
    timestamp: number;
    trustLockVerified: boolean;
  }>;
  alerts: {
    active: number;
    recent: number;
  };
}

export default function MonitoringPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [trustLockVerified, setTrustLockVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Trust-Lock verification for monitoring access
    const verifyTrustLock = async () => {
      try {
        const response = await fetch('/api/trust-lock/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'monitoring_access',
            context: 'system_monitoring'
          })
        });
        
        if (response.ok) {
          setTrustLockVerified(true);
        }
      } catch (error) {
        console.error('Trust-Lock verification failed:', error);
      }
    };

    verifyTrustLock();
  }, []);

  useEffect(() => {
    if (!trustLockVerified) return;

    const fetchHealthStatus = async () => {
      try {
        const response = await fetch('/api/monitoring/health');
        const data = await response.json();
        
        if (data.success) {
          setHealthStatus(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch health status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthStatus();

    // Auto-refresh every 30 seconds
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchHealthStatus, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [trustLockVerified, autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!trustLockVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Trust-Lock Verification Required</h2>
          <p className="text-gray-300 mb-6">
            Please complete Trust-Lock verification to access monitoring dashboard.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">System Monitoring</h1>
            <p className="text-gray-300">Real-time system health and performance monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">Trust-Lock Verified</span>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
          </div>
        </div>

        {/* Status Overview */}
        {healthStatus && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">System Status</h3>
                <span className="text-2xl">{getStatusIcon(healthStatus.status)}</span>
              </div>
              <p className={`text-2xl font-bold ${getStatusColor(healthStatus.status)}`}>
                {healthStatus.status.toUpperCase()}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Last updated: {new Date(healthStatus.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Uptime</h3>
                <span className="text-2xl">⏱️</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatUptime(healthStatus.metrics.uptime)}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                System uptime
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Errors</h3>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {healthStatus.metrics.recentErrors}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Last hour
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
                <span className="text-2xl">🚨</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {healthStatus.alerts.active}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {healthStatus.alerts.recent} recent
              </p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {healthStatus && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* System Metrics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">System Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Events</span>
                  <span className="text-white font-semibold">{healthStatus.metrics.totalEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Recent Events (1h)</span>
                  <span className="text-white font-semibold">{healthStatus.metrics.recentEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Error Count</span>
                  <span className="text-red-400 font-semibold">{healthStatus.metrics.errorCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Critical Count</span>
                  <span className="text-red-400 font-semibold">{healthStatus.metrics.criticalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Trust-Lock Verified</span>
                  <span className={`font-semibold ${healthStatus.metrics.trustLockVerified ? 'text-green-400' : 'text-red-400'}`}>
                    {healthStatus.metrics.trustLockVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Recent Events</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {healthStatus.recentEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        event.level === 'critical' ? 'text-red-400' :
                        event.level === 'error' ? 'text-red-300' :
                        event.level === 'warning' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {event.level.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white text-sm mb-1">{event.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">{event.type}</span>
                      {event.trustLockVerified && (
                        <span className="text-green-400 text-xs">🔒 Verified</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Refresh Data
          </button>
          <Link
            href="/admin"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Admin Control
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
