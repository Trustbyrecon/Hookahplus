"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '../../components';
import CreateSessionModal from '../../components/CreateSessionModal';
import SessionActionButtons from '../../components/SessionActionButtons';
import SessionNotesModal from '../../components/SessionNotesModal';
import { BOHActions, FOHActions, ManagerActions } from '../../components/SessionActions';
import GlobalNavigation from '../../components/GlobalNavigation';
import { FOHBOHToggle } from '../../components/FOHBOHToggle';
import { FlagManager } from '../../components/FlagManager';
import { SessionFilters, FilterOptions } from '../../components/SessionFilters';
import { SessionNotes as SessionNotesComponent, SessionNote } from '../../components/SessionNotes';
import { RoleBasedActions, RoleSelector } from '../../components/RoleBasedActions';
import { ResolutionNotes } from '../../components/ResolutionNotes';
import { SessionQueueManager } from '../../components/SessionQueueManager';
import { SessionMonitor } from '../../components/SessionMonitor';
import { StaffWorkflowAssistant } from '../../components/StaffWorkflowAssistant';
import { OptimizedSessionCard } from '../../components/OptimizedSessionCard';
import DollarTestButton from '../../components/DollarTestButton';
import { 
  Flame, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  ChefHat,
  UserCheck,
  AlertTriangle,
  Crown,
  Folder,
  FileText,
  RefreshCw,
  CheckCircle,
  Flag,
  Pause,
  Zap,
  Trash2,
  Edit3,
  Menu,
  X,
  DollarSign,
  Activity,
  TrendingDown,
  Star,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock3,
  User,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap as Lightning,
  Heart,
  Coffee,
  Wind,
  Sparkles,
  Brain,
  Lock,
  CreditCard,
  Smartphone,
  QrCode,
  Play,
  Save,
  Eye,
  EyeOff,
  ShoppingCart,
  Star as StarIcon,
  MessageSquare
} from 'lucide-react';
import { Session, SessionStatus, SessionTeam, SessionNotes } from '../../types/session';

