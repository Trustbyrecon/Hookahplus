"use client";

import React, { useState, useMemo, useEffect } from 'react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../components';
import StaffPerformanceAnalytics from '../../components/StaffPerformanceAnalytics';
import StaffScheduling from '../../components/StaffScheduling';
import StaffCommunication from '../../components/StaffCommunication';
import RoleBasedPermissions from '../../components/RoleBasedPermissions';
import CoachingPanel from '../../components/CoachingPanel';
import { ZoneAnalytics } from '../../components/ZoneAnalytics';
import { SessionProvider, useSessionContext } from '../../contexts/SessionContext';
import { STATUS_TO_STAGE } from '../../types/enhancedSession';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X,
  Save,
  User,
  Shield,
  Crown,
  MessageSquare,
  Bell,
  BarChart3,
  Lightbulb,
  QrCode,
  Activity,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  status: 'available' | 'busy' | 'offline';
  email: string;
  phone: string;
  hireDate: string;
  performance: number;
  sessionsCompleted: number;
  lastActive: string;
  metrics: {
    sessionsCompleted: number;
    averageRating: number;
    onTimeDelivery: number;
    customerSatisfaction: number;
    efficiency: number;
    attendance: number;
  };
  trends: {
    sessionsCompleted: number;
    averageRating: number;
    onTimeDelivery: number;
  };
  achievements: string[];
  availability: {
    monday: { start: string; end: string; available: boolean }[];
    tuesday: { start: string; end: string; available: boolean }[];
    wednesday: { start: string; end: string; available: boolean }[];
    thursday: { start: string; end: string; available: boolean }[];
    friday: { start: string; end: string; available: boolean }[];
    saturday: { start: string; end: string; available: boolean }[];
    sunday: { start: string; end: string; available: boolean }[];
  };
  maxHoursPerWeek: number;
  currentHoursThisWeek: number;
}

export default function StaffPanelPage() {
  return (
    <SessionProvider>
      <StaffPanelPageContent />
    </SessionProvider>
  );
}

