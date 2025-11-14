'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, RefreshCw, Coffee } from 'lucide-react';

interface SessionAnalyticsCardProps {
  windowDays?: number;
  loungeId?: string;
}

export default function SessionAnalyticsCard({ windowDays = 7, loungeId }: SessionAnalyticsCardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [windowDays, loungeId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        windowDays: windowDays.toString()
      });
      if (loungeId) {
        params.append('loungeId', loungeId);
      }

      const response = await fetch(`/api/analytics/sessions?${params}`);
      const data = await response.json();

      if (data.success) {
        setMetrics(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (!metrics) return null;

  const { metrics: m, breakdown } = metrics;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white">Session Analytics</h3>
        </div>
        <span className="text-xs text-zinc-400">Last {windowDays} days</span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Total Sessions</span>
          </div>
          <p className="text-2xl font-bold text-white">{m.totalSessions}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-400">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{m.activeSessions}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-400">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">${m.revenue.toFixed(2)}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-400">Extensions</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{m.extensionCount}</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Coffee className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-zinc-400">Refills</span>
          </div>
          <p className="text-xl font-bold text-orange-400">{m.refillCount}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-zinc-400">Avg Duration</span>
          </div>
          <p className="text-xl font-bold text-teal-400">{m.avgDurationMinutes}m</p>
        </div>
      </div>

      {/* Breakdown by State */}
      {breakdown?.byState && breakdown.byState.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-zinc-400 mb-3">Sessions by State</h4>
          <div className="space-y-2">
            {breakdown.byState.map((item: any) => (
              <div key={item.state} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{item.state}</span>
                <span className="text-white font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