export default function FireSessionDashboard() {
  const [isPrettyTheme, setIsPrettyTheme] = useState(false);

  useEffect(() => {
    // Always enable pretty theme for development and production
    setIsPrettyTheme(true);
    
    // Debug: Log theme status
    console.log('Pretty theme enabled: true');
    console.log('Hostname:', window.location.hostname);
  }, []);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', showCreateModal);
  }, [showCreateModal]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [sessionFlags, setSessionFlags] = useState<any[]>([]);
  const [userRoles] = useState<string[]>(['BOH', 'FOH', 'MANAGER', 'ADMIN']); // Mock user roles
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'>('MANAGER');
  
  // Role-based view determination
  const getViewFromRole = (role: string) => {
    switch (role) {
      case 'BOH': return 'BOH';
      case 'FOH': return 'FOH';
      case 'MANAGER': return 'FOH'; // Manager sees FOH view by default
      case 'ADMIN': return 'FOH'; // Admin sees FOH view by default
      default: return 'FOH';
    }
  };
  
  const [selectedRole, setSelectedRole] = useState<'FOH' | 'BOH'>(getViewFromRole('MANAGER'));
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: [],
    staff: [],
    timeRange: 'all',
    severity: []
  });
  
  // Advanced management features
  const [showAdvancedManagement, setShowAdvancedManagement] = useState(false);
  const [managementView, setManagementView] = useState<'queue' | 'monitor' | 'workflow'>('queue');
  const [staffMembers] = useState([
    { id: 'boh-1', name: 'Mike Rodriguez', role: 'BOH', status: 'available' },
    { id: 'boh-2', name: 'Sarah Chen', role: 'BOH', status: 'busy' },
    { id: 'foh-1', name: 'John Smith', role: 'FOH', status: 'available' },
    { id: 'foh-2', name: 'Emily Davis', role: 'FOH', status: 'busy' },
    { id: 'manager-1', name: 'Alex Johnson', role: 'MANAGER', status: 'available' }
  ]);

  // Load sessions from API
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sessions');
      const data = await response.json();
      
      if (data.ok && data.sessions) {
        setSessions(data.sessions);
        setTotalSessions(data.sessions.length);
        setActiveSessions(data.sessions.filter((s: Session) => s.state === 'ACTIVE').length);
        console.log('✅ Loaded sessions from API:', data.sessions.length);
      } else {
        console.error('❌ Failed to load sessions:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Mock session notes
  useEffect(() => {
    const mockNotes: SessionNote[] = [
      {
        id: 'note_1',
        sessionId: 'session_T-007_1758552685415',
        content: 'Customer requested extra mint in the mix',
        author: 'Mike Rodriguez',
        createdAt: new Date(),
        type: 'customer'
      },
      {
        id: 'note_2',
        sessionId: 'session_T-011_1758552685417',
        content: 'Equipment issue: Hookah base cracked during setup. Need replacement.',
        author: 'Sarah Chen',
        createdAt: new Date(),
        type: 'equipment'
      }
    ];
    setSessionNotes(mockNotes);
  }, []);

  const metrics = [
    {
      title: 'Active Sessions',
      value: sessions.filter(s => ['ACTIVE', 'PAUSED'].includes(s.state)).length.toString(),
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Revenue',
      value: `$${(sessions.reduce((sum, s) => sum + s.priceCents, 0) / 100).toFixed(0)}`,
      icon: <DollarSign className="w-6 h-6 text-green-400" />,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Duration',
      value: '45min',
      icon: <Clock className="w-6 h-6 text-blue-400" />,
      change: '-5%',
      changeType: 'negative' as const
    },
    {
      title: 'Alerts',
      value: sessions.filter(s => s.edgeCase).length.toString(),
      icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
      change: '0%',
      changeType: 'neutral' as const
    },
    {
      title: 'Staff Assigned',
      value: '2',
      icon: <Users className="w-6 h-6 text-purple-400" />,
      change: '+2%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Sessions',
      value: sessions.length.toString(),
      icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
      change: '+15%',
      changeType: 'positive' as const
    }
  ];

  const tabs = [
    { id: 'overview', label: `Overview (${sessions.length})`, count: sessions.length },
    { id: 'boh', label: `BOH (${sessions.filter(s => ['NEW', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY'].includes(s.state)).length})`, count: sessions.filter(s => ['NEW', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY'].includes(s.state)).length },
    { id: 'foh', label: `FOH (${sessions.filter(s => ['OUT_FOR_DELIVERY', 'ACTIVE', 'PAUSED'].includes(s.state)).length})`, count: sessions.filter(s => ['OUT_FOR_DELIVERY', 'ACTIVE', 'PAUSED'].includes(s.state)).length },
    { id: 'edge', label: `Edge Cases (${sessions.filter(s => s.edgeCase).length})`, count: sessions.filter(s => s.edgeCase).length }
  ];

  const handleCreateSession = async (sessionData: any) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      
      const data = await response.json();
      
      if (data.ok && data.session) {
        console.log('✅ Session created:', data.session);
        // Reload sessions to get updated list
        await loadSessions();
      } else {
        console.error('❌ Failed to create session:', data.error);
        alert(`Error creating session: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error creating session:', error);
      alert('Failed to create session');
    }
  };

  const handleStatusChange = (sessionId: string, newStatus: SessionStatus) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, state: newStatus, updatedAt: new Date() }
        : session
    ));
  };

  const handleStateChange = async () => {
    // Reload sessions when state changes
    console.log('🔄 Session state changed, reloading...');
    await loadSessions();
  };

  const handleAction = (actionId: string, sessionId: string) => {
    console.log(`Action ${actionId} triggered for session ${sessionId}`);
    // Handle specific actions here
  };

  const handleAddNote = (note: SessionNote) => {
    setSessionNotes(prev => [note, ...prev]);
  };

  const handleUpdateNote = (noteId: string, updates: Partial<SessionNote>) => {
    setSessionNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  };

  const handleDeleteNote = (noteId: string) => {
    setSessionNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    // In a real app, this would filter the sessions
    console.log('Filters changed:', newFilters);
  };
  
  const handleRoleChange = (newRole: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN') => {
    setUserRole(newRole);
    setSelectedRole(getViewFromRole(newRole));
  };

  const handleViewDetails = (sessionId: string) => {
    console.log(`View details for session ${sessionId}`);
  };

  const handleEditSession = (sessionId: string) => {
    console.log(`Edit session ${sessionId}`);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const getStatusBadge = (status: string, statusColor: string, statusIcon: string) => {
  return (
              <div className="flex items-center space-x-2">
        <span className="text-lg">{statusIcon}</span>
        <Badge className={`${statusColor} text-white text-sm font-bold px-3 py-1`}>
          {status.replace(/_/g, ' ')}
        </Badge>
                </div>
    );
  };

  // Bulk action handlers
  const handleBulkAction = async (action: string, sessionIds: string[]) => {
    try {
      const promises = sessionIds.map(sessionId => {
        let transition = '';
        switch (action) {
          case 'start_prep': transition = 'START_PREP'; break;
          case 'mark_ready': transition = 'MARK_READY'; break;
          case 'take_delivery': transition = 'TAKE_DELIVERY'; break;
          case 'start_active': transition = 'START_ACTIVE'; break;
          case 'pause': transition = 'PAUSE'; break;
          case 'resume': transition = 'RESUME'; break;
          case 'complete': transition = 'COMPLETE'; break;
          case 'cancel': transition = 'CANCEL'; break;
          default: return Promise.resolve();
        }
        
        return fetch(`/api/sessions/${sessionId}/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transition, note: `Bulk action: ${action}` })
        });
      });
      
      await Promise.all(promises);
      await loadSessions(); // Reload sessions
      console.log(`✅ Bulk action '${action}' completed for ${sessionIds.length} sessions`);
    } catch (error) {
      console.error('❌ Error in bulk action:', error);
    }
  };

  const handleAssignStaff = async (sessionId: string, staffId: string, role: 'BOH' | 'FOH') => {
    try {
      const updates = role === 'BOH' 
        ? { assignedBOHId: staffId }
        : { assignedFOHId: staffId };
      
      // Update session with staff assignment
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      ));
      
      console.log(`✅ Assigned ${role} staff ${staffId} to session ${sessionId}`);
    } catch (error) {
      console.error('❌ Error assigning staff:', error);
    }
  };

  const filteredSessions = sessions.filter(session => {
    // First filter by active tab
    let tabMatch = true;
    switch (activeTab) {
      case 'boh': tabMatch = session.state === 'NEW' || session.state === 'PREP_IN_PROGRESS' || session.state === 'READY_FOR_DELIVERY'; break;
      case 'foh': tabMatch = session.state === 'OUT_FOR_DELIVERY' || session.state === 'ACTIVE' || session.state === 'PAUSED'; break;
      case 'edge': tabMatch = session.edgeCase !== undefined; break;
      default: tabMatch = true;
    }
    
    // Then filter by user role
    let roleMatch = true;
    switch (userRole) {
      case 'BOH': roleMatch = session.team === 'BOH' || session.state === 'NEW' || session.state === 'PREP_IN_PROGRESS' || session.state === 'READY_FOR_DELIVERY'; break;
      case 'FOH': roleMatch = session.team === 'FOH' || session.state === 'OUT_FOR_DELIVERY' || session.state === 'ACTIVE' || session.state === 'PAUSED'; break;
      case 'MANAGER': roleMatch = true; break; // Managers see all sessions
      case 'ADMIN': roleMatch = true; break; // Admins see all sessions
      default: roleMatch = true;
    }
    
    return tabMatch && roleMatch;
  });

  if (!isPrettyTheme) {
    // Fallback to original solid design
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Fire Session Dashboard</h1>
            <p className="text-zinc-400 mb-8">Manage your hookah sessions</p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => {
                  console.log('Create New Session button clicked!');
                  setShowCreateModal(true);
                }}
                variant="primary" 
                size="lg"
              >
                Create New Session
              </Button>
              
              {/* Test button */}
              <button 
                onClick={() => {
                  console.log('Test button clicked!');
                  setShowCreateModal(true);
                }}
                className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Test Button
              </button>
            </div>
          </div>
        </div>
            </div>
    );
  }

  // Pretty Theme Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Global Navigation */}
      <GlobalNavigation />
      {/* Header */}
      <div className="status-bar">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-zinc-400">
                Session Management
                </div>
              </div>
              
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-zinc-400">Live</span>
              </div>
              <div className="text-sm text-zinc-400">
                Total Sessions: {totalSessions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
            <Flame className="w-8 h-8 text-orange-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Fire Session Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* $1 Smoke Test Button */}
              <DollarTestButton />
              
              {/* View is now determined by role - no toggle needed */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-zinc-800 rounded-lg">
                <span className="text-sm text-zinc-400">View:</span>
                <span className="text-sm font-medium text-white">{selectedRole}</span>
                <span className="text-xs text-zinc-500">({userRole})</span>
              </div>
              <Link href="/">
                <Button className="btn-pretty-secondary">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/preorder/T-001">
                <Button className="btn-pretty-secondary">
                  <QrCode className="w-4 h-4 mr-2" />
                  Pre-Order
                </Button>
              </Link>
              <Link href="/fire-session-dashboard">
                <Button className="btn-pretty-primary">
                  <Flame className="w-4 h-4 mr-2" />
                  Fire Sessions
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-xl text-zinc-400">
            Complete BOH/FOH workflow management with production-ready buttons
          </p>
        </div>

        {/* Role Selector and Filters */}
        <div className="mb-6 space-y-4">
          <RoleSelector 
            currentRole={userRole} 
            onRoleChange={handleRoleChange} 
          />
          <SessionFilters 
            onFiltersChange={handleFiltersChange}
            availableStaff={['BOH Staff 1', 'BOH Staff 2', 'FOH Staff 1', 'FOH Staff 2', 'Manager']}
          />
          
          {/* Advanced Management Toggle */}
          <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">Advanced Management</h3>
              <span className="text-sm text-zinc-400">
                {sessions.length >= 10 ? 'Recommended for 10+ sessions' : 'Available for all session counts'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={showAdvancedManagement ? 'primary' : 'outline'}
                onClick={() => setShowAdvancedManagement(!showAdvancedManagement)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                {showAdvancedManagement ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
                <div className="text-zinc-400">
                {metric.icon}
              </div>
              </div>
              <div className="text-sm text-zinc-400 mb-1">{metric.title}</div>
              <div className={`text-xs font-medium ${
                metric.changeType === 'positive' ? 'text-green-400' :
                metric.changeType === 'negative' ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-4 bg-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-400">
            <strong>Debug Info:</strong> Pretty Theme: {isPrettyTheme ? '✅ Enabled' : '❌ Disabled'} | 
            Sessions Loaded: {sessions.length} | 
            Loading: {loading ? '🔄' : '✅'} | 
            API Status: Connected
          </div>
        </div>

        {/* Advanced Management Components */}
        {showAdvancedManagement && (
          <div className="space-y-6 mb-8">
            {/* Management View Toggle */}
            <div className="flex items-center justify-center space-x-2 bg-zinc-800/50 rounded-lg p-2 border border-zinc-700">
              {[
                { id: 'queue', label: 'Queue Manager', icon: <Users className="w-4 h-4" /> },
                { id: 'monitor', label: 'Live Monitor', icon: <Activity className="w-4 h-4" /> },
                { id: 'workflow', label: 'Workflow Assistant', icon: <Zap className="w-4 h-4" /> }
              ].map(view => (
                <Button
                  key={view.id}
                  size="sm"
                  variant={managementView === view.id ? 'primary' : 'outline'}
                  onClick={() => setManagementView(view.id as any)}
                  className="flex-1"
                >
                  {view.icon}
                  {view.label}
                </Button>
          ))}
        </div>

            {/* Management Components */}
            {managementView === 'queue' && (
              <SessionQueueManager
                sessions={sessions}
                userRole={userRole}
                onBulkAction={handleBulkAction}
              />
            )}
            
            {managementView === 'monitor' && (
              <SessionMonitor
                sessions={sessions}
                userRole={userRole}
                onRefresh={loadSessions}
              />
            )}
            
            {managementView === 'workflow' && (
              <StaffWorkflowAssistant
                sessions={sessions}
                userRole={userRole}
                staffMembers={staffMembers}
                onAssignStaff={handleAssignStaff}
                onBulkAction={handleBulkAction}
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => {
                console.log('Create Session button clicked');
                setShowCreateModal(true);
              }}
              className="btn-pretty-primary text-lg px-8 py-4"
              disabled={loading}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Session
            </Button>
            <Button 
              onClick={loadSessions}
              className="btn-pretty-secondary"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button className="btn-pretty-secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="btn-pretty-secondary">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {loading && sessions.length === 0 && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-400" />
              <p className="text-zinc-400">Loading sessions...</p>
          </div>
          )}
          
          {!loading && filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <Flame className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400">No sessions found for this filter</p>
                </div>
          )}
          
          {filteredSessions.map((session, index) => (
            <OptimizedSessionCard
              key={session.id}
              session={session}
              userRole={userRole}
              sessionNotes={sessionNotes}
              sessionFlags={sessionFlags}
              onStateChange={handleStateChange}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onFlagIssue={(type, severity, description) => {
                const newFlag = {
                  id: `flag_${Date.now()}`,
                  sessionId: session.id,
                  type,
                  severity,
                  description,
                  reportedBy: userRole,
                  status: 'open',
                  createdAt: new Date()
                };
                setSessionFlags(prev => [...prev, newFlag]);
              }}
              onResolveFlag={(flagId, resolution, customerCompensation) => {
                const resolvedFlag = {
                  ...sessionFlags.find(f => f.id === flagId)!,
                  status: 'resolved',
                  resolution,
                  resolvedAt: new Date(),
                  customerCompensation
                };
                setSessionFlags(prev => prev.map(f => f.id === flagId ? resolvedFlag : f));
              }}
            />
          ))}
                </div>
              </div>

      {/* Modals */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSession={handleCreateSession}
      />

    </div>
  );
}
