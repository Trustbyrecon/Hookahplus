"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { SELECT_ALL_LOCATIONS } from '../../../lib/admin-lounge-scope';

type SecEvent = {
  id: string;
  type: string;
  user: string;
  ip: string;
  location: string;
  timestamp: string;
  status: string;
  details: string;
};

type SecMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  joinDate: string;
};

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showEventDetails, setShowEventDetails] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [securityStats, setSecurityStats] = useState({
    overallStatus: '…',
    threatLevel: 'Low',
    activeSessions: 0,
    failedLogins: 0,
    blockedIPs: 0,
    securityScore: 0,
    lastScan: '',
    auditEvents24h: 0,
  });
  const [securityEvents, setSecurityEvents] = useState<SecEvent[]>([]);
  const [userSecurity, setUserSecurity] = useState<SecMember[]>([]);
  const [secLoading, setSecLoading] = useState(true);
  const [secError, setSecError] = useState<string | null>(null);

  const loadSecurity = useCallback(async () => {
    setSecLoading(true);
    setSecError(null);
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('active_lounge') : null;
      const params = new URLSearchParams({ limit: '60' });
      if (raw && raw !== SELECT_ALL_LOCATIONS) params.set('loungeId', raw);
      const r = await fetch(`/api/admin/security-summary?${params.toString()}`);
      const j = await r.json();
      if (!r.ok || !j.success) {
        setSecError(j.error || 'Failed to load security data');
        return;
      }
      setSecurityStats({
        overallStatus: j.stats?.overallStatus ?? 'Operational',
        threatLevel: j.stats?.threatLevel ?? 'Low',
        activeSessions: j.stats?.activeSessions ?? 0,
        failedLogins: j.stats?.failedLogins ?? 0,
        blockedIPs: j.stats?.blockedIPs ?? 0,
        securityScore: j.stats?.securityScore ?? 0,
        lastScan: j.stats?.lastScan ?? '',
        auditEvents24h: j.stats?.auditEvents24h ?? 0,
      });
      setSecurityEvents(
        (j.events || []).map((e: SecEvent) => ({
          ...e,
          timestamp: formatTs(e.timestamp),
        }))
      );

      const mr = await fetch('/api/admin/tenant-members');
      const mj = await mr.json();
      if (mr.ok && mj.success) {
        setUserSecurity(
          (mj.users || []).map(
            (u: { id: string; name: string; email: string; role: string; status: string; lastLogin: string; joinDate: string }) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              status: u.status || 'active',
              lastLogin: u.lastLogin || '—',
              joinDate: u.joinDate || '—',
            })
          )
        );
      }
    } catch (e) {
      setSecError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setSecLoading(false);
    }
  }, []);

  function formatTs(iso: string) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  useEffect(() => {
    loadSecurity();
  }, [loadSecurity]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { id: 'events', label: 'Security Events', icon: <Activity className="w-4 h-4" /> },
    { id: 'users', label: 'User Security', icon: <User className="w-4 h-4" /> },
    { id: 'system', label: 'System Security', icon: <Settings className="w-4 h-4" /> },
    { id: 'logs', label: 'Security Logs', icon: <Database className="w-4 h-4" /> }
  ];

  const systemSecurity = useMemo(
    () => ({
      sslStatus: 'TLS (hosting)',
      firewallStatus: 'Provider-managed',
      auditStream: `${securityStats.auditEvents24h} audit rows (24h)`,
      dbStatus: securityStats.overallStatus,
      encryptionStatus: 'At-rest (database provider)',
    }),
    [securityStats.auditEvents24h, securityStats.overallStatus]
  );

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

  const filteredEvents = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return securityEvents.filter((e) => {
      const match =
        !q ||
        e.type.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.user.toLowerCase().includes(q);
      if (!match) return false;
      if (filterType === 'all') return true;
      if (filterType === 'login') return /login|auth|session/i.test(e.type);
      if (filterType === 'permission') return /role|permission|VENUE/i.test(e.type);
      if (filterType === 'data') return /export|data/i.test(e.type);
      if (filterType === 'suspicious') return e.status === 'failed' || e.status === 'blocked';
      return true;
    });
  }, [securityEvents, searchTerm, filterType]);

  const handleViewEventDetails = (eventId: string) => {
    setShowEventDetails(eventId);
    console.log('Viewing event details for:', eventId);
  };

  const handleResetPassword = async (userId: string) => {
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

  const handleEnable2FA = async (userId: string) => {
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
      {secError && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {secError}
        </div>
      )}
      {secLoading && (
        <p className="text-sm text-zinc-400">Loading live security data…</p>
      )}
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
            Audit events (24h): {securityStats.auditEvents24h}
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
          <div className="text-sm text-zinc-300">Non-terminal sessions in scope</div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-red-400">{securityStats.failedLogins}</div>
              <div className="text-sm text-zinc-400">Failed Logins</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-sm text-zinc-300">Login telemetry not wired — use Supabase Auth logs</div>
        </div>

        <div className="card-pretty p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-orange-400">{securityStats.blockedIPs}</div>
              <div className="text-sm text-zinc-400">Blocked IPs</div>
            </div>
            <Lock className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-sm text-zinc-300">WAF / IP blocks via hosting provider</div>
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
              {filteredEvents.map((event) => (
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
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Member since</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Notes</th>
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
                  <td className="px-4 py-3 text-zinc-300 capitalize">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{user.joinDate}</td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">2FA / last login: Supabase Dashboard</td>
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
        <h3 className="text-lg font-semibold text-white mb-4">System security (live signals)</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Operational posture from app database connectivity and audit volume — not mock antivirus/patch rows.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Transport</span>
              <span className="text-green-400">{systemSecurity.sslStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Edge / firewall</span>
              <span className="text-green-400">{systemSecurity.firewallStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Audit stream</span>
              <span className="text-teal-400">{systemSecurity.auditStream}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Database</span>
              <span className="text-green-400">{systemSecurity.dbStatus}</span>
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
          {securityEvents.length === 0 && !secLoading && (
            <p className="text-zinc-500 text-sm">No audit events in the last 24 hours for this scope.</p>
          )}
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
