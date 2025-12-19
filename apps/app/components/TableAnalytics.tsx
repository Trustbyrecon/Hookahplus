"use client";

import React from 'react';
import { TableMetrics, ZoneMetrics } from '../lib/services/TableAnalyticsService';
import { TrendingUp, DollarSign, Clock, Users, BarChart3, MapPin } from 'lucide-react';
import Card from './Card';

interface TableAnalyticsProps {
  tableMetrics: TableMetrics[];
  zoneMetrics: ZoneMetrics[];
  summary: {
    totalTables: number;
    totalRevenue: number;
    totalSessions: number;
    averageUtilization: number;
    averageSessionValue: number;
  };
  onTableSelect?: (tableId: string) => void;
  className?: string;
}

export function TableAnalytics({
  tableMetrics,
  zoneMetrics,
  summary,
  onTableSelect,
  className = ''
}: TableAnalyticsProps) {
  // Sort tables by revenue (descending)
  const sortedTables = [...tableMetrics].sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border-teal-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${summary.totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-teal-400" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-white">{summary.totalSessions}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Avg Utilization</p>
              <p className="text-2xl font-bold text-white">{summary.averageUtilization.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Avg Session Value</p>
              <p className="text-2xl font-bold text-white">${summary.averageSessionValue.toFixed(0)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Zone Performance */}
      {zoneMetrics.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-400" />
            Zone Performance
          </h3>
          <div className="space-y-3">
            {zoneMetrics.map((zone) => (
              <div
                key={zone.zone}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">{zone.zone} Zone</h4>
                  <span className="text-sm text-zinc-400">{zone.totalTables} tables</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Revenue</p>
                    <p className="text-lg font-bold text-white">${zone.totalRevenue.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Sessions</p>
                    <p className="text-lg font-bold text-white">{zone.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Utilization</p>
                    <p className="text-lg font-bold text-white">{zone.averageUtilization.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Per Table</p>
                    <p className="text-lg font-bold text-white">${zone.revenuePerTable.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Performing Tables */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-400" />
          Top Performing Tables
        </h3>
        <div className="space-y-2">
          {sortedTables.slice(0, 10).map((table) => (
            <div
              key={table.tableId}
              onClick={() => onTableSelect?.(table.tableId)}
              className={`p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-teal-500/50 transition-colors ${
                onTableSelect ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-white">{table.tableName}</h4>
                  <p className="text-xs text-zinc-400">{table.zone} Zone • Capacity: {table.capacity}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-teal-400">${table.totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-zinc-400">{table.totalSessions} sessions</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Utilization</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 transition-all"
                        style={{ width: `${Math.min(100, table.utilizationPercent)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-white w-12 text-right">
                      {table.utilizationPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Avg Duration</p>
                  <p className="text-sm font-semibold text-white">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {table.averageSessionDuration.toFixed(0)}m
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Turnover</p>
                  <p className="text-sm font-semibold text-white">
                    {table.turnoverRate.toFixed(1)}/day
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}




