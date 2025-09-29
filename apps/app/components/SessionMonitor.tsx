"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  RefreshCw,
  Eye,
  EyeOff,
  Timer,
  Target,
  ChefHat,
  Truck,
  UserCheck,
  Crown,
  Shield
} from 'lucide-react';
import Button from './Button';

interface SessionMonitorProps {
  sessions: any[];
  userRole: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  onRefresh?: () => void;
}

export function SessionMonitor({ sessions, userRole, onRefresh }: SessionMonitorProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [showAlerts, setShowAlerts] = useState(true);
  const [alertThresholds, setAlertThresholds] = useState({
    maxWaitTime: 15, // minutes
    maxPrepTime: 10, // minutes
    maxActiveTime: 60, // minutes
    maxQueueSize: 20
  });

  // Real-time metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const activeSessions = sessions.filter(s => s.state === 'ACTIVE');
    const prepSessions = sessions.filter(s => s.state === 'PREP_IN_PROGRESS');
    const readySessions = sessions.filter(s => s.state === 'READY_FOR_DELIVERY');
    const waitingSessions = sessions.filter(s => s.state === 'NEW');
    const edgeCaseSessions = sessions.filter(s => s.edgeCase);

    // Calculate wait times
    const avgWaitTime = sessions.length > 0 
      ? sessions.reduce((sum, s) => {
          const waitTime = s.startedAt 
            ? (now.getTime() - new Date(s.startedAt).getTime()) / 60000
            : (now.getTime() - new Date(s.createdAt).getTime()) / 60000;
          return sum + waitTime;
        }, 0) / sessions.length
      : 0;

    // Calculate throughput
    const completedToday = sessions.filter(s => 
      s.state === 'COMPLETED' && 
      new Date(s.endedAt || s.updatedAt).toDateString() === now.toDateString()
    ).length;

    // Calculate revenue
    const todayRevenue = sessions
      .filter(s => s.state === 'COMPLETED' && 
        new Date(s.endedAt || s.updatedAt).toDateString() === now.toDateString())
      .reduce((sum, s) => sum + (s.priceCents || 0), 0) / 100;

    return {
      total: sessions.length,
      active: activeSessions.length,
      prep: prepSessions.length,
      ready: readySessions.length,
      waiting: waitingSessions.length,
      edgeCases: edgeCaseSessions.length,
      avgWaitTime: Math.round(avgWaitTime),
      completedToday,
      todayRevenue,
      throughput: completedToday / Math.max(1, Math.floor((now.getHours() - 9) / 1)) // sessions per hour
    };
  }, [sessions]);

  // Alerts and warnings
  const alerts = useMemo(() => {
    const alerts = [];
    const now = new Date();

    // Long wait time alerts
    sessions.forEach(session => {
      const waitTime = session.startedAt 
        ? (now.getTime() - new Date(session.startedAt).getTime()) / 60000
        : (now.getTime() - new Date(session.createdAt).getTime()) / 60000;

      if (waitTime > alertThresholds.maxWaitTime) {
        alerts.push({
          type: 'warning',
          message: `Table ${session.tableId} waiting ${Math.round(waitTime)} minutes`,
          sessionId: session.id,
          priority: 'high'
        });
      }
    });

    // Queue size alerts
    if (metrics.waiting > alertThresholds.maxQueueSize) {
      alerts.push({
        type: 'alert',
        message: `Queue size (${metrics.waiting}) exceeds threshold (${alertThresholds.maxQueueSize})`,
        priority: 'high'
      });
    }

    // Edge case alerts
    sessions.filter(s => s.edgeCase).forEach(session => {
      alerts.push({
        type: 'error',
        message: `Table ${session.tableId} has ${session.edgeCase} issue`,
        sessionId: session.id,
        priority: 'urgent'
      });
    });

    return alerts.sort((a, b) => {
      const priorityOrder: { [key: string]: number } = { 'urgent': 3, 'high': 2, 'medium': 1, 'low': 0 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }, [sessions, alertThresholds, metrics]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400 bg-green-500/20';
      case 'PREP_IN_PROGRESS': return 'text-yellow-400 bg-yellow-500/20';
      case 'READY_FOR_DELIVERY': return 'text-blue-400 bg-blue-500/20';
      case 'NEW': return 'text-gray-400 bg-gray-500/20';
      case 'PAUSED': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'alert': return <Zap className="w-4 h-4 text-orange-400" />;
      default: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>Real-Time Monitor</span>
            {autoRefresh && (
              <div className="flex items-center space-x-1 text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}
          </h3>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={autoRefresh ? 'primary' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {autoRefresh ? 'Pause' : 'Resume'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRefresh?.()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant={showAlerts ? 'primary' : 'outline'}
              onClick={() => setShowAlerts(!showAlerts)}
            >
              {showAlerts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Alerts
            </Button>
          </div>
        </div>

        {/* Refresh Interval */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-zinc-400">Refresh:</span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-sm"
          >
            <option value={2000}>2 seconds</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-white">{metrics.total}</div>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-sm text-zinc-400">Total Sessions</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-green-400">{metrics.active}</div>
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-sm text-zinc-400">Active</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-yellow-400">{metrics.prep}</div>
            <ChefHat className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-sm text-zinc-400">In Prep</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-blue-400">{metrics.ready}</div>
            <CheckCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-sm text-zinc-400">Ready</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-white">{metrics.completedToday}</div>
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-sm text-zinc-400">Completed Today</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-green-400">${metrics.todayRevenue.toFixed(0)}</div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-sm text-zinc-400">Today's Revenue</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Wait Time</span>
          </h4>
          <div className="text-2xl font-bold text-white">{metrics.avgWaitTime} min</div>
          <div className="text-sm text-zinc-400">Average wait time</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span>Throughput</span>
          </h4>
          <div className="text-2xl font-bold text-white">{metrics.throughput.toFixed(1)}</div>
          <div className="text-sm text-zinc-400">Sessions per hour</div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Issues</span>
          </h4>
          <div className="text-2xl font-bold text-white">{metrics.edgeCases}</div>
          <div className="text-sm text-zinc-400">Active issues</div>
        </div>
      </div>

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <h4 className="font-medium mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Active Alerts ({alerts.length})</span>
          </h4>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
                  alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-orange-500/10 border-orange-500/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {getAlertIcon(alert.type)}
                  <span className="text-sm font-medium">{alert.message}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    alert.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {alert.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Status Breakdown */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
        <h4 className="font-medium mb-4">Session Status Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries({
            'NEW': metrics.waiting,
            'PREP_IN_PROGRESS': metrics.prep,
            'READY_FOR_DELIVERY': metrics.ready,
            'ACTIVE': metrics.active
          }).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                {status.replace('_', ' ')}
              </div>
              <div className="text-2xl font-bold text-white mt-2">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
