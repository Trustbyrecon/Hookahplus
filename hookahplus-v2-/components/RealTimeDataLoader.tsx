// components/RealTimeDataLoader.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface DemoSession {
  id: string;
  tableId: string;
  flavor: string;
  status: string;
  staffAssigned: {
    prep: string;
    front: string;
    hookah_room: string;
  };
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  timing: {
    createdAt: string;
    estimatedPrepTime: number;
    estimatedSessionTime: number;
  };
  metadata: {
    source: string;
    zone: string;
    partySize: number;
    specialRequests?: string;
  };
}

interface DemoAlert {
  id: string;
  sessionId: string;
  alertType: string;
  priority: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  pendingAlerts: number;
  activeOperations: number;
  sessionsByStatus: Record<string, number>;
  topFlavors: Array<{flavor: string, count: number}>;
  staffUtilization: Record<string, number>;
}

interface RealTimeDataLoaderProps {
  onDataLoaded?: (data: {
    sessions: DemoSession[];
    alerts: DemoAlert[];
    stats: DashboardStats;
  }) => void;
  onFireSession?: (tableId: string, flavor: string) => void;
}

export default function RealTimeDataLoader({ 
  onDataLoaded, 
  onFireSession 
}: RealTimeDataLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Load real-time data
  const loadRealTimeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/demo-data');
      const result = await response.json();

      if (result.success) {
        const { sessions, alerts, stats: dashboardStats } = result.data;
        
        setStats(dashboardStats);
        setLastUpdate(new Date());
        
        if (onDataLoaded) {
          onDataLoaded({ sessions, alerts, stats: dashboardStats });
        }
        
        console.log('📊 Real-time data loaded:', {
          sessions: sessions.length,
          alerts: alerts.length,
          activeSessions: dashboardStats.activeSessions
        });
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Failed to load real-time data:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  // Start demo mode
  const startDemoMode = useCallback(async () => {
    try {
      const response = await fetch('/api/demo-data?action=start');
      const result = await response.json();

      if (result.success) {
        setIsDemoMode(true);
        console.log('🚀 Demo mode started');
        
        // Start polling for updates
        const interval = setInterval(loadRealTimeData, 5000);
        return () => clearInterval(interval);
      } else {
        throw new Error(result.error || 'Failed to start demo mode');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Failed to start demo mode:', errorMessage);
    }
  }, [loadRealTimeData]);

  // Stop demo mode
  const stopDemoMode = useCallback(async () => {
    try {
      const response = await fetch('/api/demo-data?action=stop');
      const result = await response.json();

      if (result.success) {
        setIsDemoMode(false);
        console.log('⏹️ Demo mode stopped');
      } else {
        throw new Error(result.error || 'Failed to stop demo mode');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Failed to stop demo mode:', errorMessage);
    }
  }, []);

  // Fire session (trigger BOH/FOH workflow)
  const fireSession = useCallback(async (tableId: string, flavor: string) => {
    try {
      const response = await fetch('/api/demo-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'fire-session',
          tableId,
          flavor,
          customerInfo: {
            name: 'Demo Customer',
            phone: '+1 (555) 123-4567',
            email: 'demo@hookahplus.com'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('🔥 Fire session triggered:', result.message);
        
        if (onFireSession) {
          onFireSession(tableId, flavor);
        }
        
        // Reload data to show the new session
        await loadRealTimeData();
      } else {
        throw new Error(result.error || 'Failed to fire session');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Failed to fire session:', errorMessage);
    }
  }, [onFireSession, loadRealTimeData]);

  // Load initial data on mount
  useEffect(() => {
    loadRealTimeData();
  }, [loadRealTimeData]);

  // Auto-refresh when demo mode is active
  useEffect(() => {
    if (isDemoMode) {
      const interval = setInterval(loadRealTimeData, 5000);
      return () => clearInterval(interval);
    }
  }, [isDemoMode, loadRealTimeData]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Real-Time Data Loader</h2>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-sm text-gray-400">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className={`w-3 h-3 rounded-full ${isDemoMode ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Demo Mode</h3>
          <div className="flex space-x-2">
            <button
              onClick={startDemoMode}
              disabled={isDemoMode || isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium"
            >
              {isDemoMode ? 'Active' : 'Start Demo'}
            </button>
            <button
              onClick={stopDemoMode}
              disabled={!isDemoMode || isLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium"
            >
              Stop Demo
            </button>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Data Refresh</h3>
          <button
            onClick={loadRealTimeData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium"
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Quick Fire Session</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => fireSession('T-001', 'Blue Mist + Mint')}
              disabled={isLoading}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg text-xs font-medium"
            >
              Fire T-001
            </button>
            <button
              onClick={() => fireSession('B-001', 'Strawberry + Vanilla')}
              disabled={isLoading}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg text-xs font-medium"
            >
              Fire B-001
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.activeSessions}</div>
            <div className="text-sm text-gray-400">Active Sessions</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.pendingAlerts}</div>
            <div className="text-sm text-gray-400">Pending Alerts</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.activeOperations}</div>
            <div className="text-sm text-gray-400">Active Operations</div>
          </div>
        </div>
      )}

      {stats && stats.sessionsByStatus && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Session Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(stats.sessionsByStatus).map(([status, count]) => (
              <div key={status} className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400 capitalize">{status.replace('_', ' ')}</div>
                <div className="text-xl font-bold text-white">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && stats.topFlavors && stats.topFlavors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Top Flavors</h3>
          <div className="space-y-2">
            {stats.topFlavors.slice(0, 5).map((flavor, index) => (
              <div key={flavor.flavor} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                <span className="text-white">{flavor.flavor}</span>
                <span className="text-green-400 font-bold">{flavor.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
