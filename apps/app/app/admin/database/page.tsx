"use client";

import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Key,
  Lock,
  Globe,
  Server,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isBackingUp, setIsBackingUp] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Database className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup & Restore', icon: <Archive className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <Activity className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Settings className="w-4 h-4" /> },
    { id: 'logs', label: 'Database Logs', icon: <Server className="w-4 h-4" /> }
  ];

  // Mock database data
  const databaseStats = {
    totalRecords: 12543,
    sessions: 892,
    users: 24,
    transactions: 11567,
    lastBackup: '2025-01-15 02:00 AM',
    backupSize: '45.2 MB',
    databaseSize: '2.3 GB',
    freeSpace: '47.7 GB',
    uptime: '15 days, 3 hours',
    connections: 12,
    maxConnections: 100,
    queryTime: '0.023s',
    cacheHitRate: '98.5%'
  };

  const backupHistory = [
    {
      id: 1,
      name: 'backup_2025_01_15_020000.sql',
      size: '45.2 MB',
      createdAt: '2025-01-15 02:00 AM',
      status: 'completed',
      type: 'full'
    },
    {
      id: 2,
      name: 'backup_2025_01_14_020000.sql',
      size: '44.8 MB',
      createdAt: '2025-01-14 02:00 AM',
      status: 'completed',
      type: 'full'
    },
    {
      id: 3,
      name: 'backup_2025_01_13_020000.sql',
      size: '44.5 MB',
      createdAt: '2025-01-13 02:00 AM',
      status: 'completed',
      type: 'full'
    },
    {
      id: 4,
      name: 'backup_2025_01_12_020000.sql',
      size: '44.1 MB',
      createdAt: '2025-01-12 02:00 AM',
      status: 'failed',
      type: 'full'
    }
  ];

  const performanceMetrics = [
    { name: 'CPU Usage', value: '45%', status: 'good' },
    { name: 'Memory Usage', value: '2.1 GB / 4 GB', status: 'good' },
    { name: 'Disk I/O', value: '125 MB/s', status: 'good' },
    { name: 'Query Time', value: '0.023s', status: 'excellent' },
    { name: 'Cache Hit Rate', value: '98.5%', status: 'excellent' },
    { name: 'Active Connections', value: '12 / 100', status: 'good' }
  ];

  const maintenanceTasks = [
    { name: 'Optimize Tables', description: 'Defragment and optimize database tables', lastRun: '2025-01-10', nextRun: '2025-01-20', status: 'scheduled' },
    { name: 'Clean Logs', description: 'Remove old log entries older than 30 days', lastRun: '2025-01-12', nextRun: '2025-01-15', status: 'completed' },
    { name: 'Update Statistics', description: 'Update table statistics for query optimization', lastRun: '2025-01-14', nextRun: '2025-01-16', status: 'completed' },
    { name: 'Check Integrity', description: 'Verify database integrity and consistency', lastRun: '2025-01-13', nextRun: '2025-01-17', status: 'scheduled' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'scheduled': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'running': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'good': return 'text-green-400';
      case 'excellent': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsBackingUp(false);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{databaseStats.totalRecords.toLocaleString()}</div>
              <div className="text-sm text-zinc-400">Total Records</div>
            </div>
            <Database className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-sm text-zinc-300">
            {databaseStats.sessions} sessions, {databaseStats.users} users
          </div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{databaseStats.databaseSize}</div>
              <div className="text-sm text-zinc-400">Database Size</div>
            </div>
            <HardDrive className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-sm text-zinc-300">
            {databaseStats.freeSpace} free space
          </div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{databaseStats.uptime}</div>
              <div className="text-sm text-zinc-400">Uptime</div>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-sm text-zinc-300">
            Last restart: 2025-01-01
          </div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{databaseStats.connections}</div>
              <div className="text-sm text-zinc-400">Active Connections</div>
            </div>
            <Activity className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-sm text-zinc-300">
            {databaseStats.maxConnections} max allowed
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceMetrics.map((metric) => (
            <div key={metric.name} className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">{metric.name}</span>
                <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${
                  metric.status === 'excellent' ? 'bg-green-400' :
                  metric.status === 'good' ? 'bg-blue-400' :
                  metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`} style={{ width: '85%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Backup & Restore</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-white mb-3">Create Backup</h4>
            <div className="space-y-3">
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <div className="text-sm text-zinc-400 mb-1">Last Backup</div>
                <div className="text-white font-medium">{databaseStats.lastBackup}</div>
                <div className="text-sm text-zinc-400">Size: {databaseStats.backupSize}</div>
              </div>
              <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="w-full btn-pretty-primary"
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    Create Backup
                  </>
                )}
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-white mb-3">Restore from Backup</h4>
            <div className="space-y-3">
              <button className="w-full btn-pretty-secondary">
                <Upload className="w-4 h-4 mr-2" />
                Upload Backup File
              </button>
              <button className="w-full btn-pretty-outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore from History
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Backup History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Backup Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Size</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {backupHistory.map((backup) => (
                <tr key={backup.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-white font-medium">{backup.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{backup.size}</td>
                  <td className="px-4 py-3 text-zinc-300">{backup.createdAt}</td>
                  <td className="px-4 py-3 text-zinc-300 capitalize">{backup.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="text-green-400 hover:text-green-300" title="Restore">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
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

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Database Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Query Time</span>
              <span className="text-green-400">{databaseStats.queryTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Cache Hit Rate</span>
              <span className="text-green-400">{databaseStats.cacheHitRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Active Connections</span>
              <span className="text-blue-400">{databaseStats.connections} / {databaseStats.maxConnections}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Database Size</span>
              <span className="text-white">{databaseStats.databaseSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Free Space</span>
              <span className="text-green-400">{databaseStats.freeSpace}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Uptime</span>
              <span className="text-white">{databaseStats.uptime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Maintenance Tasks</h3>
        <div className="space-y-4">
          {maintenanceTasks.map((task) => (
            <div key={task.name} className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-white font-medium">{task.name}</div>
                  <div className="text-sm text-zinc-400">{task.description}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Last run: {task.lastRun}</span>
                <span>Next run: {task.nextRun}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Database Logs</h3>
        <div className="space-y-3">
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Backup Completed</span>
              <span className="text-sm text-zinc-400">2025-01-15 02:05 AM</span>
            </div>
            <div className="text-sm text-zinc-300">Full database backup completed successfully. Size: 45.2 MB</div>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Table Optimization</span>
              <span className="text-sm text-zinc-400">2025-01-15 01:30 AM</span>
            </div>
            <div className="text-sm text-zinc-300">Sessions table optimized. Query performance improved by 15%</div>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Connection Pool Reset</span>
              <span className="text-sm text-zinc-400">2025-01-15 00:45 AM</span>
            </div>
            <div className="text-sm text-zinc-300">Database connection pool reset due to high memory usage</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'backup': return renderBackup();
      case 'performance': return renderPerformance();
      case 'maintenance': return renderMaintenance();
      case 'logs': return renderLogs();
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
            <Database className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Database Management
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Database administration and maintenance tools
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
