"use client";

import React from 'react';
import { TrendingUp, TrendingDown, Clock, Calendar, BarChart3 } from 'lucide-react';
import Card from './Card';

interface HistoricalTrendsProps {
  trends: {
    peakHours: Array<{
      hour: number;
      hourLabel: string;
      sessionCount: number;
      revenue: number;
      utilization: number;
    }>;
    dayOfWeek: Array<{
      day: string;
      dayIndex: number;
      averageRevenue: number;
      averageSessions: number;
      averageUtilization: number;
    }>;
    daily: Array<{
      date: string;
      revenue: number;
      sessions: number;
      utilization: number;
      averageSessionValue: number;
    }>;
    weekOverWeek: {
      revenue: { current: number; previous: number; change: number; changePercent: number };
      sessions: { current: number; previous: number; change: number; changePercent: number };
      utilization: { current: number; previous: number; change: number; changePercent: number };
    } | null;
  };
  className?: string;
}

export function HistoricalTrends({ trends, className = '' }: HistoricalTrendsProps) {
  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    const icon = isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="font-semibold">
          {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
        </span>
        <span className="text-zinc-400 text-sm">
          ({isPositive ? '+' : ''}{change.toFixed(0)})
        </span>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Week-over-Week Comparison */}
      {trends.weekOverWeek && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Week-over-Week Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="text-sm text-zinc-400 mb-2">Revenue</div>
              <div className="text-2xl font-bold text-white mb-2">
                ${trends.weekOverWeek.revenue.current.toFixed(0)}
              </div>
              {formatChange(
                trends.weekOverWeek.revenue.change,
                trends.weekOverWeek.revenue.changePercent
              )}
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="text-sm text-zinc-400 mb-2">Sessions</div>
              <div className="text-2xl font-bold text-white mb-2">
                {trends.weekOverWeek.sessions.current}
              </div>
              {formatChange(
                trends.weekOverWeek.sessions.change,
                trends.weekOverWeek.sessions.changePercent
              )}
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="text-sm text-zinc-400 mb-2">Utilization</div>
              <div className="text-2xl font-bold text-white mb-2">
                {trends.weekOverWeek.utilization.current.toFixed(1)}%
              </div>
              {formatChange(
                trends.weekOverWeek.utilization.change,
                trends.weekOverWeek.utilization.changePercent
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Peak Hours */}
      {trends.peakHours.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            Peak Hours Analysis
          </h3>
          <div className="space-y-2">
            {trends.peakHours.map((peak, index) => (
              <div
                key={peak.hour}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{peak.hourLabel}</div>
                      <div className="text-xs text-zinc-400">{peak.sessionCount} sessions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${peak.revenue.toFixed(0)}</div>
                    <div className="text-xs text-zinc-400">{peak.utilization.toFixed(1)}% utilization</div>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all"
                    style={{ width: `${Math.min(100, (peak.sessionCount / trends.peakHours[0].sessionCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Day of Week Trends */}
      {trends.dayOfWeek.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            Day of Week Performance
          </h3>
          <div className="space-y-2">
            {trends.dayOfWeek
              .sort((a, b) => a.dayIndex - b.dayIndex)
              .map((day) => {
                const maxRevenue = Math.max(...trends.dayOfWeek.map(d => d.averageRevenue));
                const maxSessions = Math.max(...trends.dayOfWeek.map(d => d.averageSessions));
                
                return (
                  <div
                    key={day.day}
                    className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-white">{day.day}</div>
                      <div className="text-sm text-zinc-400">
                        {day.averageSessions.toFixed(1)} sessions/day
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <div className="text-xs text-zinc-400 mb-1">Avg Revenue</div>
                        <div className="text-lg font-bold text-white">
                          ${day.averageRevenue.toFixed(0)}
                        </div>
                        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-teal-500 transition-all"
                            style={{ width: `${maxRevenue > 0 ? (day.averageRevenue / maxRevenue) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-400 mb-1">Utilization</div>
                        <div className="text-lg font-bold text-white">
                          {day.averageUtilization.toFixed(1)}%
                        </div>
                        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-purple-500 transition-all"
                            style={{ width: `${Math.min(100, day.averageUtilization)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Daily Trends Chart */}
      {trends.daily.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Daily Trends
          </h3>
          <div className="space-y-3">
            {trends.daily.slice(-14).map((day) => {
              const date = new Date(day.date);
              const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const maxRevenue = Math.max(...trends.daily.map(d => d.revenue));
              const maxSessions = Math.max(...trends.daily.map(d => d.sessions));
              
              return (
                <div
                  key={day.date}
                  className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white">{dateLabel}</div>
                    <div className="text-sm text-zinc-400">
                      ${day.revenue.toFixed(0)} • {day.sessions} sessions
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-zinc-400 mb-1">Revenue</div>
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 transition-all"
                          style={{ width: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400 mb-1">Sessions</div>
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

