"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Activity,
  Server,
  Database,
  Clock,
  Zap
} from 'lucide-react';
import { Card } from '../../components';

interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  app: string;
  build: string;
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch health status');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === 'healthy';

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Server className="w-16 h-16 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Server Status
            </span>
          </h1>
          <p className="text-xl text-zinc-400">
            Hookah+ Application Server
          </p>
        </div>

        {/* Status Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {loading ? (
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              ) : isHealthy ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {loading ? 'Checking...' : isHealthy ? 'Operational' : 'Unavailable'}
                </h2>
                <p className="text-sm text-zinc-400">
                  {loading ? 'Fetching status...' : error || 'All systems operational'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Status Details */}
          {health && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-zinc-400">Status</span>
                </div>
                <p className="text-xl font-semibold text-green-400 capitalize">
                  {health.status}
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-zinc-400">Version</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {health.version}
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-zinc-400">Application</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {health.app}
                </p>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-zinc-400">Build</span>
                </div>
                <p className="text-xl font-semibold text-white font-mono text-sm">
                  {health.build}
                </p>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-6 pt-6 border-t border-zinc-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-zinc-400">
                <Clock className="w-4 h-4" />
                <span>Last checked:</span>
                <span className="text-white">
                  {lastChecked.toLocaleTimeString()}
                </span>
              </div>
              {health && (
                <div className="text-zinc-500">
                  Server time: {new Date(health.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/"
            className="block p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <div className="text-sm text-zinc-400 mb-1">Home</div>
            <div className="text-white font-semibold">Landing Page</div>
          </a>
          <a
            href="/fire-session-dashboard"
            className="block p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <div className="text-sm text-zinc-400 mb-1">Dashboard</div>
            <div className="text-white font-semibold">Fire Session Dashboard</div>
          </a>
          <a
            href="/api/health"
            className="block p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="text-sm text-zinc-400 mb-1">API</div>
            <div className="text-white font-semibold">Health Endpoint (JSON)</div>
          </a>
        </div>
      </div>
    </div>
  );
}

