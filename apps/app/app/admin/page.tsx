"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Users, 
  BarChart3, 
  Shield, 
  Database, 
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building2,
  Target,
  Eye,
  Activity,
  TrendingUp,
  Server,
  Key,
  Globe,
  FileText,
  Mail,
  Phone,
  Calendar,
  Star,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  UserPlus,
  Download,
  Save,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import Button from '../../components/Button';
import GlobalNavigation from '../../components/GlobalNavigation';

interface SystemMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface AdminAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState('operational');
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'FOH' as 'FOH' | 'BOH' | 'MANAGER' | 'ADMIN',
    phone: ''
  });

  const systemMetrics: SystemMetric[] = [
    {
      id: 'users',
      title: 'Total Users',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      id: 'sessions',
      title: 'Active Sessions',
      value: '8',
      change: '+3',
      trend: 'up',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      id: 'revenue',
      title: 'Today\'s Revenue',
      value: '$2,847',
      change: '+18%',
      trend: 'up',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-purple-400'
    },
    {
      id: 'system',
      title: 'System Status',
      value: 'Operational',
      change: '99.9%',
      trend: 'neutral',
      icon: <Server className="w-5 h-5" />,
      color: 'text-green-400'
    }
  ];

  const adminActions: AdminAction[] = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-400',
      href: '/admin/users',
      status: 'active'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'View system analytics and reports',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-green-400',
      href: '/admin/analytics',
      status: 'active'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: <Settings className="w-6 h-6" />,
      color: 'text-purple-400',
      href: '/admin/settings',
      status: 'active'
    },
    {
      id: 'security',
      title: 'Security Center',
      description: 'Monitor security and access logs',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-red-400',
      href: '/admin/security',
      status: 'active'
    },
    {
      id: 'database',
      title: 'Database Management',
      description: 'Manage database operations',
      icon: <Database className="w-6 h-6" />,
      color: 'text-orange-400',
      href: '/admin/database',
      status: 'active'
    },
    {
      id: 'pos-waitlist',
      title: 'POS Waitlist',
      description: 'Manage POS integration and waitlist',
      icon: <Building2 className="w-6 h-6" />,
      color: 'text-cyan-400',
      href: '/admin/pos-waitlist',
      status: 'active'
    }
  ];

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.phone) {
      // Simulate adding user
      alert(`User ${newUser.name} added successfully!`);
      setNewUser({ name: '', email: '', role: 'FOH', phone: '' });
      setShowAddUserModal(false);
    }
  };

  const handleRunBackup = () => {
    setShowBackupModal(true);
    // Simulate backup process
    setTimeout(() => {
      alert('System backup completed successfully!');
      setShowBackupModal(false);
    }, 2000);
  };

  const handleUpdateSettings = () => {
    setShowSettingsModal(true);
    // Simulate settings update
    setTimeout(() => {
      alert('System settings updated successfully!');
      setShowSettingsModal(false);
    }, 1500);
  };

  const handleRefreshSystem = async () => {
    setIsRefreshing(true);
    // Simulate refresh process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSystemStatus('operational');
    setIsRefreshing(false);
    alert('System status refreshed successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-red-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Admin Control Center
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            System administration and management
          </p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric) => (
            <div key={metric.id} className="card-tablet">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-zinc-800 ${metric.color}`}>
                  {metric.icon}
                </div>
                <div className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-400' : 
                  metric.trend === 'down' ? 'text-red-400' : 'text-zinc-400'
                }`}>
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-sm text-zinc-400">{metric.title}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Actions */}
          <div className="lg:col-span-2">
            <div className="card-tablet">
              <h3 className="text-xl font-semibold mb-6">Administration Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminActions.map((action) => (
                  <Link key={action.id} href={action.href}>
                    <div className="p-4 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg bg-zinc-800 ${action.color}`}>
                          {action.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{action.title}</h4>
                          <p className="text-sm text-zinc-400">{action.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          action.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          action.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {action.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-tablet">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start btn-pretty-primary btn-tablet"
                onClick={() => setShowAddUserModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
              <Button 
                className="w-full justify-start btn-pretty-secondary btn-tablet"
                onClick={handleRunBackup}
              >
                <Database className="w-4 h-4 mr-2" />
                Run System Backup
              </Button>
              <Button 
                className="w-full justify-start btn-pretty-outline btn-tablet"
                onClick={handleUpdateSettings}
              >
                <Settings className="w-4 h-4 mr-2" />
                Update System Settings
              </Button>
              <Button 
                className="w-full justify-start btn-pretty-outline btn-tablet"
                onClick={handleRefreshSystem}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh System Status'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card-tablet w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <Button 
                className="btn-pretty-outline btn-tablet-sm"
                onClick={() => setShowAddUserModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'FOH' | 'BOH' | 'MANAGER' | 'ADMIN' })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                >
                  <option value="FOH">FOH (Front of House)</option>
                  <option value="BOH">BOH (Back of House)</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  className="btn-pretty-primary btn-tablet flex-1"
                  onClick={handleAddUser}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add User
                </Button>
                <Button 
                  className="btn-pretty-outline btn-tablet flex-1"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card-tablet w-full max-w-md text-center">
            <div className="mb-6">
              <Database className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Running System Backup</h3>
              <p className="text-zinc-400">Please wait while we backup your system data...</p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card-tablet w-full max-w-md text-center">
            <div className="mb-6">
              <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Updating System Settings</h3>
              <p className="text-zinc-400">Applying configuration changes...</p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
