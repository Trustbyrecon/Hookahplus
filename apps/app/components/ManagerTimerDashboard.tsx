"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { 
  Clock, 
  Flame, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  DollarSign,
  BarChart3,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  Target,
  Timer,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Session } from '../types/session';
import { sessionTimerService } from '../lib/sessionTimerService';

interface ManagerTimerDashboardProps {
  allSessions: Session[];
  onTimerAction: (sessionId: string, action: string) => void;
  onSessionComplete: (sessionId: string) => void;
  className?: string;
}

interface TimerMetrics {
  totalActiveTimers: number;
  averageSessionDuration: number;
  revenuePerHour: number;
  overdueSessions: number;
  staffEfficiency: number;
  peakTimeSessions: number;
}

interface StaffPerformance {
  staffId: string;
  name: string;
  role: 'BOH' | 'FOH';
  activeSessions: number;
  completedSessions: number;
  averageSessionTime: number;
  efficiency: number;
}

interface OverdueSession {
  sessionId: string;
  tableId: string;
  customerRef: string;
  timeOverdue: number;
  assignedStaff: string;
  severity: 'warning' | 'critical' | 'urgent';
}

export const ManagerTimerDashboard: React.FC<ManagerTimerDashboardProps> = ({
  allSessions,
  onTimerAction,
  onSessionComplete,
  className
}) => {
  const [timerStates, setTimerStates] = useState<Map<string, any>>(new Map());
  const [metrics, setMetrics] = useState<TimerMetrics>({
    totalActiveTimers: 0,
    averageSessionDuration: 0,
    revenuePerHour: 0,
    overdueSessions: 0,
    staffEfficiency: 0,
    peakTimeSessions: 0
  });
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [overdueSessions, setOverdueSessions] = useState<OverdueSession[]>([]);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Filter sessions with timers
  const timerSessions = allSessions.filter(session => 
    session.timerDuration && 
    (session.state === 'ACTIVE' || session.state === 'PAUSED')
  );

  // Calculate metrics
  useEffect(() => {
    const activeTimers = timerSessions.length;
    const totalRevenue = allSessions.reduce((sum, s) => sum + s.priceCents, 0);
    const totalDuration = allSessions.reduce((sum, s) => sum + (s.durationSecs || 0), 0);
    const completedSessions = allSessions.filter(s => s.state === 'COMPLETED').length;
    
    const newMetrics: TimerMetrics = {
      totalActiveTimers: activeTimers,
      averageSessionDuration: completedSessions > 0 ? totalDuration / completedSessions / 60 : 0,
      revenuePerHour: totalRevenue / 100 / Math.max(1, totalDuration / 3600),
      overdueSessions: 0, // Will be calculated below
      staffEfficiency: 85, // Mock data
      peakTimeSessions: 12 // Mock data
    };

    // Calculate overdue sessions
    const overdue: OverdueSession[] = [];
    timerSessions.forEach(session => {
      const timerState = timerStates.get(session.id);
      if (timerState && timerState.timeRemaining <= 0) {
        const timeOverdue = Math.abs(timerState.timeRemaining);
        overdue.push({
          sessionId: session.id,
          tableId: session.tableId,
          customerRef: session.customerRef || 'Guest',
          timeOverdue,
          assignedStaff: session.assignedFOHId || session.assignedBOHId || 'Unassigned',
          severity: timeOverdue > 300 ? 'urgent' : timeOverdue > 180 ? 'critical' : 'warning'
        });
      }
    });

    newMetrics.overdueSessions = overdue.length;
    setOverdueSessions(overdue);
    setMetrics(newMetrics);

    // Calculate staff performance (mock data for now)
    const staff: StaffPerformance[] = [
      {
        staffId: 'foh-1',
        name: 'John Smith',
        role: 'FOH',
        activeSessions: timerSessions.filter(s => s.assignedFOHId === 'foh-1').length,
        completedSessions: 15,
        averageSessionTime: 45,
        efficiency: 92
      },
      {
        staffId: 'foh-2',
        name: 'Emily Davis',
        role: 'FOH',
        activeSessions: timerSessions.filter(s => s.assignedFOHId === 'foh-2').length,
        completedSessions: 12,
        averageSessionTime: 48,
        efficiency: 88
      },
      {
        staffId: 'boh-1',
        name: 'Mike Rodriguez',
        role: 'BOH',
        activeSessions: timerSessions.filter(s => s.assignedBOHId === 'boh-1').length,
        completedSessions: 18,
        averageSessionTime: 42,
        efficiency: 95
      }
    ];
    setStaffPerformance(staff);
  }, [timerSessions, timerStates, allSessions]);

  // Register timers for all sessions
  useEffect(() => {
    timerSessions.forEach(session => {
      if (!session.timerDuration) return;

      const handleTimerUpdate = (timerState: any) => {
        setTimerStates(prev => new Map(prev.set(session.id, timerState)));
      };

      // Start timer for this session
      sessionTimerService.startTimer(session.id, session.timerDuration, handleTimerUpdate);
    });

    return () => {
      timerSessions.forEach(session => {
        sessionTimerService.stopTimer(session.id);
      });
    };
  }, [timerSessions, onSessionComplete]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger re-calculation of metrics
      setTimerStates(prev => new Map(prev));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'critical': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getTimeColor = (timeRemaining: number, totalDuration: number) => {
    const percentageRemaining = (timeRemaining / totalDuration) * 100;
    if (percentageRemaining > 50) return 'text-green-400';
    if (percentageRemaining > 25) return 'text-yellow-400';
    if (percentageRemaining > 10) return 'text-orange-400';
    return 'text-red-400';
  };

  const filteredSessions = showOverdueOnly 
    ? timerSessions.filter(session => {
        const timerState = timerStates.get(session.id);
        return timerState && timerState.timeRemaining <= 0;
      })
    : timerSessions;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Timer className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">Timer Management Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="overdue-only"
              checked={showOverdueOnly}
              onChange={(e) => setShowOverdueOnly(e.target.checked)}
              className="w-4 h-4 text-purple-500 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="overdue-only" className="text-sm text-zinc-300">
              Show overdue only
            </label>
          </div>
          <button
            onClick={() => setTimerStates(prev => new Map(prev))}
            className="flex items-center space-x-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-white">{metrics.totalActiveTimers}</div>
            <Timer className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-sm text-zinc-400">Active Timers</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-white">{metrics.averageSessionDuration.toFixed(0)}m</div>
            <Clock className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-sm text-zinc-400">Avg Duration</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-white">${metrics.revenuePerHour.toFixed(0)}</div>
            <DollarSign className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="text-sm text-zinc-400">Revenue/Hour</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-white">{metrics.overdueSessions}</div>
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-sm text-zinc-400">Overdue</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-white">{metrics.staffEfficiency}%</div>
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-sm text-zinc-400">Efficiency</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-white">{metrics.peakTimeSessions}</div>
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="text-sm text-zinc-400">Peak Sessions</div>
        </div>
      </div>

      {/* Overdue Sessions Alert */}
      {overdueSessions.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Overdue Sessions Requiring Attention</h3>
          </div>
          <div className="space-y-2">
            {overdueSessions.map((session, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  getSeverityColor(session.severity)
                )}
              >
                <div className="flex items-center space-x-3">
                  <Flame className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Table {session.tableId}</div>
                    <div className="text-sm opacity-75">{session.customerRef}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatTime(session.timeOverdue)} overdue</div>
                  <div className="text-sm opacity-75">{session.assignedStaff}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Performance */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-400" />
          Staff Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {staffPerformance.map((staff, index) => (
            <div key={index} className="bg-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-white">{staff.name}</div>
                <div className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  staff.role === 'FOH' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                )}>
                  {staff.role}
                </div>
              </div>
              <div className="space-y-1 text-sm text-zinc-400">
                <div>Active: {staff.activeSessions}</div>
                <div>Completed: {staff.completedSessions}</div>
                <div>Avg Time: {staff.averageSessionTime}m</div>
                <div className="flex items-center space-x-2">
                  <span>Efficiency:</span>
                  <div className="flex-1 bg-zinc-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${staff.efficiency}%` }}
                    />
                  </div>
                  <span className="text-green-400 font-medium">{staff.efficiency}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Timer Sessions */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-purple-400" />
          All Timer Sessions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map(session => {
            const timerState = timerStates.get(session.id);
            if (!timerState) return null;

            const timeRemaining = timerState.timeRemaining;
            const totalDuration = session.timerDuration! * 60;
            const isOverdue = timeRemaining <= 0;

            return (
              <div
                key={session.id}
                className={cn(
                  'bg-zinc-700/50 rounded-lg p-4 border transition-colors',
                  isOverdue ? 'border-red-500/50 bg-red-500/10' : 'border-zinc-600 hover:border-zinc-500'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-teal-400" />
                    <span className="font-semibold text-white">Table {session.tableId}</span>
                  </div>
                  <div className="text-sm text-zinc-400">
                    {session.assignedFOHId || session.assignedBOHId || 'Unassigned'}
                  </div>
                </div>

                <div className="text-center mb-3">
                  <div className={cn(
                    'text-2xl font-bold mb-2',
                    getTimeColor(timeRemaining, totalDuration)
                  )}>
                    {isOverdue ? `+${formatTime(Math.abs(timeRemaining))}` : formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {isOverdue ? 'Overdue' : 'Remaining'}
                  </div>
                </div>

                <div className="w-full bg-zinc-600 rounded-full h-2 mb-3">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-1000',
                      isOverdue ? 'bg-red-500' : 'bg-teal-500'
                    )}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((totalDuration - timeRemaining) / totalDuration) * 100))}%` 
                    }}
                  />
                </div>

                <div className="text-sm text-zinc-400">
                  <div>Customer: {session.customerRef || 'Guest'}</div>
                  <div>Flavor: {session.flavor || 'Custom'}</div>
                  <div>Status: {timerState.isRunning ? 'Running' : timerState.isPaused ? 'Paused' : 'Stopped'}</div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400">
              {showOverdueOnly ? 'No overdue sessions' : 'No active timer sessions'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
