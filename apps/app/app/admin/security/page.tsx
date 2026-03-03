"use client";

import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Activity,
  Download,
  RefreshCw,
  Filter,
  Search,
  Settings,
  Bell,
  Database,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showEventDetails, setShowEventDetails] = useState<number | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { id: 'events', label: 'Security Events', icon: <Activity className="w-4 h-4" /> },
    { id: 'users', label: 'User Security', icon: <User className="w-4 h-4" /> },
    { id: 'system', label: 'System Security', icon: <Settings className="w-4 h-4" /> },
    { id: 'logs', label: 'Security Logs', icon: <Database className="w-4 h-4" /> }
  ];

  // Mock security data
  const securityStats = {
    overallStatus: 'Secure',
    threatLevel: 'Low',
    activeSessions: 24,
    failedLogins: 3,
    blockedIPs: 1,
    securityScore: 95,
    lastScan: '2 hours ago',
    nextScan: '22 hours from now'
  };

  const securityEvents = [
    {
      id: 1,
      type: 'Login Success',
      user: 'John Smith',
      ip: '192.168.1.100',
      location: 'New York, NY',
      timestamp: '2 hours ago',
      status: 'success',
      details: 'Successful login from office network'
    },
    {
      id: 2,
      type: 'Failed Login',
      user: 'Unknown',
      ip: '203.45.67.89',
      location: 'Unknown',
      timestamp: '3 hours ago',
      status: 'failed',
      details: 'Multiple failed login attempts detected'
    },
    {
      id: 3,
      type: 'Permission Change',
      user: 'Emily Davis',
      ip: '192.168.1.105',
      location: 'New York, NY',
      timestamp: '1 day ago',
      status: 'success',
      details: 'User role changed from FOH to Manager'
    },
    {
      id: 4,
      type: 'Data Export',
      user: 'Mike Rodriguez',
      ip: '192.168.1.110',
      location: 'New York, NY',
      timestamp: '2 days ago',
      status: 'success',
      details: 'Session data exported to CSV'
    },
    {
      id: 5,
      type: 'Suspicious Activity',
      user: 'Unknown',
      ip: '45.67.89.123',
      location: 'Unknown',
      timestamp: '3 days ago',
      status: 'blocked',
      details: 'Multiple rapid requests from unknown IP'
    }
  ];

  const userSecurity = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@hookahplus.com',
      lastLogin: '2 hours ago',
      loginCount: 45,
      status: 'active',
      twoFactor: true,
      passwordAge: 30,
      riskLevel: 'low'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      email: 'sarah@hookahplus.com',
      lastLogin: '1 hour ago',
      loginCount: 23,
      status: 'active',
      twoFactor: false,
      passwordAge: 60,
      riskLevel: 'medium'
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      email: 'mike@hookahplus.com',
      lastLogin: '1 day ago',
      loginCount: 12,
      status: 'inactive',
      twoFactor: true,
      passwordAge: 90,
      riskLevel: 'high'
    }
  ];

  const systemSecurity = {
    sslStatus: 'Enabled',
    firewallStatus: 'Active',
    antivirusStatus: 'Up to date',
    lastUpdate: '2025-01-15',
    securityPatches: 3,
    vulnerabilityScan: 'Passed',
    backupStatus: 'Current',
    encryptionStatus: 'Enabled'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'blocked': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'inactive': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const handleViewEventDetails = (eventId: number) => {
    setShowEventDetails(eventId);
    console.log('Viewing event details for:', eventId);
  };

  const handleResetPassword = async (userId: number) => {
    setIsResettingPassword(true);
    try {
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Resetting password for user:', userId);
      alert('Password reset email sent successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleEnable2FA = async (userId: number) => {
    setIsEnabling2FA(true);
    try {
      // Simulate 2FA setup
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Enabling 2FA for user:', userId);
      alert('2FA setup instructions sent to user!');
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      alert('Error enabling 2FA. Please try again.');
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-green-400">{securityStats.overallStatus}</div>
              <div className="text-sm text-zinc-400">Overall Status</div>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-sm text-zinc-300">
            Security Score: {securityStats.securityScore}/100
          </div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-blue-400">{securityStats.activeSessions}</div>
              <div className="text-sm text-zinc-400">Active Sessions</div>
            </div>
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-sm text-zinc-300">
            All sessions secure
          </div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-red-400">{securityStats.failedLogins}</div>
              <div className="text-sm text-zinc-400">Failed Logins</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-sm text-zinc-300">
            Last 24 hours
          </div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-orange-400">{securityStats.blockedIPs}</div>
              <div className="text-sm text-zinc-400">Blocked IPs</div>
            </div>
            <Lock className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-sm text-zinc-300">
            Currently blocked
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          {securityEvents.slice(0, 5).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  event.status === 'success' ? 'bg-green-400' : 
                  event.status === 'failed' ? 'bg-red-400' : 'bg-orange-400'
                }`} />
                <div>
                  <div className="text-white font-medium">{event.type}</div>
                  <div className="text-sm text-zinc-400">{event.user} • {event.timestamp}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-zinc-300">{event.ip}</div>
                <div className="text-xs text-zinc-400">{event.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Security Events</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Types</option>
            <option value="login">Login Events</option>
            <option value="permission">Permission Changes</option>
            <option value="data">Data Access</option>
            <option value="suspicious">Suspicious Activity</option>
          </select>
        </div>
      </div>

      <div className="card-pretty">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Event</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">IP Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {securityEvents.map((event) => (
                <tr key={event.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{event.type}</div>
                    <div className="text-sm text-zinc-400">{event.details}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{event.user}</td>
                  <td className="px-4 py-3 text-zinc-300">{event.ip}</td>
                  <td className="px-4 py-3 text-zinc-300">{event.location}</td>
                  <td className="px-4 py-3 text-zinc-300">{event.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">User Security Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Last Login</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">2FA</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Password Age</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Risk Level</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {userSecurity.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-sm text-zinc-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{user.lastLogin}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.twoFactor ? 'success' : 'failed')}`}>
                      {user.twoFactor ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{user.passwordAge} days</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(user.riskLevel)}`}>
                      {user.riskLevel}
                    </span>
                  </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleResetPassword(user.id)}
                          disabled={isResettingPassword}
                          className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Reset Password"
                        >
                          {isResettingPassword ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Key className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleEnable2FA(user.id)}
                          disabled={isEnabling2FA}
                          className="text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Enable 2FA"
                        >
                          {isEnabling2FA ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
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

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Security Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">SSL Certificate</span>
              <span className="text-green-400">{systemSecurity.sslStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Firewall</span>
              <span className="text-green-400">{systemSecurity.firewallStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Antivirus</span>
              <span className="text-green-400">{systemSecurity.antivirusStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Last Update</span>
              <span className="text-white">{systemSecurity.lastUpdate}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Security Patches</span>
              <span className="text-orange-400">{systemSecurity.securityPatches} pending</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Vulnerability Scan</span>
              <span className="text-green-400">{systemSecurity.vulnerabilityScan}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Backup Status</span>
              <span className="text-green-400">{systemSecurity.backupStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Encryption</span>
              <span className="text-green-400">{systemSecurity.encryptionStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="card-pretty p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Logs</h3>
        <div className="space-y-3">
          {securityEvents.map((event) => (
            <div key={event.id} className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                    <span className="text-white font-medium">{event.type}</span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-400">{event.timestamp}</span>
                  </div>
                  <div className="text-sm text-zinc-300 mb-1">{event.details}</div>
                  <div className="text-xs text-zinc-500">
                    User: {event.user} | IP: {event.ip} | Location: {event.location}
                  </div>
                </div>
                <button 
                  onClick={() => handleViewEventDetails(event.id)}
                  className="text-zinc-400 hover:text-white"
                  title="View Event Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'events': return renderEvents();
      case 'users': return renderUsers();
      case 'system': return renderSystem();
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
            <Shield className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Security Dashboard
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Monitor security events and system status
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
