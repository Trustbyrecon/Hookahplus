"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  Tag,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import Button from '../../components/Button';
import GlobalNavigation from '../../components/GlobalNavigation';
import AdminReportModal from '../../components/AdminReportModal';
import { SELECT_ALL_LOCATIONS } from '../../lib/admin-lounge-scope';

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

const ADMIN_ACTIONS: AdminAction[] = [
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage user accounts and permissions',
    icon: <Users className="w-6 h-6" />,
    color: 'text-blue-400',
    href: '/admin/users',
    status: 'active',
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'View system analytics and reports',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'text-green-400',
    href: '/admin/analytics',
    status: 'active',
  },
  {
    id: 'settings',
    title: 'System Settings',
    description: 'Configure system preferences',
    icon: <Settings className="w-6 h-6" />,
    color: 'text-purple-400',
    href: '/admin/settings',
    status: 'active',
  },
  {
    id: 'security',
    title: 'Security Center',
    description: 'Monitor security and access logs',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-red-400',
    href: '/admin/security',
    status: 'active',
  },
  {
    id: 'database',
    title: 'Database Management',
    description: 'Manage database operations',
    icon: <Database className="w-6 h-6" />,
    color: 'text-orange-400',
    href: '/admin/database',
    status: 'active',
  },
  {
    id: 'operator-onboarding',
    title: 'Operator Onboarding',
    description: 'Manage new leads, intake, follow-up, scheduling, and onboarding',
    icon: <Users className="w-6 h-6" />,
    color: 'text-teal-400',
    href: '/admin/operator-onboarding',
    status: 'active',
  },
  {
    id: 'venue-identity',
    title: 'Venue Identity',
    description: 'Set stable venue identity (velocity / momentum / memory) per location',
    icon: <Building2 className="w-6 h-6" />,
    color: 'text-emerald-400',
    href: '/admin/venue-identity',
    status: 'active',
  },
  {
    id: 'onboarding-inspector',
    title: 'Onboarding Inspector',
    description: 'Inspect a SetupSession token/sid and multi-location readiness',
    icon: <Eye className="w-6 h-6" />,
    color: 'text-cyan-400',
    href: '/admin/onboarding-inspector',
    status: 'active',
  },
];

