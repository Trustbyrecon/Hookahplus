"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  Database,
  UserCheck,
  TrendingUp,
  Lock,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';

export default function AdministrationPage() {
  const [activeTab, setActiveTab] = useState('user-management');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'user-management', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'system-settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'database', label: 'Database', icon: <Database className="w-4 h-4" /> }
  ];

  // Mock data
  const users = [
    { id: 1, name: 'John Smith', email: 'john@hookahplus.com', role: 'Manager', status: 'active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Sarah Chen', email: 'sarah@hookahplus.com', role: 'BOH', status: 'active', lastLogin: '1 hour ago' },
    { id: 3, name: 'Mike Rodriguez', email: 'mike@hookahplus.com', role: 'FOH', status: 'inactive', lastLogin: '1 day ago' },
    { id: 4, name: 'Emily Davis', email: 'emily@hookahplus.com', role: 'Admin', status: 'active', lastLogin: '30 minutes ago' }
  ];

  const analytics = {
    totalUsers: 24,
    activeUsers: 18,
    totalSessions: 156,
    revenue: 12450,
    avgSessionDuration: 45,
    peakHours: '8-10 PM'
  };

  const systemSettings = {
    appVersion: '1.2.3',
    lastUpdate: '2025-01-15',
    uptime: '99.9%',
    storage: '2.3 GB / 10 GB',
    memory: '512 MB / 2 GB'
  };

  const securityEvents = [
    { id: 1, type: 'Login', user: 'John Smith', timestamp: '2 hours ago', status: 'success' },
    { id: 2, type: 'Failed Login', user: 'Unknown', timestamp: '3 hours ago', status: 'failed' },
    { id: 3, type: 'Permission Change', user: 'Emily Davis', timestamp: '1 day ago', status: 'success' },
    { id: 4, type: 'Data Export', user: 'Mike Rodriguez', timestamp: '2 days ago', status: 'success' }
  ];

  const databaseStats = {
    totalRecords: 12543,
    sessions: 892,
    users: 24,
    transactions: 11567,
    lastBackup: '2025-01-15 02:00 AM',
    backupSize: '45.2 MB'
  };

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">User Management</h3>
        <button className="btn-pretty-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{analytics.totalUsers}</div>
              <div className="text-sm text-zinc-400">Total Users</div>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">{analytics.activeUsers}</div>
              <div className="text-sm text-zinc-400">Active Users</div>
            </div>
            <UserCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-400">{analytics.totalUsers - analytics.activeUsers}</div>
              <div className="text-sm text-zinc-400">Inactive Users</div>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      <div className="card-pretty">
        <div className="p-4 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Users</h4>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button className="btn-pretty-secondary">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Last Login</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-sm text-zinc-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'Manager' ? 'bg-blue-500/20 text-blue-400' :
                      user.role === 'BOH' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{user.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
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

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Analytics Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{analytics.totalSessions}</div>
              <div className="text-sm text-zinc-400">Total Sessions</div>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">${analytics.revenue.toLocaleString()}</div>
              <div className="text-sm text-zinc-400">Revenue</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-400">{analytics.avgSessionDuration}min</div>
              <div className="text-sm text-zinc-400">Avg Duration</div>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-400">{analytics.peakHours}</div>
              <div className="text-sm text-zinc-400">Peak Hours</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-pretty p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Session Trends</h4>
          <div className="h-64 bg-zinc-800/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
              <p className="text-zinc-400">Chart visualization would go here</p>
            </div>
          </div>
        </div>
        <div className="card-pretty p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h4>
          <div className="h-64 bg-zinc-800/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
              <p className="text-zinc-400">Revenue chart would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">System Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-pretty p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Application Info</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Version</span>
              <span className="text-white">{systemSettings.appVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Last Update</span>
              <span className="text-white">{systemSettings.lastUpdate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Uptime</span>
              <span className="text-green-400">{systemSettings.uptime}</span>
            </div>
          </div>
        </div>

        <div className="card-pretty p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Resource Usage</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Storage</span>
              <span className="text-white">{systemSettings.storage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Memory</span>
              <span className="text-white">{systemSettings.memory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Status</span>
              <span className="text-green-400">Healthy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-pretty p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Configuration</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Auto-backup</div>
              <div className="text-sm text-zinc-400">Automatically backup data daily</div>
            </div>
            <button className="btn-pretty-primary">Enable</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Email Notifications</div>
              <div className="text-sm text-zinc-400">Send email alerts for important events</div>
            </div>
            <button className="btn-pretty-secondary">Configure</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Maintenance Mode</div>
              <div className="text-sm text-zinc-400">Temporarily disable public access</div>
            </div>
            <button className="btn-pretty-outline">Enable</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Security Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">Secure</div>
              <div className="text-sm text-zinc-400">Security Status</div>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">24</div>
              <div className="text-sm text-zinc-400">Active Sessions</div>
            </div>
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-400">3</div>
              <div className="text-sm text-zinc-400">Failed Logins</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      <div className="card-pretty">
        <div className="p-4 border-b border-zinc-700">
          <h4 className="text-lg font-semibold text-white">Recent Security Events</h4>
        </div>
        <div className="divide-y divide-zinc-700">
          {securityEvents.map((event) => (
            <div key={event.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  event.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <div>
                  <div className="text-white font-medium">{event.type}</div>
                  <div className="text-sm text-zinc-400">{event.user} • {event.timestamp}</div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {event.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDatabase = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Database Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{databaseStats.totalRecords.toLocaleString()}</div>
              <div className="text-sm text-zinc-400">Total Records</div>
            </div>
            <Database className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">{databaseStats.sessions}</div>
              <div className="text-sm text-zinc-400">Sessions</div>
            </div>
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-400">{databaseStats.users}</div>
              <div className="text-sm text-zinc-400">Users</div>
            </div>
            <Users className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="card-pretty p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-400">{databaseStats.transactions.toLocaleString()}</div>
              <div className="text-sm text-zinc-400">Transactions</div>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-pretty p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Backup Information</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Last Backup</span>
              <span className="text-white">{databaseStats.lastBackup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Backup Size</span>
              <span className="text-white">{databaseStats.backupSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Status</span>
              <span className="text-green-400">Up to date</span>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button className="btn-pretty-primary">
              <Download className="w-4 h-4 mr-2" />
              Download Backup
            </button>
            <button className="btn-pretty-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Create Backup
            </button>
          </div>
        </div>

        <div className="card-pretty p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Database Actions</h4>
          <div className="space-y-3">
            <button className="w-full btn-pretty-primary text-left">
              <Database className="w-4 h-4 mr-2" />
              Optimize Database
            </button>
            <button className="w-full btn-pretty-secondary text-left">
              <Upload className="w-4 h-4 mr-2" />
              Restore from Backup
            </button>
            <button className="w-full btn-pretty-outline text-left">
              <Settings className="w-4 h-4 mr-2" />
              Database Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'user-management': return renderUserManagement();
      case 'analytics': return renderAnalytics();
      case 'system-settings': return renderSystemSettings();
      case 'security': return renderSecurity();
      case 'database': return renderDatabase();
      default: return renderUserManagement();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Administration
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            System administration and management dashboard
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
