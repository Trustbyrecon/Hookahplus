"use client";

import React from 'react';
import { X, BarChart3, TrendingUp, Users, Clock, DollarSign, Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: string;
  reportTitle: string;
}

export default function AdminReportModal({ isOpen, onClose, reportType, reportTitle }: AdminReportModalProps) {
  if (!isOpen) return null;

  // Generate demo report data based on report type
  const generateReportData = (type: string) => {
    switch (type) {
      case 'users':
        return {
          metrics: [
            { label: 'Total Users', value: '24', change: '+12%', trend: 'up' },
            { label: 'Active Users', value: '18', change: '+5%', trend: 'up' },
            { label: 'New This Month', value: '6', change: '+50%', trend: 'up' },
            { label: 'Inactive Users', value: '2', change: '-33%', trend: 'down' },
          ],
          breakdown: [
            { role: 'FOH', count: 8, percentage: 33 },
            { role: 'BOH', count: 6, percentage: 25 },
            { role: 'Manager', count: 4, percentage: 17 },
            { role: 'Admin', count: 6, percentage: 25 },
          ],
          recentActivity: [
            { action: 'User created', user: 'John Doe', role: 'FOH', timestamp: '2 hours ago' },
            { action: 'Role updated', user: 'Jane Smith', role: 'Manager', timestamp: '5 hours ago' },
            { action: 'Permission changed', user: 'Bob Johnson', role: 'BOH', timestamp: '1 day ago' },
          ],
        };
      case 'analytics':
        return {
          metrics: [
            { label: 'Total Sessions', value: '847', change: '+18%', trend: 'up' },
            { label: 'Revenue', value: '$12,340', change: '+22%', trend: 'up' },
            { label: 'Avg Session Duration', value: '52 min', change: '+5%', trend: 'up' },
            { label: 'Customer Satisfaction', value: '4.8/5', change: '+0.2', trend: 'up' },
          ],
          breakdown: [
            { period: 'Today', sessions: 42, revenue: 1260 },
            { period: 'This Week', sessions: 284, revenue: 8520 },
            { period: 'This Month', sessions: 847, revenue: 25410 },
          ],
          topPerformers: [
            { item: 'Blue Mist', orders: 127, revenue: 3810 },
            { item: 'Double Apple', orders: 98, revenue: 2940 },
            { item: 'Strawberry', orders: 76, revenue: 2280 },
          ],
        };
      case 'settings':
        return {
          metrics: [
            { label: 'System Status', value: 'Operational', change: '99.9%', trend: 'neutral' },
            { label: 'Last Backup', value: '2 hours ago', change: 'Success', trend: 'up' },
            { label: 'Config Changes', value: '3', change: 'This week', trend: 'neutral' },
            { label: 'Active Integrations', value: '5', change: 'All healthy', trend: 'up' },
          ],
          configurations: [
            { setting: 'Session Timeout', value: '90 minutes', status: 'Active' },
            { setting: 'Auto-Upgrade', value: 'Enabled', status: 'Active' },
            { setting: 'Email Notifications', value: 'Enabled', status: 'Active' },
            { setting: 'Reflex Chain', value: 'Enabled', status: 'Active' },
          ],
          recentChanges: [
            { setting: 'Session Timeout', changed: '85 → 90 minutes', changedBy: 'Admin', timestamp: '1 day ago' },
            { setting: 'Email Notifications', changed: 'Disabled → Enabled', changedBy: 'Admin', timestamp: '3 days ago' },
          ],
        };
      case 'security':
        return {
          metrics: [
            { label: 'Active Sessions', value: '18', change: 'Normal', trend: 'neutral' },
            { label: 'Failed Logins', value: '2', change: '-50%', trend: 'down' },
            { label: 'Security Alerts', value: '0', change: 'None', trend: 'neutral' },
            { label: 'Last Security Scan', value: '1 hour ago', change: 'Clean', trend: 'up' },
          ],
          accessLogs: [
            { user: 'Admin', action: 'Login', ip: '192.168.1.100', timestamp: '2 hours ago', status: 'Success' },
            { user: 'Manager', action: 'View Reports', ip: '192.168.1.105', timestamp: '3 hours ago', status: 'Success' },
            { user: 'Unknown', action: 'Failed Login', ip: '192.168.1.200', timestamp: '5 hours ago', status: 'Failed' },
          ],
          securityEvents: [
            { type: 'Password Reset', user: 'staff-001', timestamp: '1 day ago', severity: 'Low' },
            { type: 'Permission Change', user: 'manager-002', timestamp: '2 days ago', severity: 'Medium' },
          ],
        };
      case 'database':
        return {
          metrics: [
            { label: 'Total Records', value: '12,847', change: '+234', trend: 'up' },
            { label: 'Database Size', value: '245 MB', change: '+12 MB', trend: 'up' },
            { label: 'Query Performance', value: '98ms avg', change: '-5ms', trend: 'down' },
            { label: 'Backup Status', value: 'Current', change: 'Last: 2h ago', trend: 'up' },
          ],
          tables: [
            { name: 'Sessions', records: 5847, size: '124 MB' },
            { name: 'Users', records: 124, size: '2 MB' },
            { name: 'Payments', records: 5234, size: '98 MB' },
            { name: 'Logs', records: 1642, size: '21 MB' },
          ],
          recentOps: [
            { operation: 'Backup Created', timestamp: '2 hours ago', status: 'Success' },
            { operation: 'Index Optimized', timestamp: '1 day ago', status: 'Success' },
            { operation: 'Cleanup Ran', timestamp: '2 days ago', status: 'Success' },
          ],
        };
      case 'pos-waitlist':
        return {
          metrics: [
            { label: 'Waitlist Entries', value: '47', change: '+12', trend: 'up' },
            { label: 'Average Wait Time', value: '18 min', change: '-3 min', trend: 'down' },
            { label: 'Seated Today', value: '142', change: '+8%', trend: 'up' },
            { label: 'No-Shows', value: '3', change: '-25%', trend: 'down' },
          ],
          currentWaitlist: [
            { name: 'John Doe', partySize: 3, waitTime: '12 min', status: 'Waiting' },
            { name: 'Jane Smith', partySize: 2, waitTime: '8 min', status: 'Waiting' },
            { name: 'Bob Johnson', partySize: 4, waitTime: '20 min', status: 'Waiting' },
          ],
          posIntegrations: [
            { system: 'Clover', status: 'Connected', lastSync: '2 min ago' },
            { system: 'Square', status: 'Connected', lastSync: '5 min ago' },
            { system: 'Toast', status: 'Pending', lastSync: 'Never' },
          ],
        };
      default:
        return {
          metrics: [
            { label: 'Total', value: 'N/A', change: 'N/A', trend: 'neutral' },
          ],
        };
    }
  };

  const reportData = generateReportData(reportType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">{reportTitle}</h2>
              <p className="text-zinc-400 text-sm">Report Type: {reportType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {reportData.metrics.map((metric, index) => (
              <div key={index} className="p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">{metric.label}</span>
                  <span className={`text-xs ${
                    metric.trend === 'up' ? 'text-green-400' :
                    metric.trend === 'down' ? 'text-red-400' : 'text-zinc-400'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
              </div>
            ))}
          </div>

          {/* Breakdown Data */}
          {reportData.breakdown && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Breakdown</h3>
              <div className="space-y-2">
                {reportData.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-zinc-900 rounded">
                    <span className="text-zinc-300">{item.role || item.period || item.item}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{item.count || item.sessions || item.orders}</span>
                      {item.percentage && (
                        <span className="text-zinc-400 text-sm">{item.percentage}%</span>
                      )}
                      {item.revenue && (
                        <span className="text-green-400 font-medium">${item.revenue}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Data Sections */}
          {reportData.recentActivity && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {reportData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-zinc-900 rounded text-sm">
                    <div>
                      <span className="text-white">{activity.action}</span>
                      <span className="text-zinc-400 ml-2">- {activity.user}</span>
                    </div>
                    <span className="text-zinc-500">{activity.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportData.configurations && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Current Configurations</h3>
              <div className="space-y-2">
                {reportData.configurations.map((config, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-zinc-900 rounded">
                    <span className="text-zinc-300">{config.setting}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white">{config.value}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        config.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {config.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportData.accessLogs && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Access Logs</h3>
              <div className="space-y-2">
                {reportData.accessLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-zinc-900 rounded text-sm">
                    <div>
                      <span className="text-white">{log.user}</span>
                      <span className="text-zinc-400 ml-2">- {log.action}</span>
                      <span className="text-zinc-500 ml-2">({log.ip})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.status === 'Success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-zinc-500">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportData.topPerformers && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
              <div className="space-y-2">
                {reportData.topPerformers.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-zinc-900 rounded">
                    <span className="text-zinc-300">{item.item}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-white">{item.orders} orders</span>
                      <span className="text-green-400 font-medium">${item.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