function StaffPanelPageContent() {
  const { sessions } = useSessionContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('week');
  const [showCoaching, setShowCoaching] = useState(false);
  const [selectedStaffForCoaching, setSelectedStaffForCoaching] = useState<string | null>(null);
  const [zoneData, setZoneData] = useState<{ workloads: any[]; metrics: any[] } | null>(null);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'FOH' as 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'
  });

  // Staff cockpit helpers (overview only)
  const [scanSessionId, setScanSessionId] = useState('');
  const [recentScans, setRecentScans] = useState<Array<{ sessionId: string; ts: number }>>([]);
  const [recentScanDetails, setRecentScanDetails] = useState<Record<string, any>>({});
  const [liveParticipantCounts, setLiveParticipantCounts] = useState<Record<string, number>>({});
  const [driftSummary, setDriftSummary] = useState<{ count: number; items: any[] } | null>(null);
  const [health, setHealth] = useState<any>(null);
  
  // Fetch zone data when zone tab is active
  useEffect(() => {
    if (activeTab === 'zones') {
      setZoneLoading(true);
      fetch('/api/staff/zones')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setZoneData({ workloads: data.zones || [], metrics: data.metrics || [] });
          }
          setZoneLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch zone data:', err);
          setZoneLoading(false);
        });
    }
  }, [activeTab]);

  // Load recent scans (client-only)
  useEffect(() => {
    if (activeTab !== 'overview') return;
    try {
      const key = 'hp_staff_recent_scans_v1';
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setRecentScans(parsed.slice(0, 10));
    } catch {
      setRecentScans([]);
    }
  }, [activeTab]);

  // Fetch details for recent scans (best-effort)
  useEffect(() => {
    if (activeTab !== 'overview') return;
    const ids = recentScans.map((r) => r.sessionId).filter(Boolean).slice(0, 5);
    if (!ids.length) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const resp = await fetch(`/api/sessions/${encodeURIComponent(id)}`);
            const data = await resp.json().catch(() => null);
            if (!resp.ok) return [id, null] as const;
            return [id, data] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );
      if (cancelled) return;
      const next: Record<string, any> = {};
      for (const [id, data] of entries) next[id] = data;
      setRecentScanDetails(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, recentScans]);

  // Fetch drift summary + health (overview only)
  useEffect(() => {
    if (activeTab !== 'overview') return;
    let cancelled = false;
    (async () => {
      try {
        const [driftResp, healthResp] = await Promise.all([
          fetch('/api/recon/drift-summary?action_type=recon.session.multi_active&hours=24'),
          fetch('/api/staff-panel/health'),
        ]);
        const driftData = await driftResp.json().catch(() => null);
        const healthData = await healthResp.json().catch(() => null);
        if (cancelled) return;
        if (driftResp.ok && driftData?.ok) setDriftSummary({ count: driftData.count || 0, items: driftData.items || [] });
        else setDriftSummary({ count: 0, items: [] });
        if (healthResp.ok && healthData?.ok) setHealth(healthData);
        else setHealth(null);
      } catch {
        if (!cancelled) {
          setDriftSummary({ count: 0, items: [] });
          setHealth(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Fetch participant counts for ACTIVE sessions (best-effort; small N)
  useEffect(() => {
    if (activeTab !== 'overview') return;
    const activeIds = sessions.filter((s) => s.status === 'ACTIVE').map((s) => s.id).slice(0, 5);
    if (!activeIds.length) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        activeIds.map(async (id) => {
          try {
            const resp = await fetch(`/api/sessions/${encodeURIComponent(id)}`);
            const data = await resp.json().catch(() => null);
            const count = Array.isArray(data?.participants) ? data.participants.length : 0;
            return [id, count] as const;
          } catch {
            return [id, 0] as const;
          }
        })
      );
      if (cancelled) return;
      const next: Record<string, number> = {};
      for (const [id, count] of entries) next[id] = count;
      setLiveParticipantCounts(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, sessions]);
  
  // Derive staff members from sessions
  const staffMembers = useMemo(() => {
    const staffMap = new Map<string, StaffMember>();
    
    sessions.forEach(session => {
      // Extract BOH staff
      if (session.assignedStaff?.boh) {
        const staffId = session.assignedStaff.boh;
        const key = `boh_${staffId}`;
        if (!staffMap.has(key)) {
          const bohSessions = sessions.filter(s => s.assignedStaff?.boh === staffId);
          const completedSessions = bohSessions.filter(s => s.status === 'CLOSED' || s.status === 'ACTIVE');
          const avgDuration = bohSessions.length > 0
            ? Math.round(bohSessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / bohSessions.length / 60)
            : 0;
          
          staffMap.set(key, {
            id: key,
            name: staffId, // In real implementation, this would come from a staff API
            role: 'BOH',
            status: 'available', // TODO: Determine from active sessions
            email: `${staffId}@hookahplus.com`,
            phone: '+1 (555) 000-0000',
            hireDate: new Date().toISOString().split('T')[0],
            performance: 4.5, // TODO: Calculate from metrics
            sessionsCompleted: completedSessions.length,
            lastActive: 'Recently',
            metrics: {
              sessionsCompleted: completedSessions.length,
              averageRating: 4.5,
              onTimeDelivery: 90,
              customerSatisfaction: 90,
              efficiency: 85,
              attendance: 95
            },
            trends: {
              sessionsCompleted: 0,
              averageRating: 0,
              onTimeDelivery: 0
            },
            achievements: [],
            availability: {
              monday: [{ start: '09:00', end: '17:00', available: true }],
              tuesday: [{ start: '09:00', end: '17:00', available: true }],
              wednesday: [{ start: '09:00', end: '17:00', available: true }],
              thursday: [{ start: '09:00', end: '17:00', available: true }],
              friday: [{ start: '09:00', end: '17:00', available: true }],
              saturday: [{ start: '10:00', end: '18:00', available: true }],
              sunday: [{ start: '10:00', end: '18:00', available: true }]
            },
            maxHoursPerWeek: 40,
            currentHoursThisWeek: 0
          });
        }
      }
      
      // Extract FOH staff
      if (session.assignedStaff?.foh) {
        const staffId = session.assignedStaff.foh;
        const key = `foh_${staffId}`;
        if (!staffMap.has(key)) {
          const fohSessions = sessions.filter(s => s.assignedStaff?.foh === staffId);
          const completedSessions = fohSessions.filter(s => s.status === 'CLOSED' || s.status === 'ACTIVE');
          const avgDuration = fohSessions.length > 0
            ? Math.round(fohSessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / fohSessions.length / 60)
            : 0;
          
          staffMap.set(key, {
            id: key,
            name: staffId, // In real implementation, this would come from a staff API
            role: 'FOH',
            status: 'available', // TODO: Determine from active sessions
            email: `${staffId}@hookahplus.com`,
            phone: '+1 (555) 000-0000',
            hireDate: new Date().toISOString().split('T')[0],
            performance: 4.5, // TODO: Calculate from metrics
            sessionsCompleted: completedSessions.length,
            lastActive: 'Recently',
            metrics: {
              sessionsCompleted: completedSessions.length,
              averageRating: 4.5,
              onTimeDelivery: 90,
              customerSatisfaction: 90,
              efficiency: 85,
              attendance: 95
            },
            trends: {
              sessionsCompleted: 0,
              averageRating: 0,
              onTimeDelivery: 0
            },
            achievements: [],
            availability: {
              monday: [{ start: '12:00', end: '20:00', available: true }],
              tuesday: [{ start: '12:00', end: '20:00', available: true }],
              wednesday: [{ start: '12:00', end: '20:00', available: true }],
              thursday: [{ start: '12:00', end: '20:00', available: true }],
              friday: [{ start: '12:00', end: '20:00', available: true }],
              saturday: [{ start: '14:00', end: '22:00', available: true }],
              sunday: [{ start: '14:00', end: '22:00', available: true }]
            },
            maxHoursPerWeek: 40,
            currentHoursThisWeek: 0
          });
        }
      }
    });
    
    return Array.from(staffMap.values());
  }, [sessions]);
  
  // Keep manual staff management for adding new staff (UI only for now)
  // Default to Shisha Master only; live data from sessions will populate allStaffMembers
  const [manualStaff, setManualStaff] = useState<StaffMember[]>([
    {
      id: 'staff-shisha-master',
      name: 'Shisha Master',
      role: 'BOH',
      status: 'available',
      email: 'shisha-master@hookahplus.com',
      phone: '+1 (555) 000-0000',
      hireDate: new Date().toISOString().split('T')[0],
      performance: 5.0,
      sessionsCompleted: 0,
      lastActive: 'Just now',
      metrics: {
        sessionsCompleted: 0,
        averageRating: 5.0,
        onTimeDelivery: 100,
        customerSatisfaction: 100,
        efficiency: 100,
        attendance: 100
      },
      trends: {
        sessionsCompleted: 0,
        averageRating: 0,
        onTimeDelivery: 0
      },
      achievements: [],
      availability: {
        monday: [{ start: '09:00', end: '17:00', available: true }],
        tuesday: [{ start: '09:00', end: '17:00', available: true }],
        wednesday: [{ start: '09:00', end: '17:00', available: true }],
        thursday: [{ start: '09:00', end: '17:00', available: true }],
        friday: [{ start: '09:00', end: '17:00', available: true }],
        saturday: [{ start: '10:00', end: '18:00', available: true }],
        sunday: [{ start: '10:00', end: '18:00', available: true }]
      },
      maxHoursPerWeek: 40,
      currentHoursThisWeek: 0
    }
  ]);
  
  // Combine derived staff with manually added staff
  const allStaffMembers = useMemo(() => {
    const combined = [...staffMembers];
    // Add manual staff that aren't already in the list
    manualStaff.forEach(manual => {
      if (!combined.find(s => s.id === manual.id)) {
        combined.push(manual);
      }
    });
    return combined;
  }, [staffMembers, manualStaff]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'BOH': return 'bg-orange-500';
      case 'FOH': return 'bg-blue-500';
      case 'MANAGER': return 'bg-purple-500';
      case 'ADMIN': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'BOH': return <Shield className="w-4 h-4" />;
      case 'FOH': return <User className="w-4 h-4" />;
      case 'MANAGER': return <Crown className="w-4 h-4" />;
      case 'ADMIN': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.email && newStaff.phone) {
      const staff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: newStaff.name,
        role: newStaff.role,
        status: 'available',
        email: newStaff.email,
        phone: newStaff.phone,
        hireDate: new Date().toISOString().split('T')[0],
        performance: 5.0,
        sessionsCompleted: 0,
        lastActive: 'Just now',
        metrics: {
          sessionsCompleted: 0,
          averageRating: 5.0,
          onTimeDelivery: 100,
          customerSatisfaction: 100,
          efficiency: 100,
          attendance: 100
        },
        trends: {
          sessionsCompleted: 0,
          averageRating: 0,
          onTimeDelivery: 0
        },
        achievements: [],
        availability: {
          monday: [{ start: '09:00', end: '17:00', available: true }],
          tuesday: [{ start: '09:00', end: '17:00', available: true }],
          wednesday: [{ start: '09:00', end: '17:00', available: true }],
          thursday: [{ start: '09:00', end: '17:00', available: true }],
          friday: [{ start: '09:00', end: '17:00', available: true }],
          saturday: [{ start: '10:00', end: '18:00', available: true }],
          sunday: [{ start: '10:00', end: '18:00', available: true }]
        },
        maxHoursPerWeek: 40,
        currentHoursThisWeek: 0
      };
      
      setManualStaff([...manualStaff, staff]);
      setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
      setShowAddStaffModal(false);
    }
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setNewStaff({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role
    });
    setShowAddStaffModal(true);
  };

  const handleUpdateStaff = () => {
    if (editingStaff && newStaff.name && newStaff.email && newStaff.phone) {
      setManualStaff(manualStaff.map(staff => 
        staff.id === editingStaff.id 
          ? { ...staff, name: newStaff.name, email: newStaff.email, phone: newStaff.phone, role: newStaff.role }
          : staff
      ));
      setEditingStaff(null);
      setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
      setShowAddStaffModal(false);
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setManualStaff(manualStaff.filter(staff => staff.id !== staffId));
    }
  };

  const handleToggleStatus = (staffId: string) => {
      // Update status in manual staff if it exists there
      setManualStaff(manualStaff.map(staff => 
        staff.id === staffId 
          ? { 
              ...staff, 
              status: staff.status === 'available' ? 'busy' : 
                     staff.status === 'busy' ? 'offline' : 'available'
            }
          : staff
      ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Staff Panel
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Manage staff assignments and performance
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'staff', label: 'Staff Management', icon: <Users className="w-4 h-4" /> },
            { id: 'zones', label: 'Zones', icon: <MapPin className="w-4 h-4" /> },
            { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
            { id: 'communication', label: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors btn-tablet whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="card-tablet">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Staff</h3>
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{allStaffMembers.length}</div>
                <div className="text-sm text-zinc-400">Active team members</div>
              </Card>

              <Card className="card-tablet">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Available</h3>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {allStaffMembers.filter(s => s.status === 'available').length}
                </div>
                <div className="text-sm text-zinc-400">Ready to work</div>
              </Card>

              <Card className="card-tablet">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Avg Performance</h3>
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {allStaffMembers.length > 0
                    ? (allStaffMembers.reduce((sum, s) => sum + s.performance, 0) / allStaffMembers.length).toFixed(1)
                    : '0.0'}
                </div>
                <div className="text-sm text-zinc-400">Out of 5.0</div>
              </Card>
            </div>

            {/* Scan-to-act + ops continuity */}
            {/* H+ Scan-to-act: Direct session jump from floor. Used when staff has session ID from QR, receipt, or table tent. */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="card-tablet lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">Scan-to-act</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">Quick jump</span>
                  </div>
                  <QrCode className="w-6 h-6 text-teal-400" />
                </div>
                <p className="text-sm text-zinc-400 mb-1">
                  Scan a table QR or paste a session ID to jump straight into that session cockpit.
                </p>
                <p className="text-xs text-zinc-500 mb-3">
                  Fastest way to manage a live session from the floor.
                </p>
                <p className="text-xs text-teal-400/80 mb-4">
                  Best for: timer changes, delivery updates, quick notes
                </p>
                <div className="space-y-3">
                  <input
                    value={scanSessionId}
                    onChange={(e) => setScanSessionId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const id = scanSessionId.trim();
                        if (id) window.location.href = `/staff/scan/${encodeURIComponent(id)}`;
                      }
                    }}
                    placeholder="Scan or enter session ID"
                    title="Use this when you already have the session ID from a receipt, table tent, or QR code."
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="btn-pretty-primary btn-tablet flex-1"
                      onClick={() => {
                        const id = scanSessionId.trim();
                        if (!id) return;
                        window.location.href = `/staff/scan/${encodeURIComponent(id)}`;
                      }}
                    >
                      Open cockpit
                    </Button>
                    <Button
                      className="btn-pretty-outline btn-tablet"
                      onClick={() => setScanSessionId('')}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="card-tablet lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent scans</h3>
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                {recentScans.length === 0 ? (
                  <p className="text-sm text-zinc-400">No recent scans yet.</p>
                ) : (
                  <div className="space-y-2">
                    {recentScans.slice(0, 5).map((r) => {
                      const detail = recentScanDetails[r.sessionId];
                      const tableId = detail?.table_id || detail?.tableId || detail?.table_id;
                      const participants = Array.isArray(detail?.participants) ? detail.participants.length : null;
                      return (
                        <div key={r.sessionId} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                          <div className="min-w-0">
                            <div className="text-white font-medium truncate">
                              {tableId ? `Table ${tableId}` : 'Session'} <span className="text-zinc-500">•</span>{' '}
                              <span className="font-mono text-sm text-zinc-300">{r.sessionId.slice(0, 10)}</span>
                            </div>
                            <div className="text-xs text-zinc-500">
                              {new Date(r.ts).toLocaleString()}
                              {participants != null ? ` • ${participants} participant(s)` : ''}
                            </div>
                          </div>
                          <a
                            href={`/staff/scan/${encodeURIComponent(r.sessionId)}`}
                            className="inline-flex items-center gap-2 text-sm text-teal-300 hover:text-teal-200"
                          >
                            Open <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Operational alerts + live sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="card-tablet lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Operational alerts</h3>
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {driftSummary?.count ?? 0}
                </div>
                <div className="text-sm text-zinc-400 mb-3">
                  Multi-active table conflicts (last 24h)
                </div>
                {(driftSummary?.items || []).slice(0, 2).map((it: any) => (
                  <div key={it.id} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 mb-2">
                    <div className="text-sm text-white">
                      {it.tableId ? `Table ${it.tableId}` : 'Table conflict'}
                    </div>
                    <a href={it.resolutionPath || '#'} className="text-xs text-teal-300 hover:text-teal-200">
                      Resolve in POS Ops
                    </a>
                  </div>
                ))}
              </Card>

              <Card className="card-tablet lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Live sessions</h3>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                {sessions.filter((s) => s.status === 'ACTIVE').length === 0 ? (
                  <p className="text-sm text-zinc-400">No ACTIVE sessions right now.</p>
                ) : (
                  <div className="space-y-2">
                    {sessions
                      .filter((s) => s.status === 'ACTIVE')
                      .slice(0, 5)
                      .map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                          <div className="min-w-0">
                            <div className="text-white font-medium truncate">
                              Table {s.tableId} <span className="text-zinc-500">•</span>{' '}
                              <span className="font-mono text-sm text-zinc-300">{s.id.slice(0, 10)}</span>
                            </div>
                            <div className="text-xs text-zinc-500">
                              {new Date(s.createdAt).toLocaleString()}
                              {typeof liveParticipantCounts[s.id] === 'number' ? ` • ${liveParticipantCounts[s.id]} participant(s)` : ''}
                            </div>
                          </div>
                          <a
                            href={`/staff/scan/${encodeURIComponent(s.id)}`}
                            className="inline-flex items-center gap-2 text-sm text-teal-300 hover:text-teal-200"
                          >
                            Open <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>

            {/* QR health */}
            <div className="mb-8">
              <Card className="card-tablet">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">QR lifecycle health</h3>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-sm text-zinc-400">
                  Resolver: <span className={health?.resolver?.ok ? 'text-green-300' : 'text-red-300'}>{health?.resolver?.ok ? 'OK' : 'Fail'}</span>
                  {' • '}
                  Minting: <span className={health?.qrMinting?.ok ? 'text-green-300' : 'text-red-300'}>{health?.qrMinting?.ok ? 'OK' : 'Fail'}</span>
                  {' • '}
                  DB: <span className={health?.db?.ok ? 'text-green-300' : 'text-red-300'}>{health?.db?.ok ? 'OK' : 'Fail'}</span>
                  {health?.qrStorage?.ok && health?.qrStorage?.updatedAt ? (
                    <>
                      {' • '}Last QR pack update: <span className="text-zinc-200">{new Date(health.qrStorage.updatedAt).toLocaleString()}</span>
                    </>
                  ) : null}
                </div>
              </Card>
            </div>

            {/* Coaching Panel - On-demand */}
            <div className="mb-8">
              {!showCoaching ? (
                <Card className="card-tablet">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Micro-Coaching</h3>
                      <p className="text-sm text-zinc-400">Get personalized coaching tips for your role</p>
                    </div>
                    <Button
                      className="btn-pretty-primary btn-tablet"
                      onClick={() => setShowCoaching(true)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      View Coaching Tips
                    </Button>
                  </div>
                </Card>
              ) : (
                <CoachingPanel
                  role={selectedStaffForCoaching ? 
                    (staffMembers.find(s => s.id === selectedStaffForCoaching)?.role === 'BOH' ? 'prep' : 'foh') as 'prep' | 'foh' | 'runner'
                    : 'foh'}
                  staffId={selectedStaffForCoaching || undefined}
                  onDismiss={() => setShowCoaching(false)}
                  showDismiss={true}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Staff Members</h2>
              <Button 
                className="btn-pretty-primary btn-tablet"
                onClick={() => {
                  setEditingStaff(null);
                  setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
                  setShowAddStaffModal(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {allStaffMembers.length === 0 ? (
                <Card className="card-tablet">
                  <div className="text-center py-8 text-zinc-400">
                    <Users className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p>No staff assignments found</p>
                    <p className="text-xs mt-2">Staff will appear here when assigned to sessions</p>
                  </div>
                </Card>
              ) : (
                allStaffMembers.map((staff) => (
                <Card key={staff.id} className="card-tablet">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-white">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{staff.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getRoleColor(staff.role)} text-white flex items-center space-x-1`}>
                            {getRoleIcon(staff.role)}
                            <span>{staff.role}</span>
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(staff.status)}`}></div>
                            <span className="text-sm text-zinc-400 capitalize">{staff.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-zinc-400">Performance</div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">{staff.performance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-zinc-400">Sessions</div>
                        <div className="text-white font-semibold">{staff.sessionsCompleted}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          className="btn-pretty-outline btn-tablet-sm"
                          onClick={() => handleEditStaff(staff)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          className="btn-pretty-outline btn-tablet-sm"
                          onClick={() => handleToggleStatus(staff.id)}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button 
                          className="btn-pretty-outline btn-tablet-sm"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">{staff.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">{staff.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">Last active: {staff.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <StaffPerformanceAnalytics
            staffMembers={allStaffMembers}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}

        {activeTab === 'schedule' && (
          <StaffScheduling
            staffMembers={allStaffMembers}
            onShiftCreate={(shift) => {
              // Handle shift creation
              console.log('Creating shift:', shift);
            }}
            onShiftUpdate={(shiftId, updates) => {
              // Handle shift update
              console.log('Updating shift:', shiftId, updates);
            }}
            onShiftDelete={(shiftId) => {
              // Handle shift deletion
              console.log('Deleting shift:', shiftId);
            }}
          />
        )}

        {activeTab === 'communication' && (
          <StaffCommunication
            currentUserId="staff-shisha-master"
            staffMembers={allStaffMembers.map(staff => ({
              id: staff.id,
              name: staff.name,
              role: staff.role,
              status: staff.status === 'available' ? 'online' : staff.status === 'busy' ? 'busy' : 'offline',
              lastSeen: new Date()
            }))}
            onMessageSend={(message) => {
              // Handle message sending
              console.log('Sending message:', message);
            }}
            onNotificationMarkRead={(notificationId) => {
              // Handle notification read
              console.log('Marking notification as read:', notificationId);
            }}
          />
        )}

        {activeTab === 'permissions' && (
          <RoleBasedPermissions
            currentUserRole="manager"
            onPermissionChange={(userId, permissions) => {
              // Handle permission changes
              console.log('Updating permissions for user:', userId, permissions);
            }}
            onRoleAssign={(userId, roleId) => {
              // Handle role assignment
              console.log('Assigning role to user:', userId, roleId);
            }}
          />
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="modal-tablet w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <Button 
                className="btn-pretty-outline btn-tablet-sm"
                onClick={() => {
                  setShowAddStaffModal(false);
                  setEditingStaff(null);
                  setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter staff name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN' })}
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
                  onClick={editingStaff ? handleUpdateStaff : handleAddStaff}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </Button>
                <Button 
                  className="btn-pretty-outline btn-tablet flex-1"
                  onClick={() => {
                    setShowAddStaffModal(false);
                    setEditingStaff(null);
                    setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