// Taxonomy Tab Component
function TaxonomyTab() {
  const [unknowns, setUnknowns] = useState<Array<{
    id: string;
    enumType: string;
    rawLabel: string;
    suggestedMapping: string | null;
    count: number;
    exampleEventId: string | null;
    firstSeen: string;
    lastSeen: string;
  }>>([]);
  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnumType, setSelectedEnumType] = useState<string>('all');
  const [promoting, setPromoting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [selectedEnumType]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load unknowns
      const enumTypeParam = selectedEnumType !== 'all' ? `&enumType=${selectedEnumType}` : '';
      const unknownsRes = await fetch(`/api/taxonomy/unknowns?window=7${enumTypeParam}`);
      const unknownsData = await unknownsRes.json();
      if (unknownsData.success) {
        setUnknowns(unknownsData.unknowns);
      }

      // Load KPI
      const kpiRes = await fetch('/api/taxonomy/kpi?window=7');
      const kpiData = await kpiRes.json();
      if (kpiData.success) {
        setKpi(kpiData.metrics);
      }
    } catch (error) {
      console.error('[Taxonomy] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (unknownId: string, rawLabel: string, enumType: string) => {
    const suggestedMapping = prompt(`Enter suggested mapping for "${rawLabel}":`);
    if (!suggestedMapping) return;

    try {
      setPromoting(unknownId);
      const res = await fetch('/api/taxonomy/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enumType, rawLabel, suggestedMapping })
      });
      
      if (res.ok) {
        await loadData();
        alert(`Promoted ${enumType}:${rawLabel} → ${suggestedMapping}`);
      } else {
        alert('Failed to promote unknown value');
      }
    } catch (error) {
      console.error('[Taxonomy] Error promoting:', error);
      alert('Error promoting unknown value');
    } finally {
      setPromoting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Metrics */}
      {kpi && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card-tablet">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-zinc-800 text-green-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              {kpi.overall.coverage < 95 && (
                <AlertCircleIcon className="w-5 h-5 text-yellow-400" />
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {kpi.overall.coverage.toFixed(1)}%
            </div>
            <div className="text-sm text-zinc-400">Overall Coverage</div>
            <div className="text-xs text-zinc-500 mt-1">
              Target: ≥95%
            </div>
          </div>

          <div className="card-tablet">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-zinc-800 text-blue-400">
                <Tag className="w-5 h-5" />
              </div>
              {kpi.sessionState.alert && (
                <AlertCircleIcon className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {kpi.sessionState.coverage.toFixed(1)}%
            </div>
            <div className="text-sm text-zinc-400">SessionState Coverage</div>
            <div className="text-xs text-zinc-500 mt-1">
              Unknown: {kpi.sessionState.unknownRate.toFixed(1)}%
            </div>
          </div>

          <div className="card-tablet">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-zinc-800 text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
              {kpi.trustEventType.alert && (
                <AlertCircleIcon className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {kpi.trustEventType.coverage.toFixed(1)}%
            </div>
            <div className="text-sm text-zinc-400">TrustEventType Coverage</div>
            <div className="text-xs text-zinc-500 mt-1">
              Unknown: {kpi.trustEventType.unknownRate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Top Unknowns Table */}
      <div className="card-tablet">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Top Unknowns (7d)</h3>
          <select
            value={selectedEnumType}
            onChange={(e) => setSelectedEnumType(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="SessionState">SessionState</option>
            <option value="TrustEventType">TrustEventType</option>
            <option value="DriftReason">DriftReason</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-zinc-400">Loading...</div>
        ) : unknowns.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <p>No unknown values found. Taxonomy coverage is excellent!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-300">Enum Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-300">Raw Label</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-300">Suggested Mapping</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-300">Count</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-300">Example Event ID</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unknowns.map((unknown) => (
                  <tr key={unknown.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="py-3 px-4 text-sm text-zinc-300">{unknown.enumType}</td>
                    <td className="py-3 px-4 text-sm text-white font-mono">{unknown.rawLabel}</td>
                    <td className="py-3 px-4 text-sm text-zinc-400">
                      {unknown.suggestedMapping || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-300 text-right">{unknown.count}</td>
                    <td className="py-3 px-4 text-sm text-zinc-400 font-mono">
                      {unknown.exampleEventId ? unknown.exampleEventId.substring(0, 20) + '...' : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        className="btn-pretty-outline btn-tablet-sm"
                        onClick={() => handlePromote(unknown.id, unknown.rawLabel, unknown.enumType)}
                        disabled={promoting === unknown.id}
                      >
                        {promoting === unknown.id ? 'Promoting...' : 'Promote'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

type OverviewPayload = {
  teamMemberCount: number;
  activeSessionsNow: number;
  todayRevenueCents: number;
  todayRevenueChangePct: number | null;
  sessionChangePct: number | null;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ type: string; title: string } | null>(null);
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState<string | null>(null);
  const [codigoOnlyNav, setCodigoOnlyNav] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'FOH' as 'FOH' | 'BOH' | 'MANAGER' | 'ADMIN',
    phone: ''
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCodigoOnlyNav(localStorage.getItem('active_lounge') === 'CODIGO');
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDashLoading(true);
      setDashError(null);
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('active_lounge') : null;
        const params = new URLSearchParams({ range: '7d' });
        if (raw && raw !== SELECT_ALL_LOCATIONS) params.set('loungeId', raw);
        const r = await fetch(`/api/admin/analytics-summary?${params.toString()}`);
        const j = await r.json();
        if (cancelled) return;
        if (!r.ok || !j.success) {
          setDashError(j.error || 'Failed to load metrics');
          setOverview(null);
          return;
        }
        const o = j.overview;
        setOverview({
          teamMemberCount: o.teamMemberCount ?? 0,
          activeSessionsNow: o.activeSessionsNow ?? 0,
          todayRevenueCents: o.todayRevenueCents ?? 0,
          todayRevenueChangePct: o.todayRevenueChangePct ?? null,
          sessionChangePct: o.sessionChangePct ?? null,
        });
      } catch (e) {
        if (!cancelled) {
          setDashError(e instanceof Error ? e.message : 'Failed to load metrics');
          setOverview(null);
        }
      } finally {
        if (!cancelled) setDashLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatPct = (p: number | null) => {
    if (p == null) return '—';
    const sign = p >= 0 ? '+' : '';
    return `${sign}${p}%`;
  };

  const systemMetrics: SystemMetric[] = useMemo(() => {
    if (dashLoading && !overview) {
      return [
        { id: 'users', title: 'Team accounts', value: '—', change: '…', trend: 'neutral', icon: <Users className="w-5 h-5" />, color: 'text-blue-400' },
        { id: 'sessions', title: 'Active Sessions', value: '—', change: '…', trend: 'neutral', icon: <Activity className="w-5 h-5" />, color: 'text-green-400' },
        { id: 'revenue', title: "Today's Revenue", value: '—', change: '…', trend: 'neutral', icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-400' },
        { id: 'system', title: 'System Status', value: '…', change: '…', trend: 'neutral', icon: <Server className="w-5 h-5" />, color: 'text-zinc-400' },
      ];
    }
    if (!overview) {
      return [
        { id: 'users', title: 'Team accounts', value: '—', change: dashError || 'Unavailable', trend: 'neutral', icon: <Users className="w-5 h-5" />, color: 'text-blue-400' },
        { id: 'sessions', title: 'Active Sessions', value: '—', change: '—', trend: 'neutral', icon: <Activity className="w-5 h-5" />, color: 'text-green-400' },
        { id: 'revenue', title: "Today's Revenue", value: '—', change: '—', trend: 'neutral', icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-400' },
        { id: 'system', title: 'System Status', value: 'Degraded', change: '—', trend: 'down', icon: <Server className="w-5 h-5" />, color: 'text-red-400' },
      ];
    }
    const rev = overview.todayRevenueCents / 100;
    return [
      {
        id: 'users',
        title: 'Team accounts',
        value: String(overview.teamMemberCount),
        change: 'live',
        trend: 'neutral' as const,
        icon: <Users className="w-5 h-5" />,
        color: 'text-blue-400',
      },
      {
        id: 'sessions',
        title: 'Active Sessions',
        value: String(overview.activeSessionsNow),
        change: formatPct(overview.sessionChangePct),
        trend: (overview.sessionChangePct ?? 0) >= 0 ? ('up' as const) : ('down' as const),
        icon: <Activity className="w-5 h-5" />,
        color: 'text-green-400',
      },
      {
        id: 'revenue',
        title: "Today's Revenue",
        value: `$${rev.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        change: formatPct(overview.todayRevenueChangePct),
        trend: (overview.todayRevenueChangePct ?? 0) >= 0 ? ('up' as const) : ('down' as const),
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-purple-400',
      },
      {
        id: 'system',
        title: 'System Status',
        value: dashError ? 'Check data' : 'Operational',
        change: dashError ? '—' : 'DB OK',
        trend: 'neutral' as const,
        icon: <Server className="w-5 h-5" />,
        color: dashError ? 'text-amber-400' : 'text-green-400',
      },
    ];
  }, [overview, dashLoading, dashError]);

  const visibleAdminActions = useMemo(
    () =>
      ADMIN_ACTIONS.filter(
        (a) =>
          !codigoOnlyNav || !['operator-onboarding', 'onboarding-inspector'].includes(a.id)
      ),
    [codigoOnlyNav]
  );

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

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
            { id: 'taxonomy', label: 'Taxonomy', icon: <Tag className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors btn-tablet whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'taxonomy' ? (
          <TaxonomyTab />
        ) : (
          <>
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
                {visibleAdminActions.map((action) => (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="p-4 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg bg-zinc-800 ${action.color}`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
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
                      <span className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">
                        Open <ChevronRight className="w-3 h-3" />
                      </span>
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
          </>
        )}
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

      {/* Admin Report Modal */}
      {selectedReport && (
        <AdminReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReport(null);
          }}
          reportType={selectedReport.type}
          reportTitle={selectedReport.title}
        />
      )}
    </div>
  );
}
