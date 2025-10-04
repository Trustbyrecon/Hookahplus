// components/ReflexMonitor.tsx
// Reflex System Monitor - Real-time agent performance dashboard

import React, { useState, useEffect } from 'react';
import type { 
  GhostLogEntry, 
  TrustGraphNode, 
  ReflexScore,
  FailureAnalysis 
} from '../types/reflex';

interface ReflexMonitorProps {
  agentId?: string;
  refreshInterval?: number;
  showDetails?: boolean;
}

interface SystemHealth {
  overallHealth: number;
  activeAgents: number;
  criticalIssues: number;
  recentFailures: GhostLogEntry[];
  trustGraphHealth: number;
}

interface AgentStats {
  totalOperations: number;
  successRate: number;
  averageScore: number;
  failureRate: number;
  commonFailures: { type: string; count: number }[];
  trustScore: number;
}

export default function ReflexMonitor({ 
  agentId, 
  refreshInterval = 5000,
  showDetails = true 
}: ReflexMonitorProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<GhostLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch system health
        const healthResponse = await fetch('/api/reflex/health');
        if (healthResponse.ok) {
          const health = await healthResponse.json();
          setSystemHealth(health.data);
        }

        // Fetch agent stats if specific agent selected
        if (agentId) {
          const statsResponse = await fetch(`/api/reflex/agent/${agentId}/stats`);
          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            setAgentStats(stats.data);
          }
        }

        // Fetch recent entries
        const entriesResponse = await fetch(`/api/reflex/entries?limit=20${agentId ? `&agentId=${agentId}` : ''}`);
        if (entriesResponse.ok) {
          const entries = await entriesResponse.json();
          setRecentEntries(entries.data);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reflex data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [agentId, refreshInterval]);

  const getScoreColor = (score: number): string => {
    if (score >= 0.92) return 'text-green-600';
    if (score >= 0.87) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number): string => {
    if (score >= 0.92) return '✅';
    if (score >= 0.87) return '⚠️';
    return '❌';
  };

  const getHealthColor = (health: number): string => {
    if (health >= 0.9) return 'bg-green-500';
    if (health >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-red-600 text-xl mr-2">❌</span>
          <div>
            <h3 className="text-red-800 font-semibold">Reflex Monitor Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🧠</span>
            Reflex System Health
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full ${getHealthColor(systemHealth.overallHealth)} mx-auto mb-2 flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">
                  {Math.round(systemHealth.overallHealth * 100)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Overall Health</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {systemHealth.activeAgents}
              </div>
              <p className="text-sm text-gray-600">Active Agents</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {systemHealth.criticalIssues}
              </div>
              <p className="text-sm text-gray-600">Critical Issues</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(systemHealth.trustGraphHealth * 100)}%
              </div>
              <p className="text-sm text-gray-600">Trust Health</p>
            </div>
          </div>

          {systemHealth.recentFailures.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Recent Failures</h4>
              <div className="space-y-1">
                {systemHealth.recentFailures.slice(0, 3).map((failure, index) => (
                  <div key={index} className="text-sm text-red-700">
                    <span className="font-medium">{failure.agentId}</span>: {failure.action} 
                    {failure.failureType && (
                      <span className="ml-2 px-2 py-1 bg-red-200 rounded text-xs">
                        {failure.failureType}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Agent Statistics */}
      {agentStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🤖</span>
            Agent Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {agentStats.totalOperations}
              </div>
              <p className="text-sm text-gray-600">Total Operations</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(agentStats.successRate * 100)}%
              </div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${getScoreColor(agentStats.averageScore)}`}>
                {Math.round(agentStats.averageScore * 100)}
              </div>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </div>

          {agentStats.commonFailures.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Common Failures</h4>
              <div className="space-y-1">
                {agentStats.commonFailures.slice(0, 5).map((failure, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{failure.type}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                      {failure.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Operations */}
      {showDetails && recentEntries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Recent Operations
          </h2>
          
          <div className="space-y-2">
            {recentEntries.slice(0, 10).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getScoreIcon(entry.score)}</span>
                  <div>
                    <div className="font-medium text-sm">
                      {entry.agentId} - {entry.action}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getScoreColor(entry.score)}`}>
                    {Math.round(entry.score * 100)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    entry.outcome === 'success' ? 'bg-green-100 text-green-800' :
                    entry.outcome === 'failure' ? 'bg-red-100 text-red-800' :
                    entry.outcome === 'recovery' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.outcome}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
