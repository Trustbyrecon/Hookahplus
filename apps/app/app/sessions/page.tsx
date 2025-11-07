"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  MessageSquare,
  Timer,
  BarChart2,
  PieChart,
  LineChart
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import Breadcrumbs from '../../components/Breadcrumbs';
import PageHero from '../../components/PageHero';
import { Card, Button, Badge } from '../../components';
import { Session, SessionStatus, SessionTeam, SessionNotes } from '../../types/session';
import { SessionQueueManager } from '../../components/SessionQueueManager';
import { SessionMonitor } from '../../components/SessionMonitor';
import { StaffWorkflowAssistant } from '../../components/StaffWorkflowAssistant';
import { FOHTimerInterface } from '../../components/FOHTimerInterface';
import { ManagerTimerDashboard } from '../../components/ManagerTimerDashboard';
import SimpleFSDDesign from '../../components/SimpleFSDDesign';

export default function SessionsPage() {
  return (
    <SessionProvider>
      <SessionsPageContent />
    </SessionProvider>
  );
}

function SessionsPageContent() {
  const [activeView, setActiveView] = useState('overview');
  const [managementView, setManagementView] = useState('queue');
  const [showAdvancedManagement, setShowAdvancedManagement] = useState(false);
  const { sessions: contextSessions, loading: contextLoading, lastUpdated, refreshSessions } = useSessionContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNotes[]>([]);
  const [sessionFlags, setSessionFlags] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'>('MANAGER');
  const [loading, setLoading] = useState(false);

  // Sync with context sessions
  useEffect(() => {
    if (contextSessions.length > 0) {
      // Convert FireSession to Session format if needed
      setSessions(contextSessions as any);
    }
  }, [contextSessions]);

  const views = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'queue', label: 'Queue Manager', icon: <Users className="w-4 h-4" /> },
    { id: 'monitor', label: 'Live Monitor', icon: <Activity className="w-4 h-4" /> },
    { id: 'workflow', label: 'Workflow Assistant', icon: <Zap className="w-4 h-4" /> },
    { id: 'timers', label: 'Timer Management', icon: <Timer className="w-4 h-4" /> },
    { id: 'performance', label: 'Staff Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'all-timers', label: 'All Timer Sessions', icon: <Clock className="w-4 h-4" /> }
  ];

  // Mock data
  useEffect(() => {
    const mockSessions: Session[] = [
      {
        id: 'session_1',
        tableId: 'T-01',
        customerRef: 'John Doe',
        flavor: 'Double Apple',
        priceCents: 2500,
        state: 'ACTIVE',
        assignedBOHId: 'boh_1',
        assignedFOHId: 'foh_1',
        startedAt: new Date(Date.now() - 30 * 60 * 1000),
        durationSecs: 3600,
        paymentIntent: 'pi_test_123',
        paymentStatus: 'succeeded',
        createdAt: new Date(Date.now() - 35 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000),
        timerDuration: 60,
        timerStartedAt: new Date(Date.now() - 30 * 60 * 1000),
        timerStatus: 'running'
      },
      {
        id: 'session_2',
        tableId: 'T-02',
        customerRef: 'Jane Smith',
        flavor: 'Mint',
        priceCents: 2000,
        state: 'PAUSED',
        assignedBOHId: 'boh_2',
        assignedFOHId: 'foh_2',
        startedAt: new Date(Date.now() - 45 * 60 * 1000),
        durationSecs: 3600,
        paymentIntent: 'pi_test_456',
        paymentStatus: 'succeeded',
        createdAt: new Date(Date.now() - 50 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000),
        timerDuration: 45,
        timerStartedAt: new Date(Date.now() - 45 * 60 * 1000),
        timerPausedAt: new Date(Date.now() - 10 * 60 * 1000),
        timerStatus: 'paused'
      },
      {
        id: 'session_3',
        tableId: 'T-03',
        customerRef: 'Mike Johnson',
        flavor: 'Grape',
        priceCents: 3000,
        state: 'NEW',
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000),
        timerDuration: 90
      }
    ];
    setSessions(mockSessions);
  }, []);

  const staffMembers = [
    { id: 'boh_1', name: 'Alex Chen', role: 'BOH', status: 'active' },
    { id: 'boh_2', name: 'Sarah Wilson', role: 'BOH', status: 'active' },
    { id: 'foh_1', name: 'David Rodriguez', role: 'FOH', status: 'active' },
    { id: 'foh_2', name: 'Emma Thompson', role: 'FOH', status: 'active' }
  ];

  const handleStateChange = (sessionId: string, newState: SessionStatus, note?: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            state: newState,
            updatedAt: new Date(),
            ...(newState === 'ACTIVE' && !session.startedAt && { startedAt: new Date() }),
            ...(newState === 'COMPLETED' && { endedAt: new Date() })
          }
        : session
    ));
  };

  const handleAssignStaff = (sessionId: string, staffId: string, role: 'BOH' | 'FOH') => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            [`assigned${role}Id`]: staffId,
            updatedAt: new Date()
          }
        : session
    ));
  };

  const handleBulkAction = (action: string, sessionIds: string[]) => {
    console.log(`Bulk action ${action} on sessions:`, sessionIds);
    // Implement bulk actions
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active Sessions</p>
              <p className="text-2xl font-bold text-white">
                {sessions.filter(s => s.state === 'ACTIVE').length}
              </p>
            </div>
            <Flame className="w-8 h-8 text-orange-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Sessions</p>
              <p className="text-2xl font-bold text-white">{sessions.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Staff On Duty</p>
              <p className="text-2xl font-bold text-white">{staffMembers.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Avg. Duration</p>
              <p className="text-2xl font-bold text-white">
                {Math.round(sessions.reduce((sum, s) => sum + (s.durationSecs || 0), 0) / sessions.length / 60)}m
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
        <div className="space-y-4">
          {sessions.slice(0, 5).map(session => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">{session.tableId}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{session.customerRef}</h4>
                  <p className="text-sm text-zinc-400">{session.flavor} • ${(session.priceCents / 100).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={
                  session.state === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                  session.state === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                  session.state === 'NEW' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }>
                  {session.state}
                </Badge>
                {session.timerStatus && (
                  <Badge className="bg-teal-500/20 text-teal-400">
                    Timer: {session.timerStatus}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return renderOverview();
      case 'queue': return (
        <SessionQueueManager
          sessions={sessions}
          userRole={userRole}
          onBulkAction={handleBulkAction}
        />
      );
      case 'monitor': return (
        <SessionMonitor
          sessions={sessions}
          userRole={userRole}
          onRefresh={() => console.log('Refreshing sessions')}
        />
      );
      case 'workflow': return (
        <StaffWorkflowAssistant
          sessions={sessions}
          userRole={userRole}
          staffMembers={staffMembers}
          onAssignStaff={handleAssignStaff}
          onBulkAction={handleBulkAction}
        />
      );
      case 'timers': return (
        <div className="space-y-6">
          {userRole === 'FOH' && (
            <FOHTimerInterface
              assignedSessions={sessions.filter(s => s.assignedFOHId)}
              onTimerAction={(sessionId, action) => {
                console.log(`Timer action ${action} for session ${sessionId}`);
              }}
              onSessionComplete={(sessionId) => {
                handleStateChange(sessionId, 'COMPLETED', 'Timer completed');
              }}
            />
          )}
          {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">🚀 APP BUILD Enhanced Sessions Dashboard v2.0</h2>
                <p className="text-zinc-400">ROUTE: /sessions (APP BUILD) - Enhanced card-based session management</p>
              </div>
              <SimpleFSDDesign
                sessions={sessions}
                userRole={userRole}
                onSessionAction={(action, sessionId) => {
                  console.log(`Session action: ${action} on ${sessionId}`);
                  if (action === 'complete') {
                    handleStateChange(sessionId, 'COMPLETED', 'Session completed');
                  } else if (action === 'pause') {
                    handleStateChange(sessionId, 'PAUSED', 'Session paused');
                  }
                }}
                className="w-full"
              />
            </div>
          )}
        </div>
      );
      case 'performance': return (
        <div className="text-center py-12 text-zinc-400">
          <BarChart2 className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Staff Performance Analytics</h3>
          <p>Detailed performance metrics and analytics coming soon</p>
        </div>
      );
      case 'all-timers': return (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">All Timer Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.filter(s => s.timerDuration).map(session => (
                <div key={session.id} className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Table {session.tableId}</h4>
                    <Badge className={
                      session.timerStatus === 'running' ? 'bg-green-500/20 text-green-400' :
                      session.timerStatus === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }>
                      {session.timerStatus || 'stopped'}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">{session.customerRef}</p>
                  <p className="text-sm text-zinc-300">Duration: {session.timerDuration} minutes</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs className="mb-6" />
        
        <PageHero
          headline="Sessions Management"
          subheadline="Advanced session management, monitoring, and workflow optimization. View session history, manage queues, and optimize staff workflows."
          benefit={{
            value: `${sessions.length} Active Sessions`,
            description: 'Monitor and manage all lounge sessions',
            icon: <Flame className="w-5 h-5 text-orange-400" />
          }}
          primaryCTA={{
            text: 'View Fire Dashboard',
            href: '/fire-session-dashboard'
          }}
          secondaryCTA={{
            text: 'View Analytics',
            href: '/analytics'
          }}
          trustIndicators={[
            { icon: <Activity className="w-4 h-4" />, text: 'Real-time monitoring' },
            { icon: <Users className="w-4 h-4" />, text: 'Multi-role support' }
          ]}
        />

        {/* Sync Indicator */}
        <div className="mb-6">
          <SyncIndicator
            lastUpdated={lastUpdated}
            isLoading={contextLoading || loading}
            autoRefreshInterval={30}
          />
        </div>

        {/* View Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeView === view.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {view.icon}
              <span>{view.label}</span>
            </button>
          ))}
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-zinc-400">Current Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="BOH">BOH (Back of House)</option>
              <option value="FOH">FOH (Front of House)</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Related Features */}
        <div className="mt-16 border-t border-zinc-800 pt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Related Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/fire-session-dashboard"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-white">Fire Session Dashboard</span>
              </div>
              <p className="text-sm text-zinc-400">Live session management with real-time updates</p>
            </Link>
            <Link
              href="/analytics"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Analytics</span>
              </div>
              <p className="text-sm text-zinc-400">View detailed analytics and reports</p>
            </Link>
            <Link
              href="/staff-ops"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">Staff Operations</span>
              </div>
              <p className="text-sm text-zinc-400">Daily operations and staff management</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}