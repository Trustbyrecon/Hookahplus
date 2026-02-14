'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { 
  Activity, 
  Database, 
  Zap, 
  AlertCircle, 
  TrendingUp, 
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface MonitoringData {
  health: {
    status: 'ok' | 'degraded' | 'down';
    checks: Record<string, { status: 'ok' | 'degraded' | 'down'; message?: string }>;
    timestamp: string;
  };
  cache: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
  };
  performance: {
    api: {
      totalRequests: number;
      averageResponseTime: number;
      p50: number;
      p95: number;
      p99: number;
      errorRate: number;
      slowestEndpoints: Array<{ endpoint: string; avgTime: number; count: number }>;
    };
    database: {
      totalQueries: number;
      averageDuration: number;
      p50: number;
      p95: number;
      p99: number;
      errorRate: number;
      slowestQueries: Array<{ query: string; avgDuration: number; count: number }>;
    };
  };
  metrics: {
    cache: any;
    database: any;
    application: any;
  };
}

export default function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeWindow, setTimeWindow] = useState(5);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch all monitoring data in parallel
      const [healthRes, cacheRes, performanceRes, metricsRes] = await Promise.all([
        fetch('/api/health/ready'),
        fetch('/api/cache/stats'),
        fetch(`/api/monitoring/performance?timeWindow=${timeWindow}`),
        fetch('/api/metrics?format=json'),
      ]);

      const [health, cache, performance, metrics] = await Promise.all([
        healthRes.json(),
        cacheRes.json(),
        performanceRes.json(),
        metricsRes.json(),
      ]);

      setData({
        health,
        cache: cache.cache,
        performance: performance,
        metrics,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeWindow]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-zinc-400" />;
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Operational Dashboard</h1>
            <p className="text-zinc-400">Real-time system health and performance monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700"
            >
              <option value={1}>Last 1 minute</option>
              <option value={5}>Last 5 minutes</option>
              <option value={15}>Last 15 minutes</option>
              <option value={30}>Last 30 minutes</option>
              <option value={60}>Last 60 minutes</option>
            </select>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border ${
                autoRefresh
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Health Status */}
        {data?.health && (
          <Card className="p-6 mb-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>System Health</span>
              </h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(data.health.status)}
                <span className={`font-semibold ${getStatusColor(data.health.status)}`}>
                  {data.health.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.health.checks || {}).map(([name, check]) => (
                <div
                  key={name}
                  className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300 capitalize">{name}</span>
                    {getStatusIcon(check.status)}
                  </div>
                  {check.message && (
                    <p className="text-sm text-zinc-400 mt-1">{check.message}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Cache Statistics */}
        {data?.cache && (
          <Card className="p-6 mb-6 bg-zinc-900 border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Cache Performance</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Size</div>
                <div className="text-2xl font-bold text-white">{data.cache.size}</div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Hits</div>
                <div className="text-2xl font-bold text-green-400">{data.cache.hits}</div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Misses</div>
                <div className="text-2xl font-bold text-yellow-400">{data.cache.misses}</div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Hit Rate</div>
                <div className="text-2xl font-bold text-blue-400">
                  {(data.cache.hitRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Evictions</div>
                <div className="text-2xl font-bold text-red-400">{data.cache.evictions}</div>
              </div>
            </div>
          </Card>
        )}

        {/* API Performance */}
        {data?.performance?.api && (
          <Card className="p-6 mb-6 bg-zinc-900 border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>API Performance</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Total Requests</div>
                <div className="text-2xl font-bold text-white">
                  {data.performance.api.totalRequests}
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Avg Response</div>
                <div className="text-2xl font-bold text-blue-400">
                  {data.performance.api.averageResponseTime.toFixed(0)}ms
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">P95</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {data.performance.api.p95.toFixed(0)}ms
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Error Rate</div>
                <div className="text-2xl font-bold text-red-400">
                  {(data.performance.api.errorRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            {data.performance.api.slowestEndpoints.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Slowest Endpoints</h3>
                <div className="space-y-2">
                  {data.performance.api.slowestEndpoints.slice(0, 5).map((endpoint, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <span className="text-zinc-300 font-mono text-sm">{endpoint.endpoint}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-zinc-400 text-sm">{endpoint.count} requests</span>
                        <span className="text-yellow-400 font-semibold">
                          {endpoint.avgTime.toFixed(0)}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Database Performance */}
        {data?.performance?.database && (
          <Card className="p-6 mb-6 bg-zinc-900 border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Database Performance</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Total Queries</div>
                <div className="text-2xl font-bold text-white">
                  {data.performance.database.totalQueries}
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Avg Duration</div>
                <div className="text-2xl font-bold text-blue-400">
                  {data.performance.database.averageDuration.toFixed(0)}ms
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">P95</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {data.performance.database.p95.toFixed(0)}ms
                </div>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-zinc-400 text-sm mb-1">Error Rate</div>
                <div className="text-2xl font-bold text-red-400">
                  {(data.performance.database.errorRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            {data.performance.database.slowestQueries.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Slowest Queries</h3>
                <div className="space-y-2">
                  {data.performance.database.slowestQueries.slice(0, 5).map((query, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-zinc-400 text-sm">{query.count} queries</span>
                        <span className="text-yellow-400 font-semibold">
                          {query.avgDuration.toFixed(0)}ms
                        </span>
                      </div>
                      <code className="text-xs text-zinc-300 font-mono break-all">
                        {query.query}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Last Updated */}
        {data && (
          <div className="text-center text-zinc-500 text-sm mt-8">
            Last updated: {new Date().toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

