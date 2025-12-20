"use client";

import React from 'react';
import { MapPin, Users, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import Card from './Card';
import { ZoneMetrics, ZoneWorkload } from '../lib/services/ZoneRoutingService';

interface ZoneAnalyticsProps {
  workloads: ZoneWorkload[];
  metrics: ZoneMetrics[];
  className?: string;
}

export function ZoneAnalytics({ workloads, metrics, className = '' }: ZoneAnalyticsProps) {
  const getZoneColor = (zone: string) => {
    const zoneLower = zone.toLowerCase();
    if (zoneLower.includes('vip') || zoneLower.includes('private')) {
      return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
    }
    if (zoneLower.includes('outdoor') || zoneLower.includes('patio')) {
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
    if (zoneLower.includes('bar')) {
      return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
    return 'text-teal-400 bg-teal-500/20 border-teal-500/30';
  };

  const getWorkloadStatus = (workload: ZoneWorkload) => {
    if (workload.needsMoreStaff) {
      return { status: 'overloaded', color: 'text-red-400', icon: AlertCircle };
    }
    if (workload.averageLoadPerStaff > 0.7) {
      return { status: 'busy', color: 'text-yellow-400', icon: Clock };
    }
    return { status: 'normal', color: 'text-green-400', icon: CheckCircle };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Zone Workload Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-400" />
          Zone Workload Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workloads.map((workload) => {
            const status = getWorkloadStatus(workload);
            const StatusIcon = status.icon;
            const utilization = workload.totalTables > 0 
              ? (workload.activeSessions / workload.totalTables) * 100 
              : 0;

            return (
              <div
                key={workload.zone}
                className={`p-4 rounded-lg border ${getZoneColor(workload.zone)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-white">{workload.zone}</div>
                  <StatusIcon className={`w-5 h-5 ${status.color}`} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Tables</span>
                    <span className="text-white font-medium">{workload.totalTables}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Active Sessions</span>
                    <span className="text-white font-medium">{workload.activeSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Available Staff</span>
                    <span className="text-white font-medium">{workload.availableStaff}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Utilization</span>
                    <span className="text-white font-medium">{utilization.toFixed(0)}%</span>
                  </div>
                  {workload.averageLoadPerStaff > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Avg Load/Staff</span>
                      <span className="text-white font-medium">{workload.averageLoadPerStaff.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {workload.needsMoreStaff && (
                  <div className="mt-3 pt-3 border-t border-zinc-700">
                    <div className="flex items-center gap-2 text-yellow-400 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>Needs additional staff</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Zone Performance Metrics */}
      {metrics.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Zone Performance Metrics
          </h3>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div
                key={metric.zone}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getZoneColor(metric.zone)}`}>
                    {metric.zone}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {metric.activeSessions} active / {metric.totalSessions} total sessions
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-zinc-400 mb-1">Total Revenue</div>
                    <div className="text-lg font-bold text-white flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-teal-400" />
                      ${metric.totalRevenue.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 mb-1">Avg Session Value</div>
                    <div className="text-lg font-bold text-white">
                      ${metric.averageSessionValue.toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 mb-1">Staff Efficiency</div>
                    <div className="text-lg font-bold text-white flex items-center gap-1">
                      <Users className="w-4 h-4 text-teal-400" />
                      {metric.staffEfficiency.toFixed(1)}/hr
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 mb-1">Satisfaction</div>
                    <div className="text-lg font-bold text-white">
                      {metric.customerSatisfaction}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Add missing import
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

