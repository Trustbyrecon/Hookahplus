"use client";

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MapPin, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Target,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import Card from './Card';
import { UnifiedDashboardData, CrossSystemInsight, PredictiveForecast } from '../lib/services/UnifiedAnalyticsService';

interface UnifiedDashboardProps {
  data: UnifiedDashboardData;
  className?: string;
}

export function UnifiedDashboard({ data, className = '' }: UnifiedDashboardProps) {
  const formatCurrency = (value: number) => `$${value.toFixed(0)}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-zinc-400" />;
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-teal-400" />
            </div>
            {getTrendIcon(data.metrics.revenue.trend)}
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(data.metrics.revenue.thisWeek)}
          </div>
          <div className="text-sm text-zinc-400">This Week</div>
          <div className="text-xs text-zinc-500 mt-1">
            {formatPercent(data.metrics.revenue.trend)} vs last week
          </div>
        </Card>

        {/* Sessions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            {getTrendIcon(data.metrics.sessions.trend)}
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {data.metrics.sessions.total}
          </div>
          <div className="text-sm text-zinc-400">{data.metrics.sessions.active} active</div>
          <div className="text-xs text-zinc-500 mt-1">
            {formatPercent(data.metrics.sessions.trend)} vs last week
          </div>
        </Card>

        {/* Tables */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            {getTrendIcon(data.metrics.tables.trend)}
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {data.metrics.tables.utilization.toFixed(0)}%
          </div>
          <div className="text-sm text-zinc-400">
            {data.metrics.tables.occupied}/{data.metrics.tables.total} occupied
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {formatPercent(data.metrics.tables.trend)} vs last week
          </div>
        </Card>

        {/* Staff */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Star className="w-5 h-5 text-orange-400" />
            </div>
            {getTrendIcon(data.metrics.staff.trend)}
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {data.metrics.staff.efficiency.toFixed(1)}
          </div>
          <div className="text-sm text-zinc-400">Sessions/staff hour</div>
          <div className="text-xs text-zinc-500 mt-1">
            {data.metrics.staff.active}/{data.metrics.staff.total} active
          </div>
        </Card>
      </div>

      {/* Cross-System Insights */}
      {data.insights.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Cross-System Insights
          </h3>
          <div className="space-y-3">
            {data.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{insight.title}</div>
                    <div className="text-sm text-zinc-300 mb-2">{insight.description}</div>
                    {insight.recommendation && (
                      <div className="text-xs text-zinc-400 italic mt-2">
                        💡 {insight.recommendation}
                      </div>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                    {insight.priority.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Predictive Forecasts */}
      {data.forecasts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Predictive Forecasts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.forecasts.map((forecast, index) => (
              <div
                key={index}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-white capitalize">
                    {forecast.metric} ({forecast.timeframe.replace('_', ' ')})
                  </div>
                  <div className={`text-xs font-semibold ${getConfidenceColor(forecast.confidence)}`}>
                    {forecast.confidence}% confidence
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {forecast.metric === 'revenue' ? formatCurrency(forecast.predicted) :
                   forecast.metric === 'utilization' ? `${forecast.predicted}%` :
                   forecast.predicted}
                </div>
                {forecast.recommendation && (
                  <div className="text-xs text-teal-400 mt-2">
                    💡 {forecast.recommendation}
                  </div>
                )}
                <div className="text-xs text-zinc-400 mt-2">
                  Factors: {forecast.factors.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Tables & Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tables */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Top Performing Tables
          </h3>
          <div className="space-y-2">
            {data.topTables.slice(0, 5).map((table, index) => (
              <div
                key={table.tableId}
                className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{table.tableName}</div>
                      <div className="text-xs text-zinc-400">{table.sessions} sessions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{formatCurrency(table.revenue)}</div>
                    <div className="text-xs text-zinc-400">{table.utilization}% utilization</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Staff */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Top Performing Staff
          </h3>
          <div className="space-y-2">
            {data.topStaff.slice(0, 5).map((staff, index) => (
              <div
                key={staff.staffId}
                className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{staff.staffName}</div>
                      <div className="text-xs text-zinc-400">{staff.sessions} sessions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{staff.efficiency.toFixed(1)}</div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {staff.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Zone Performance */}
      {data.zonePerformance.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-400" />
            Zone Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.zonePerformance.map((zone) => (
              <div
                key={zone.zone}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="font-semibold text-white mb-3">{zone.zone}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Revenue</span>
                    <span className="text-white font-medium">{formatCurrency(zone.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Utilization</span>
                    <span className="text-white font-medium">{zone.utilization.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Staff</span>
                    <span className="text-white font-medium">{zone.staffCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Peak Hours */}
      {data.peakHours.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Peak Hours
          </h3>
          <div className="space-y-2">
            {data.peakHours.map((peak, index) => (
              <div
                key={peak.hour}
                className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="font-medium text-white">{peak.hour}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white font-medium">{peak.sessions} sessions</div>
                    <div className="text-xs text-zinc-400">{formatCurrency(peak.revenue)}</div>
                  </div>
                </div>
                <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(100, peak.utilization)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

