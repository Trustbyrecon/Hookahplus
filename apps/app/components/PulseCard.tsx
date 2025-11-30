'use client';

import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  RefreshCw,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface PulseData {
  summary: string;
  metrics: {
    sessions: number;
    revenue: number;
    avgDuration: number;
    edgeCases: number;
  };
  topFlavors: Array<{ name: string; count: number }>;
  recommendations: string[];
  timestamp: string;
  window: '24h' | '12h';
}

interface PulseCardProps {
  compact?: boolean;
  window?: '24h' | 'pm';
  loungeId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export default function PulseCard({ 
  compact = false, 
  window = '24h',
  loungeId,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 minutes
}: PulseCardProps) {
  const [pulseData, setPulseData] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWindow, setCurrentWindow] = useState<'24h' | 'pm'>(window);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchPulse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we're in demo mode from URL
      const isDemoMode = typeof window !== 'undefined' && 
        window.location &&
        new URLSearchParams(window.location.search).get('mode') === 'demo';
      
      const params = new URLSearchParams({
        window: currentWindow,
      });
      if (loungeId) {
        params.append('loungeId', loungeId);
      }
      if (isDemoMode) {
        params.append('demo', 'true');
      }

      const response = await fetch(`/api/pulse?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.pulse) {
        setPulseData(data.pulse);
        setLastRefresh(new Date());
        // In demo mode, always clear errors and use demo data
        if (data.demo || isDemoMode) {
          setError(null);
        }
      } else {
        // In demo mode, use demo data instead of showing error
        if (isDemoMode) {
          // Fetch demo pulse data
          const demoParams = new URLSearchParams({ window: currentWindow, demo: 'true' });
          if (loungeId) {
            demoParams.append('loungeId', loungeId);
          }
          const demoResponse = await fetch(`/api/pulse?${demoParams.toString()}`);
          const demoData = await demoResponse.json();
          if (demoData.success && demoData.pulse) {
            setPulseData(demoData.pulse);
            setError(null);
          }
        } else {
          setError(data.error || 'Failed to load pulse');
        }
      }
    } catch (err) {
      console.error('Error fetching pulse:', err);
      // In demo mode, try to load demo data instead of showing error
      const isDemoMode = typeof window !== 'undefined' && 
        window.location && 
        new URLSearchParams(window.location.search).get('mode') === 'demo';
      if (isDemoMode) {
        try {
          const demoParams = new URLSearchParams({ window: currentWindow, demo: 'true' });
          if (loungeId) {
            demoParams.append('loungeId', loungeId);
          }
          const demoResponse = await fetch(`/api/pulse?${demoParams.toString()}`);
          const demoData = await demoResponse.json();
          if (demoData.success && demoData.pulse) {
            setPulseData(demoData.pulse);
            setError(null);
          }
        } catch (demoErr) {
          console.error('Error loading demo pulse:', demoErr);
          // Even in demo mode, if we can't load demo data, don't show error
          setError(null);
        }
      } else {
        setError('Failed to load pulse data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, [currentWindow, loungeId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPulse();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, currentWindow, loungeId]);

  const handleRefresh = () => {
    fetchPulse();
  };

  const handleWindowToggle = () => {
    setCurrentWindow(currentWindow === '24h' ? 'pm' : '24h');
  };

  if (compact) {
    return (
      <Card className="border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-teal-400">Daily Pulse</h3>
              <button
                onClick={handleWindowToggle}
                className="text-xs text-zinc-400 hover:text-teal-400 px-2 py-1 rounded bg-zinc-800/50"
              >
                {currentWindow === '24h' ? 'AM' : '3PM'}
              </button>
            </div>
            {loading ? (
              <div className="text-xs text-zinc-400">Loading...</div>
            ) : error ? (
              <div className="text-xs text-red-400">{error}</div>
            ) : pulseData ? (
              <div className="space-y-1">
                <p className="text-xs text-zinc-300 line-clamp-2">{pulseData.summary}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {pulseData.metrics.sessions}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${pulseData.metrics.revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleRefresh}
              className="p-1 text-zinc-400 hover:text-teal-400 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/pulse">
              <ChevronRight className="w-4 h-4 text-zinc-400 hover:text-teal-400 transition-colors" />
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-teal-500/30 bg-teal-500/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white">Daily Pulse</h3>
          <button
            onClick={handleWindowToggle}
            className="text-sm text-zinc-400 hover:text-teal-400 px-3 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700"
          >
            {currentWindow === '24h' ? 'Morning (24h)' : '3PM (12h)'}
          </button>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-zinc-400 hover:text-teal-400 transition-colors rounded-lg hover:bg-zinc-800/50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-zinc-400">Loading pulse data...</div>
      ) : error && !(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'demo') ? (
        <div className="text-center py-8 text-red-400">{error}</div>
      ) : pulseData ? (
        <div className="space-y-4">
          {/* Summary */}
          <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
            <p className="text-sm text-zinc-300 leading-relaxed">{pulseData.summary}</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-zinc-400">Sessions</span>
              </div>
              <div className="text-xl font-bold text-white">{pulseData.metrics.sessions}</div>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs text-zinc-400">Revenue</span>
              </div>
              <div className="text-xl font-bold text-white">${pulseData.metrics.revenue.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-zinc-400">Avg Duration</span>
              </div>
              <div className="text-xl font-bold text-white">{pulseData.metrics.avgDuration.toFixed(0)}min</div>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-zinc-400">Edge Cases</span>
              </div>
              <div className="text-xl font-bold text-white">{pulseData.metrics.edgeCases}</div>
            </div>
          </div>

          {/* Top Flavors */}
          {pulseData.topFlavors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-2">Top Flavors</h4>
              <div className="flex flex-wrap gap-2">
                {pulseData.topFlavors.map((flavor, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-lg text-sm border border-teal-500/30"
                  >
                    {flavor.name} ({flavor.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {pulseData.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-300 mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {pulseData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="text-teal-400 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timestamp - Hidden in demo mode */}
          {!(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'demo') && pulseData && (
            <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
              Last updated: {new Date(pulseData.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}

