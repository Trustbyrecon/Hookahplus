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
  RefreshCw
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
  href: string;
  color: string;
  status: 'active' | 'pending' | 'maintenance';
}

export default function AdminControlCenter() {
  const [activeSection, setActiveSection] = useState('overview');
  const [showDebugInfo, setShowDebugInfo] = useState(true);

  const systemMetrics: SystemMetric[] = [
    {
      id: 'sessions',
      title: 'Total Sessions',
      value: '7',
      change: '+2 from yesterday',
      trend: 'up',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      id: 'active',
      title: 'Active Sessions',
      value: '2',
      change: '+1 from yesterday',
      trend: 'up',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      id: 'users',
      title: 'Active Users',
      value: '12',
      change: '+3 from yesterday',
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-400'
    },
    {
      id: 'revenue',
      title: 'Today\'s Revenue',
      value: '$1,247',
      change: '+15% from yesterday',
      trend: 'up',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      id: 'waitlist',
      title: 'POS Waitlist',
      value: '3',
      change: '+1 this week',
      trend: 'up',
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-orange-400'
    },
    {
      id: 'uptime',
      title: 'System Uptime',
      value: '99.9%',
      change: 'Last 30 days',
      trend: 'neutral',
      icon: <Server className="w-5 h-5" />,
      color: 'text-green-400'
    }
  ];

  const adminActions: AdminAction[] = [
    {
      id: 'pos-waitlist',
      title: 'POS Waitlist',
      description: 'Manage business waitlist and queue',
      icon: <Building2 className="w-6 h-6" />,
      href: '/admin/pos-waitlist',
      color: 'text-orange-400',
      status: 'active'
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage staff accounts and permissions',
      icon: <Users className="w-6 h-6" />,
      href: '/admin/users',
      color: 'text-blue-400',
      status: 'active'
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: <Settings className="w-6 h-6" />,
      href: '/admin/settings',
      color: 'text-purple-400',
      status: 'active'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View detailed system analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/admin/analytics',
      color: 'text-green-400',
      status: 'active'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Manage security settings and logs',
      icon: <Shield className="w-6 h-6" />,
      href: '/admin/security',
      color: 'text-red-400',
      status: 'active'
    },
    {
      id: 'database',
      title: 'Database',
      description: 'Database management and backups',
      icon: <Database className="w-6 h-6" />,
      href: '/admin/database',
      color: 'text-cyan-400',
      status: 'maintenance'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'New waitlist entry added',
      user: 'Admin',
      time: '2 minutes ago',
      icon: <Plus className="w-4 h-4" />,
      color: 'text-green-400'
    },
    {
      id: '2',
      action: 'Session completed',
      user: 'System',
      time: '5 minutes ago',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-blue-400'
    },
    {
      id: '3',
      action: 'User role updated',
      user: 'Admin',
      time: '10 minutes ago',
      icon: <Edit className="w-4 h-4" />,
      color: 'text-purple-400'
    },
    {
      id: '4',
      action: 'System backup completed',
      user: 'System',
      time: '1 hour ago',
      icon: <Database className="w-4 h-4" />,
      color: 'text-cyan-400'
    }
  ];

  const getTrendColor = (trend: SystemMetric['trend']) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'neutral': return 'text-zinc-400';
    }
  };

  const getStatusColor = (status: AdminAction['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'maintenance': return 'text-orange-400 bg-orange-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Settings className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Control Center</h1>
                <p className="text-zinc-400">System administration and management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="text-zinc-400 border-zinc-600 hover:bg-zinc-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showDebugInfo ? 'Hide' : 'Show'} Debug
              </Button>
              <Button className="bg-red-500 hover:bg-red-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Fire Session
              </Button>
            </div>
          </div>

          {/* Debug Info Bar */}
          {showDebugInfo && (
            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700 mb-6">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">Debug Info:</span>
                  <span className="text-green-400">Pretty Theme: ✅ Enabled</span>
                </div>
                <div className="text-zinc-400">|</div>
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">Sessions Loaded:</span>
                  <span className="text-white">3</span>
                </div>
                <div className="text-zinc-400">|</div>
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">Loading:</span>
                  <span className="text-green-400">✅ Complete</span>
                </div>
                <div className="text-zinc-400">|</div>
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">API Status:</span>
                  <span className="text-green-400">Connected</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Status Bar */}
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live</span>
                </div>
                <div className="text-sm text-zinc-400">
                  Total Sessions: <span className="text-white font-semibold">7</span>
                </div>
                <div className="text-sm text-zinc-400">
                  Active: <span className="text-green-400 font-semibold">2</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-zinc-400">Flow Status:</span>
                <span className="text-green-400 font-semibold">2 Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {systemMetrics.map(metric => (
            <div key={metric.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
              <div className="text-sm text-zinc-400 mb-1">{metric.title}</div>
              <div className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>

        {/* Admin Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminActions.map(action => (
              <Link key={action.id} href={action.href}>
                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 hover:bg-zinc-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${action.color}`}>
                      {action.icon}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                      {action.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-medium text-white mb-2">{action.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{action.description}</p>
                  <div className="flex items-center text-sm text-zinc-500">
                    <span>Access</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-zinc-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-blue-500 hover:bg-blue-600">
                <Users className="w-4 h-4 mr-2" />
                Add New User
              </Button>
              <Button className="w-full justify-start bg-green-500 hover:bg-green-600">
                <Database className="w-4 h-4 mr-2" />
                Run System Backup
              </Button>
              <Button className="w-full justify-start bg-purple-500 hover:bg-purple-600">
                <Settings className="w-4 h-4 mr-2" />
                Update System Settings
              </Button>
              <Button className="w-full justify-start bg-orange-500 hover:bg-orange-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh System Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}