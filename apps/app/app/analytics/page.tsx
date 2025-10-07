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
  CheckCircle,
  PieChart,
  LineChart
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../components';

interface MetricData {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'currency' | 'number' | 'percentage' | 'time';
  icon: React.ReactNode;
  color: string;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [viewMode, setViewMode] = useState('overview');
  const [showDetails, setShowDetails] = useState(false);

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const viewModes = [
    { value: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'sessions', label: 'Sessions', icon: <Flame className="w-4 h-4" /> },
    { value: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { value: 'performance', label: 'Performance', icon: <Activity className="w-4 h-4" /> }
  ];

  // Mock analytics data
  const analytics = {
    revenue: {
      total: 45680,
      change: 12.5,
      daily: 6526,
      hourly: 272
    },
    sessions: {
      total: 234,
      active: 12,
      completed: 198,
      cancelled: 24,
      avgDuration: 85
    },
    customers: {
      total: 1890,
      new: 45,
      returning: 1445,
      vip: 23,
      avgSpend: 24.15
    },
    performance: {
      avgWaitTime: 18,
      tableTurnover: 2.3,
      staffEfficiency: 87,
      customerSatisfaction: 4.6
    }
  };

  const keyMetrics: MetricData[] = [
    {
      label: 'Total Revenue',
      value: analytics.revenue.total,
      change: analytics.revenue.change,
      changeType: 'increase',
      format: 'currency',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      label: 'Active Sessions',
      value: analytics.sessions.active,
      change: -2.1,
      changeType: 'decrease',
      format: 'number',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-400'
    },
    {
      label: 'Total Customers',
      value: analytics.customers.total,
      change: 8.3,
      changeType: 'increase',
      format: 'number',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      label: 'Avg. Session Duration',
      value: analytics.sessions.avgDuration,
      change: 5.2,
      changeType: 'increase',
      format: 'time',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-400'
    }
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      case 'time':
        return `${value}m`;
      default:
        return value.toLocaleString();
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'decrease':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-400';
      case 'decrease':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${metric.color.replace('text-', 'bg-').replace('-400', '-500/20')}`}>
                {metric.icon}
              </div>
              <div className="flex items-center space-x-1">
                {getChangeIcon(metric.changeType)}
                <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-white">
                {formatValue(metric.value, metric.format)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center bg-zinc-800/50 rounded-lg">
            <div className="text-center text-zinc-400">
              <LineChart className="w-12 h-12 mx-auto mb-2" />
              <p>Revenue chart visualization</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Session Distribution</h3>
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center bg-zinc-800/50 rounded-lg">
            <div className="text-center text-zinc-400">
              <PieChart className="w-12 h-12 mx-auto mb-2" />
              <p>Session distribution chart</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Session completed', table: 'T-12', time: '2m ago', type: 'success' },
            { action: 'New customer added', table: 'T-08', time: '5m ago', type: 'info' },
            { action: 'Payment processed', table: 'T-15', time: '8m ago', type: 'success' },
            { action: 'Session cancelled', table: 'T-03', time: '12m ago', type: 'warning' },
            { action: 'VIP customer arrived', table: 'T-20', time: '15m ago', type: 'vip' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' :
                  activity.type === 'vip' ? 'bg-purple-400' :
                  'bg-blue-400'
                }`} />
                <div>
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-sm text-zinc-400">Table {activity.table}</p>
                </div>
              </div>
              <span className="text-sm text-zinc-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Today's Revenue</p>
              <p className="text-2xl font-bold text-white">${analytics.revenue.daily.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Hourly Average</p>
              <p className="text-2xl font-bold text-white">${analytics.revenue.hourly}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Growth Rate</p>
              <p className="text-2xl font-bold text-white text-green-400">+{analytics.revenue.change}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
        <div className="space-y-4">
          {[
            { category: 'Hookah Sessions', amount: 32450, percentage: 71 },
            { category: 'Food & Drinks', amount: 8920, percentage: 19.5 },
            { category: 'VIP Services', amount: 4310, percentage: 9.5 }
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{item.category}</span>
                <span className="text-white">${item.amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="text-sm text-zinc-400">{item.percentage}% of total revenue</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Sessions</p>
              <p className="text-2xl font-bold text-white">{analytics.sessions.total}</p>
            </div>
            <Flame className="w-8 h-8 text-orange-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active Now</p>
              <p className="text-2xl font-bold text-white">{analytics.sessions.active}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Completed</p>
              <p className="text-2xl font-bold text-white">{analytics.sessions.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Avg. Duration</p>
              <p className="text-2xl font-bold text-white">{analytics.sessions.avgDuration}m</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session Performance</h3>
        <div className="space-y-4">
          {[
            { table: 'T-01', duration: 95, revenue: 45, status: 'completed' },
            { table: 'T-02', duration: 78, revenue: 38, status: 'active' },
            { table: 'T-03', duration: 0, revenue: 0, status: 'cancelled' },
            { table: 'T-04', duration: 120, revenue: 65, status: 'completed' },
            { table: 'T-05', duration: 85, revenue: 42, status: 'completed' }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">{session.table}</span>
                </div>
                <div>
                  <p className="text-white font-medium">Table {session.table}</p>
                  <p className="text-sm text-zinc-400">
                    {session.duration}m • ${session.revenue}
                  </p>
                </div>
              </div>
              <Badge className={
                session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                session.status === 'active' ? 'bg-orange-500/20 text-orange-400' :
                'bg-red-500/20 text-red-400'
              }>
                {session.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'overview': return renderOverview();
      case 'revenue': return renderRevenue();
      case 'sessions': return renderSessions();
      case 'customers': return <div className="text-center py-12 text-zinc-400">Customer Analytics Coming Soon</div>;
      case 'performance': return <div className="text-center py-12 text-zinc-400">Performance Analytics Coming Soon</div>;
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
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {viewModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setViewMode(mode.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === mode.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
