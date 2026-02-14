"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Flame,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [viewMode, setViewMode] = useState('overview');

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const viewModes = [
    { value: 'overview', label: 'Overview' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'sessions', label: 'Sessions' },
    { value: 'users', label: 'Users' },
    { value: 'performance', label: 'Performance' }
  ];

  // Mock analytics data
  const analytics = {
    revenue: {
      total: 12450,
      change: 12.5,
      trend: 'up',
      daily: [1200, 1350, 1100, 1450, 1600, 1800, 1950]
    },
    sessions: {
      total: 156,
      change: 8.3,
      trend: 'up',
      daily: [15, 18, 12, 22, 25, 28, 30]
    },
    users: {
      total: 24,
      active: 18,
      change: 5.2,
      trend: 'up'
    },
    avgSessionDuration: {
      minutes: 45,
      change: -2.1,
      trend: 'down'
    },
    peakHours: {
      start: '8:00 PM',
      end: '10:00 PM',
      sessions: 28
    },
    topFlavors: [
      { name: 'Blue Mist', count: 45, revenue: 1350 },
      { name: 'Double Apple', count: 38, revenue: 1140 },
      { name: 'Mint Fresh', count: 32, revenue: 960 },
      { name: 'Strawberry Mojito', count: 28, revenue: 840 },
      { name: 'Watermelon Mint', count: 25, revenue: 750 }
    ],
    tablePerformance: [
      { table: 'VIP-001', sessions: 12, revenue: 1800, avgDuration: 60 },
      { table: 'Patio-001', sessions: 15, revenue: 1800, avgDuration: 45 },
      { table: 'Booth-001', sessions: 18, revenue: 1980, avgDuration: 40 },
      { table: 'Table-001', sessions: 20, revenue: 1200, avgDuration: 35 },
      { table: 'Bar-001', sessions: 8, revenue: 240, avgDuration: 25 }
    ]
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">${analytics.revenue.total.toLocaleString()}</div>
              <div className="text-sm text-zinc-400">Total Revenue</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(analytics.revenue.trend)}
            <span className={`text-sm font-medium ${getTrendColor(analytics.revenue.trend)}`}>
              {analytics.revenue.change}%
            </span>
            <span className="text-xs text-zinc-400">vs last period</span>
          </div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{analytics.sessions.total}</div>
              <div className="text-sm text-zinc-400">Total Sessions</div>
            </div>
            <Flame className="w-8 h-8 text-orange-400" />
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(analytics.sessions.trend)}
            <span className={`text-sm font-medium ${getTrendColor(analytics.sessions.trend)}`}>
              {analytics.sessions.change}%
            </span>
            <span className="text-xs text-zinc-400">vs last period</span>
          </div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{analytics.users.active}</div>
              <div className="text-sm text-zinc-400">Active Users</div>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(analytics.users.trend)}
            <span className={`text-sm font-medium ${getTrendColor(analytics.users.trend)}`}>
              {analytics.users.change}%
            </span>
            <span className="text-xs text-zinc-400">vs last period</span>
          </div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{analytics.avgSessionDuration.minutes}min</div>
              <div className="text-sm text-zinc-400">Avg Duration</div>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(analytics.avgSessionDuration.trend)}
            <span className={`text-sm font-medium ${getTrendColor(analytics.avgSessionDuration.trend)}`}>
              {analytics.avgSessionDuration.change}%
            </span>
            <span className="text-xs text-zinc-400">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-pretty p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <div className="h-64 bg-zinc-800/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
              <p className="text-zinc-400">Revenue chart would go here</p>
            </div>
          </div>
        </div>

        <div className="card-pretty p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Session Activity</h3>
          <div className="h-64 bg-zinc-800/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
              <p className="text-zinc-400">Session activity chart would go here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Flavors */}
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Flavors</h3>
        <div className="space-y-3">
          {analytics.topFlavors.map((flavor, index) => (
            <div key={flavor.name} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-teal-400">#{index + 1}</span>
                </div>
                <div>
                  <div className="text-white font-medium">{flavor.name}</div>
                  <div className="text-sm text-zinc-400">{flavor.count} sessions</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">${flavor.revenue}</div>
                <div className="text-sm text-zinc-400">revenue</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">${analytics.revenue.total.toLocaleString()}</div>
            <div className="text-sm text-zinc-400">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">${(analytics.revenue.total / analytics.sessions.total).toFixed(2)}</div>
            <div className="text-sm text-zinc-400">Avg per Session</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">${(analytics.revenue.total / 30).toFixed(2)}</div>
            <div className="text-sm text-zinc-400">Daily Average</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-2xl font-bold text-white mb-2">{analytics.sessions.total}</div>
            <div className="text-sm text-zinc-400">Total Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-2">{analytics.avgSessionDuration.minutes} min</div>
            <div className="text-sm text-zinc-400">Average Duration</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">User Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-white mb-2">{analytics.users.total}</div>
            <div className="text-sm text-zinc-400">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400 mb-2">{analytics.users.active}</div>
            <div className="text-sm text-zinc-400">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400 mb-2">{analytics.users.total - analytics.users.active}</div>
            <div className="text-sm text-zinc-400">Inactive Users</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Table Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Table</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Sessions</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Revenue</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Avg Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {analytics.tablePerformance.map((table) => (
                <tr key={table.table} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-white font-medium">{table.table}</td>
                  <td className="px-4 py-3 text-zinc-300">{table.sessions}</td>
                  <td className="px-4 py-3 text-zinc-300">${table.revenue}</td>
                  <td className="px-4 py-3 text-zinc-300">{table.avgDuration} min</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-green-400">Excellent</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'overview': return renderOverview();
      case 'revenue': return renderRevenue();
      case 'sessions': return renderSessions();
      case 'users': return renderUsers();
      case 'performance': return renderPerformance();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Business intelligence and performance metrics
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            <button className="btn-pretty-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="btn-pretty-outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
