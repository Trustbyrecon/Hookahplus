"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  DollarSign, 
  Globe, 
  Server, 
  Shield, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Zap
} from 'lucide-react';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  services: {
    database: string;
    stripe: string;
    storage: string;
  };
}

interface MonitoringMetrics {
  responseTime: number;
  errorRate: number;
  requestCount: number;
  activeUsers: number;
  revenue: number;
  sessions: number;
}

export default function ProductionMonitoring() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      // In a real implementation, this would fetch from your analytics service
      const mockMetrics: MonitoringMetrics = {
        responseTime: Math.random() * 200 + 50, // 50-250ms
        errorRate: Math.random() * 2, // 0-2%
        requestCount: Math.floor(Math.random() * 1000) + 500, // 500-1500
        activeUsers: Math.floor(Math.random() * 50) + 10, // 10-60
        revenue: Math.random() * 1000 + 500, // $500-1500
        sessions: Math.floor(Math.random() * 100) + 20 // 20-120
      };
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchHealthStatus(), fetchMetrics()]);
      setIsLoading(false);
    };

    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'configured': return 'text-green-400';
      case 'misconfigured': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  if (isLoading && !healthStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-zinc-400">Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Production Monitoring</h2>
          <p className="text-zinc-400">Real-time system health and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setIsLoading(true);
              Promise.all([fetchHealthStatus(), fetchMetrics()]).finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-zinc-400">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* System Status */}
      {healthStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">System Status</h3>
              <div className={`flex items-center space-x-1 ${getStatusColor(healthStatus.status)}`}>
                {getStatusIcon(healthStatus.status)}
                <span className="text-sm font-medium capitalize">{healthStatus.status}</span>
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">Uptime</h3>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-semibold text-white">
              {formatUptime(healthStatus.uptime)}
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">Memory Usage</h3>
              <Server className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-semibold text-white">
              {formatMemory(healthStatus.memory.heapUsed)}
            </div>
            <div className="text-xs text-zinc-500">
              of {formatMemory(healthStatus.memory.heapTotal)}
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">Version</h3>
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-lg font-semibold text-white">
              v{healthStatus.version}
            </div>
            <div className="text-xs text-zinc-500 capitalize">
              {healthStatus.environment}
            </div>
          </div>
        </div>
      )}

      {/* Service Status */}
      {healthStatus && (
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium text-white">Database</div>
                  <div className={`text-sm ${getServiceStatusColor(healthStatus.services.database)}`}>
                    {healthStatus.services.database}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-medium text-white">Stripe</div>
                  <div className={`text-sm ${getServiceStatusColor(healthStatus.services.stripe)}`}>
                    {healthStatus.services.stripe}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-medium text-white">Storage</div>
                  <div className={`text-sm ${getServiceStatusColor(healthStatus.services.storage)}`}>
                    {healthStatus.services.storage}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">Response Time</h3>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.responseTime.toFixed(0)}ms
            </div>
            <div className="text-xs text-zinc-500">
              Average API response time
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">Error Rate</h3>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.errorRate.toFixed(2)}%
            </div>
            <div className="text-xs text-zinc-500">
              Failed requests
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">Requests</h3>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.requestCount.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500">
              Last hour
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">Active Users</h3>
              <Globe className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.activeUsers}
            </div>
            <div className="text-xs text-zinc-500">
              Currently online
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">Revenue</h3>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${metrics.revenue.toFixed(0)}
            </div>
            <div className="text-xs text-zinc-500">
              Last 24 hours
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-300">Sessions</h3>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.sessions}
            </div>
            <div className="text-xs text-zinc-500">
              Active sessions
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {healthStatus && healthStatus.status !== 'ok' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-red-400">System Alert</h3>
          </div>
          <p className="text-sm text-red-300">
            System status is {healthStatus.status}. Please check the service status above for more details.
          </p>
        </div>
      )}
    </div>
  );
}
