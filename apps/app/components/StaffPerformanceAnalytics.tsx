"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Clock, 
  Users, 
  Target, 
  Award,
  BarChart3,
  Calendar,
  Activity,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  unit: string;
}

interface StaffPerformance {
  id: string;
  name: string;
  role: string;
  metrics: {
    sessionsCompleted: number;
    averageRating: number;
    onTimeDelivery: number;
    customerSatisfaction: number;
    efficiency: number;
    attendance: number;
  };
  trends: {
    sessionsCompleted: number;
    averageRating: number;
    onTimeDelivery: number;
  };
  achievements: string[];
  lastActive: string;
}

interface StaffPerformanceAnalyticsProps {
  staffMembers: StaffPerformance[];
  timeRange: 'today' | 'week' | 'month' | 'quarter';
  onTimeRangeChange: (range: 'today' | 'week' | 'month' | 'quarter') => void;
}

export default function StaffPerformanceAnalytics({ 
  staffMembers, 
  timeRange, 
  onTimeRangeChange 
}: StaffPerformanceAnalyticsProps) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'individual' | 'comparison'>('overview');

  // Calculate aggregate metrics
  const aggregateMetrics: PerformanceMetric[] = [
    {
      id: 'total-sessions',
      name: 'Total Sessions',
      value: staffMembers.reduce((sum, staff) => sum + staff.metrics.sessionsCompleted, 0),
      change: 12.5,
      trend: 'up',
      unit: 'sessions'
    },
    {
      id: 'avg-rating',
      name: 'Average Rating',
      value: staffMembers.reduce((sum, staff) => sum + staff.metrics.averageRating, 0) / staffMembers.length,
      change: 0.3,
      trend: 'up',
      target: 4.5,
      unit: '/5.0'
    },
    {
      id: 'on-time-delivery',
      name: 'On-Time Delivery',
      value: staffMembers.reduce((sum, staff) => sum + staff.metrics.onTimeDelivery, 0) / staffMembers.length,
      change: 2.1,
      trend: 'up',
      target: 95,
      unit: '%'
    },
    {
      id: 'customer-satisfaction',
      name: 'Customer Satisfaction',
      value: staffMembers.reduce((sum, staff) => sum + staff.metrics.customerSatisfaction, 0) / staffMembers.length,
      change: 1.8,
      trend: 'up',
      target: 90,
      unit: '%'
    },
    {
      id: 'efficiency',
      name: 'Efficiency Score',
      value: staffMembers.reduce((sum, staff) => sum + staff.metrics.efficiency, 0) / staffMembers.length,
      change: 5.2,
      trend: 'up',
      target: 85,
      unit: '%'
    },
    {
      id: 'attendance',
      name: 'Attendance Rate',
      value: staffMembers.reduce((sum, staff) => sum + staff.metrics.attendance, 0) / staffMembers.length,
      change: -0.5,
      trend: 'down',
      target: 95,
      unit: '%'
    }
  ];

  const topPerformers = staffMembers
    .sort((a, b) => b.metrics.averageRating - a.metrics.averageRating)
    .slice(0, 3);

  const needsImprovement = staffMembers
    .filter(staff => staff.metrics.averageRating < 4.0 || staff.metrics.attendance < 90)
    .sort((a, b) => a.metrics.averageRating - b.metrics.averageRating);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-blue-400';
    }
  };

  const getPerformanceColor = (value: number, target?: number) => {
    if (!target) return 'text-white';
    if (value >= target) return 'text-green-400';
    if (value >= target * 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
          <p className="text-zinc-400">Track staff performance and identify improvement opportunities</p>
        </div>
        
        <div className="flex space-x-3">
          {/* Time Range Selector */}
          <div className="flex bg-zinc-800 rounded-lg p-1">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'quarter', label: 'Quarter' }
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => onTimeRangeChange(range.id as any)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  timeRange === range.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* View Mode Selector */}
          <div className="flex bg-zinc-800 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'individual', label: 'Individual', icon: Users },
              { id: 'comparison', label: 'Compare', icon: Target }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === mode.id
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aggregateMetrics.map((metric) => (
              <div key={metric.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-zinc-300">{metric.name}</h3>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className={`text-2xl font-bold ${getPerformanceColor(metric.value, metric.target)}`}>
                    {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
                  </span>
                  <span className="text-zinc-400">{metric.unit}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${getTrendColor(metric.trend)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                  <span className="text-xs text-zinc-500">vs last period</span>
                </div>
                {metric.target && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Target: {metric.target}{metric.unit}</span>
                      <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          metric.value >= metric.target ? 'bg-green-500' : 
                          metric.value >= metric.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Top Performers & Needs Improvement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Top Performers</h3>
              </div>
              <div className="space-y-3">
                {topPerformers.map((staff, index) => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-400">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{staff.name}</div>
                        <div className="text-sm text-zinc-400">{staff.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-semibold">{staff.metrics.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Improvement */}
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Needs Improvement</h3>
              </div>
              <div className="space-y-3">
                {needsImprovement.length > 0 ? (
                  needsImprovement.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{staff.name}</div>
                          <div className="text-sm text-zinc-400">{staff.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-semibold">{staff.metrics.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-zinc-400">All staff meeting performance standards!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Mode */}
      {viewMode === 'individual' && (
        <div className="space-y-6">
          {/* Staff Selector */}
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">Select Staff Member</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {staffMembers.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => setSelectedStaff(staff.id)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedStaff === staff.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <div className="font-medium">{staff.name}</div>
                  <div className="text-sm opacity-75">{staff.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Individual Performance Details */}
          {selectedStaff && (
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              {(() => {
                const staff = staffMembers.find(s => s.id === selectedStaff);
                if (!staff) return null;
                
                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">{staff.name} - Performance Details</h3>
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-2xl font-bold text-white">{staff.metrics.averageRating.toFixed(1)}</span>
                        <span className="text-zinc-400">/5.0</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(staff.metrics).map(([key, value]) => (
                        <div key={key} className="bg-zinc-700/50 rounded-lg p-4">
                          <div className="text-sm text-zinc-400 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-2xl font-bold text-white mb-1">
                            {typeof value === 'number' ? value.toFixed(1) : value}
                            {key.includes('Rating') ? '/5.0' : key.includes('Delivery') || key.includes('Satisfaction') || key.includes('Efficiency') || key.includes('Attendance') ? '%' : ''}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {staff.trends[key as keyof typeof staff.trends] > 0 ? '+' : ''}
                            {staff.trends[key as keyof typeof staff.trends]}% vs last period
                          </div>
                        </div>
                      ))}
                    </div>

                    {staff.achievements.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Recent Achievements</h4>
                        <div className="flex flex-wrap gap-2">
                          {staff.achievements.map((achievement, index) => (
                            <div key={index} className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                              {achievement}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Comparison Mode */}
      {viewMode === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">Staff Performance Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 px-4 text-zinc-300">Staff</th>
                    <th className="text-center py-3 px-4 text-zinc-300">Sessions</th>
                    <th className="text-center py-3 px-4 text-zinc-300">Rating</th>
                    <th className="text-center py-3 px-4 text-zinc-300">On-Time</th>
                    <th className="text-center py-3 px-4 text-zinc-300">Satisfaction</th>
                    <th className="text-center py-3 px-4 text-zinc-300">Efficiency</th>
                    <th className="text-center py-3 px-4 text-zinc-300">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((staff) => (
                    <tr key={staff.id} className="border-b border-zinc-700/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{staff.name}</div>
                          <div className="text-sm text-zinc-400">{staff.role}</div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 text-white">{staff.metrics.sessionsCompleted}</td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white">{staff.metrics.averageRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 text-white">{staff.metrics.onTimeDelivery.toFixed(1)}%</td>
                      <td className="text-center py-3 px-4 text-white">{staff.metrics.customerSatisfaction.toFixed(1)}%</td>
                      <td className="text-center py-3 px-4 text-white">{staff.metrics.efficiency.toFixed(1)}%</td>
                      <td className="text-center py-3 px-4 text-white">{staff.metrics.attendance.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
