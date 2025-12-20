"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  CheckCircle,
  PieChart,
  LineChart,
  Wifi,
  WifiOff
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../components';
import { UnifiedDashboard } from '../../components/UnifiedDashboard';
import { useUnifiedRealtimeUpdates } from '../../lib/hooks/useRealtimeUpdates';

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
  const [analytics, setAnalytics] = useState<any>(null);
  const [unifiedData, setUnifiedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unifiedLoading, setUnifiedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const viewModes = [
    { value: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'unified', label: 'Unified Dashboard', icon: <Target className="w-4 h-4" /> },
    { value: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'sessions', label: 'Sessions', icon: <Flame className="w-4 h-4" /> },
    { value: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { value: 'performance', label: 'Performance', icon: <Activity className="w-4 h-4" /> }
  ];

  // Convert time range to window days
  const getWindowDays = (range: string): number => {
    switch (range) {
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 7;
    }
  };

  // Process analytics data from API response
  const processAnalyticsData = useCallback((sessionsData: any, conversionData: any, retentionData: any) => {
    const windowDays = getWindowDays(timeRange);
    
    return {
      revenue: {
        total: sessionsData.metrics?.revenue || 0,
        change: 0, // TODO: Calculate change from previous period
        daily: sessionsData.metrics?.revenue || 0,
        hourly: (sessionsData.metrics?.revenue || 0) / (windowDays * 24)
      },
      sessions: {
        total: sessionsData.metrics?.totalSessions || 0,
        active: sessionsData.metrics?.activeSessions || 0,
        completed: sessionsData.metrics?.completedSessions || 0,
        cancelled: 0, // TODO: Add cancelled count
        avgDuration: sessionsData.metrics?.avgDurationMinutes || 0
      },
      customers: {
        total: retentionData.metrics?.totalCustomers || 0,
        new: (retentionData.metrics?.totalCustomers || 0) - (retentionData.metrics?.repeatCustomers || 0),
        returning: retentionData.metrics?.repeatCustomers || 0,
        vip: retentionData.vipCustomers?.length || 0,
        avgSpend: retentionData.metrics?.avgCLV || 0
      },
      performance: {
        avgWaitTime: 0, // TODO: Calculate from session data
        tableTurnover: 0, // TODO: Calculate from session data
        staffEfficiency: 0, // TODO: Calculate from session data
        customerSatisfaction: 0 // TODO: Calculate from feedback data
      },
      conversion: conversionData,
      retention: retentionData
    };
  }, [timeRange]);

  // Fetch analytics data manually (for initial load and manual refresh)
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const windowDays = getWindowDays(timeRange);
      
      const [sessionsRes, conversionRes, retentionRes] = await Promise.all([
        fetch(`/api/analytics/sessions?windowDays=${windowDays}`),
        fetch(`/api/analytics/conversion?windowDays=${windowDays}`),
        fetch(`/api/analytics/retention?windowDays=${windowDays}`)
      ]);

      if (!sessionsRes.ok || !conversionRes.ok || !retentionRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [sessionsData, conversionData, retentionData] = await Promise.all([
        sessionsRes.json(),
        conversionRes.json(),
        retentionRes.json()
      ]);

      if (!sessionsData.success || !conversionData.success || !retentionData.success) {
        throw new Error('Analytics API returned error');
      }

      const processedData = processAnalyticsData(sessionsData, conversionData, retentionData);
      setAnalytics(processedData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [timeRange, processAnalyticsData]);

  // Real-time updates for analytics (WebSocket with polling fallback)
  const { 
    isConnected: analyticsConnected, 
    usePolling: analyticsUsePolling,
    refresh: refreshAnalytics 
  } = useUnifiedRealtimeUpdates({
    endpoint: `/api/analytics/sessions?windowDays=${getWindowDays(timeRange)}`,
    channel: `analytics-${timeRange}`,
    interval: 30000, // 30 seconds polling fallback
    enabled: true,
    preferWebSocket: true,
    onUpdate: async (data) => {
      // When real-time update arrives, fetch all analytics data
      try {
        const windowDays = getWindowDays(timeRange);
        const [sessionsRes, conversionRes, retentionRes] = await Promise.all([
          fetch(`/api/analytics/sessions?windowDays=${windowDays}`),
          fetch(`/api/analytics/conversion?windowDays=${windowDays}`),
          fetch(`/api/analytics/retention?windowDays=${windowDays}`)
        ]);

        if (sessionsRes.ok && conversionRes.ok && retentionRes.ok) {
          const [sessionsData, conversionData, retentionData] = await Promise.all([
            sessionsRes.json(),
            conversionRes.json(),
            retentionRes.json()
          ]);

          if (sessionsData.success && conversionData.success && retentionData.success) {
            const processedData = processAnalyticsData(sessionsData, conversionData, retentionData);
            setAnalytics(processedData);
          }
        }
      } catch (err) {
        console.error('Error updating analytics from real-time:', err);
      }
    },
    onError: (error) => {
      console.warn('[Analytics] Real-time update error:', error);
    },
  });

  // Fetch unified analytics data
  const fetchUnifiedAnalytics = useCallback(async () => {
    if (viewMode !== 'unified') return;
    
    try {
      setUnifiedLoading(true);
      const response = await fetch('/api/analytics/unified');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnifiedData(data.data);
        } else {
          setUnifiedData(null);
        }
      } else {
        setUnifiedData(null);
      }
    } catch (err) {
      console.error('Error fetching unified analytics:', err);
      setUnifiedData(null);
    } finally {
      setUnifiedLoading(false);
    }
  }, [viewMode]);

  // Real-time updates for unified analytics
  const { 
    isConnected: unifiedConnected, 
    usePolling: unifiedUsePolling 
  } = useUnifiedRealtimeUpdates({
    endpoint: '/api/analytics/unified',
    channel: 'unified-analytics',
    interval: 30000, // 30 seconds polling fallback
    enabled: viewMode === 'unified',
    preferWebSocket: true,
    onUpdate: (data) => {
      if (data && data.success) {
        setUnifiedData(data.data);
      }
    },
    onError: (error) => {
      console.warn('[Unified Analytics] Real-time update error:', error);
    },
  });

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, fetchAnalytics]);

  // Fetch unified data when switching to unified view
  useEffect(() => {
    if (viewMode === 'unified' && !unifiedData) {
      fetchUnifiedAnalytics();
    }
  }, [viewMode, unifiedData, fetchUnifiedAnalytics]);

  const keyMetrics: MetricData[] = analytics ? [
    {
      label: 'Total Revenue',
      value: analytics.revenue.total,
      change: analytics.revenue.change,
      changeType: analytics.revenue.change >= 0 ? 'increase' : 'decrease',
      format: 'currency',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      label: 'Active Sessions',
      value: analytics.sessions.active,
      change: 0, // TODO: Calculate change
      changeType: 'neutral',
      format: 'number',
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-400'
    },
    {
      label: 'Total Customers',
      value: analytics.customers.total,
      change: 0, // TODO: Calculate change
      changeType: 'neutral',
      format: 'number',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      label: 'Avg. Session Duration',
      value: analytics.sessions.avgDuration,
      change: 0, // TODO: Calculate change
      changeType: 'neutral',
      format: 'time',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-400'
    }
  ] : [];

  const hasAnalyticsData = !!analytics && (
    (analytics.sessions?.total ?? 0) > 0 ||
    (analytics.revenue?.total ?? 0) > 0 ||
    (analytics.customers?.total ?? 0) > 0
  );

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
      case 'unified': 
        if (unifiedLoading) {
          return (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading unified analytics...</p>
            </Card>
          );
        }
        if (unifiedData) {
          return <UnifiedDashboard data={unifiedData} />;
        }
        return (
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No unified analytics data available</p>
          </Card>
        );
      case 'revenue': return renderRevenue();
      case 'sessions': return renderSessions();
      case 'customers': return renderCustomers();
      case 'performance': return renderPerformance();
      default: return renderOverview();
    }
  };

  const renderCustomers = () => {
    if (!analytics || !analytics.retention) {
      return (
        <div className="text-center py-12 text-zinc-400">
          <Users className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Customer Analytics</h3>
          <p>Loading customer data...</p>
        </div>
      );
    }

    const retention = analytics.retention;
    const totalCustomers = retention.metrics?.totalCustomers || 0;
    const repeatCustomers = retention.metrics?.repeatCustomers || 0;
    const newCustomers = totalCustomers - repeatCustomers;
    const returnRate = totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : '0';
    const avgCLV = retention.metrics?.avgCLV || 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Customers</p>
                <p className="text-2xl font-bold text-white">{totalCustomers.toLocaleString()}</p>
                <p className="text-xs text-zinc-400 mt-1">In selected period</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">New Customers</p>
                <p className="text-2xl font-bold text-white">{newCustomers.toLocaleString()}</p>
                <p className="text-xs text-zinc-400 mt-1">First-time visitors</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Return Rate</p>
                <p className="text-2xl font-bold text-white">{returnRate}%</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {repeatCustomers} of {totalCustomers} customers
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Avg Lifetime Value</p>
                <p className="text-2xl font-bold text-white">${avgCLV.toFixed(2)}</p>
                <p className="text-xs text-zinc-400 mt-1">Per customer</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">VIP Customers (Top 10%)</h3>
            <div className="space-y-4">
              {retention.vipCustomers && retention.vipCustomers.length > 0 ? (
                retention.vipCustomers.slice(0, 5).map((vip: any, index: number) => {
                  const initials = vip.customerId?.substring(0, 2).toUpperCase() || 'CU';
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                          <span className="text-teal-400 font-semibold text-sm">{initials}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{vip.customerId || 'Customer'}</p>
                          <p className="text-xs text-zinc-400">{vip.sessionCount || 0} sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">${vip.revenue?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-zinc-400">Lifetime value</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <Users className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                  <p>No VIP customers yet</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Customer Segments</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Repeat Customers</span>
                  <span className="text-white">{repeatCustomers}</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-zinc-400">
                  {totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">New Customers</span>
                  <span className="text-white">{newCustomers}</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-zinc-400">
                  {totalCustomers > 0 ? ((newCustomers / totalCustomers) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderPerformance = () => {
    // Calculate peak hours from session data
    const calculatePeakHours = () => {
      if (!analytics || !analytics.sessions) return 'N/A';
      
      // This would require session timestamps - for now show placeholder
      // In real implementation, group sessions by hour of creation
      return 'Calculate from sessions';
    };

    // Calculate avg service time from completed sessions
    const avgServiceTime = analytics?.sessions?.avgDuration || 0;
    
    // Staff efficiency - placeholder (would need staff assignment data)
    const staffEfficiency = 0; // TODO: Calculate from staff assignments

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Peak Hours</p>
                <p className="text-2xl font-bold text-white">
                  {calculatePeakHours()}
                </p>
                <p className="text-xs text-zinc-400 mt-1">Based on session creation times</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Avg Service Time</p>
                <p className="text-2xl font-bold text-white">
                  {avgServiceTime > 0 ? `${Math.round(avgServiceTime)} min` : 'N/A'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">From completed sessions</p>
              </div>
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-white">Coming Soon</p>
                <p className="text-xs text-zinc-400 mt-1">Feedback data not yet available</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Staff Efficiency</p>
                <p className="text-2xl font-bold text-white">
                  {staffEfficiency > 0 ? `${staffEfficiency}%` : 'N/A'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">Calculate from staff assignments</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Busiest Hours</h3>
            <div className="text-center py-8 text-zinc-400">
              <Clock className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
              <p>Hourly breakdown coming soon</p>
              <p className="text-xs mt-2">Will calculate from session creation timestamps</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
            <div className="space-y-4">
              {analytics?.sessions && (
                <>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-400 font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Session Completion Rate
                      </span>
                      <span className="text-white font-bold">
                        {analytics.sessions.total > 0 
                          ? `${((analytics.sessions.completed / analytics.sessions.total) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      {analytics.sessions.completed} of {analytics.sessions.total} sessions completed
                    </p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Avg Session Duration
                      </span>
                      <span className="text-white font-bold">
                        {avgServiceTime > 0 ? `${Math.round(avgServiceTime)}m` : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">Average session length</p>
                  </div>
                </>
              )}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Wait Time
                  </span>
                  <span className="text-white font-bold">Coming Soon</span>
                </div>
                <p className="text-sm text-zinc-400">Calculate from prep start to delivery</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
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
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg border border-zinc-700">
              {viewMode === 'unified' ? (
                unifiedConnected ? (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <Wifi className="w-4 h-4" />
                    <span>Live</span>
                  </div>
                ) : unifiedUsePolling ? (
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Polling</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-zinc-400 text-sm">
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </div>
                )
              ) : (
                analyticsConnected ? (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <Wifi className="w-4 h-4" />
                    <span>Live</span>
                  </div>
                ) : analyticsUsePolling ? (
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Polling</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-zinc-400 text-sm">
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </div>
                )
              )}
            </div>

            <Button 
              variant="outline" 
              onClick={() => {
                if (viewMode === 'unified') {
                  fetchUnifiedAnalytics();
                } else {
                  setLoading(true);
                  const windowDays = getWindowDays(timeRange);
                  Promise.all([
                    fetch(`/api/analytics/sessions?windowDays=${windowDays}`).then(r => r.json()),
                    fetch(`/api/analytics/conversion?windowDays=${windowDays}`).then(r => r.json()),
                    fetch(`/api/analytics/retention?windowDays=${windowDays}`).then(r => r.json())
                  ]).then(([sessionsData, conversionData, retentionData]) => {
                    const processedData = processAnalyticsData(sessionsData, conversionData, retentionData);
                    setAnalytics(processedData);
                    setLoading(false);
                  }).catch(err => {
                    setError(err.message);
                    setLoading(false);
                  });
                }
              }}
              disabled={loading || unifiedLoading}
            >
              <RefreshCw className={`w-4 h-4 ${(loading || unifiedLoading) ? 'animate-spin' : ''}`} />
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading analytics data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-6 mb-6 border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-lg font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Empty-state helper */}
        {!loading && !error && analytics && !hasAnalyticsData && (
          <Card className="p-6 mb-6">
            <p className="text-zinc-300">
              No analytics yet for this window. Run a few paid sessions and click Refresh.
            </p>
          </Card>
        )}

        {/* Content */}
        {!loading && !error && analytics && hasAnalyticsData && renderContent()}

        {/* Conversion Funnel Section (in Overview) */}
        {!loading && !error && analytics && hasAnalyticsData && analytics.conversion && viewMode === 'overview' && (
          <div className="mt-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">QR Scans</p>
                    <p className="text-sm text-zinc-400">{analytics.conversion.funnel?.qrScans || 0} scans</p>
                  </div>
                  <div className="text-right">
                    <p className="text-teal-400 font-semibold">100%</p>
                    <p className="text-xs text-zinc-500">Entry point</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Sessions Created</p>
                    <p className="text-sm text-zinc-400">{analytics.conversion.funnel?.sessionsCreated || 0} sessions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-semibold">
                      {analytics.conversion.conversionRates?.scanToCreate?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-zinc-500">Conversion rate</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Payments Completed</p>
                    <p className="text-sm text-zinc-400">{analytics.conversion.funnel?.paymentsCompleted || 0} payments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">
                      {analytics.conversion.conversionRates?.createToPayment?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-zinc-500">Conversion rate</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Sessions Completed</p>
                    <p className="text-sm text-zinc-400">{analytics.conversion.funnel?.sessionsCompleted || 0} completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-semibold">
                      {analytics.conversion.conversionRates?.overall?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-zinc-500">Overall conversion</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Retention Metrics Section (in Customers view) */}
        {!loading && !error && analytics && analytics.retention && viewMode === 'customers' && (
          <div className="mt-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Retention Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-sm text-zinc-400 mb-2">Repeat Customer Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {analytics.retention.metrics?.repeatCustomerRate?.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {analytics.retention.metrics?.repeatCustomers || 0} of {analytics.retention.metrics?.totalCustomers || 0} customers
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-sm text-zinc-400 mb-2">Avg. Customer Lifetime Value</p>
                  <p className="text-2xl font-bold text-teal-400">
                    ${analytics.retention.metrics?.avgCLV?.toFixed(2) || 0}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Per customer</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-sm text-zinc-400 mb-2">30-Day Retention Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {analytics.retention.metrics?.retentionRate30Days?.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Customers returning</p>
                </div>
              </div>
              {analytics.retention.vipCustomers && analytics.retention.vipCustomers.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-white mb-3">VIP Customers (Top 10%)</h4>
                  <div className="space-y-2">
                    {analytics.retention.vipCustomers.slice(0, 5).map((vip: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{vip.customerId}</p>
                          <p className="text-sm text-zinc-400">{vip.sessionCount} sessions</p>
                        </div>
                        <div className="text-right">
                          <p className="text-teal-400 font-semibold">${vip.revenue.toFixed(2)}</p>
                          <p className="text-xs text-zinc-500">Lifetime value</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
