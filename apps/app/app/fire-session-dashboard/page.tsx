"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '../../components';
import CreateSessionModal from '../../components/CreateSessionModal';
import SessionActionButtons from '../../components/SessionActionButtons';
import SessionNotesModal from '../../components/SessionNotesModal';
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
    // Check for pretty theme on client side
    setIsPrettyTheme(process.env.NEXT_PUBLIC_PRETTY_THEME === '1' || window.location.hostname.includes('vercel.app'));
    
    // Debug: Log theme status
    console.log('Pretty theme enabled:', process.env.NEXT_PUBLIC_PRETTY_THEME === '1' || window.location.hostname.includes('vercel.app'));
    console.log('Hostname:', window.location.hostname);
  }, []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNotes[]>([]);

  // Initialize with mock data
  useEffect(() => {
    const mockSessions: Session[] = [
      {
        id: 'session_T-007_1758552685415',
        tableId: 'T-007',
        customerName: '15551234556',
        customerPhone: '+1 (555) 123-4556',
        sessionType: 'walk-in',
        flavor: 'Watermelon + Mint',
        amount: 35.00,
        status: 'PREP_IN_PROGRESS',
        statusColor: 'bg-green-500',
        statusIcon: '🔄',
        assignedBOH: 'Mike Rodriguez',
        assignedFOH: 'John Smith',
        notes: 'Source: WALK IN, External Ref: T-007',
        created: '1:39:07 PM',
        team: 'BOH',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'session_T-008_1758552685416',
        tableId: 'T-008',
        customerName: '15551234557',
        customerPhone: '+1 (555) 123-4557',
        sessionType: 'reservation',
        flavor: 'Blue Mist',
        amount: 30.00,
        status: 'HEAT_UP',
        statusColor: 'bg-orange-500',
        statusIcon: '🔥',
        assignedBOH: 'Mike Rodriguez',
        assignedFOH: 'Emily Davis',
        notes: 'Source: RESERVE, External Ref: T-008',
        created: '1:34:07 PM',
        team: 'BOH',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'session_T-011_1758552685417',
        tableId: 'T-011',
        customerName: '15551234560',
        customerPhone: '+1 (555) 123-4560',
        sessionType: 'vip',
        flavor: 'Custom Mix',
        amount: 45.00,
        status: 'STAFF_HOLD',
        statusColor: 'bg-yellow-500',
        statusIcon: '⚠️',
        assignedBOH: 'Sarah Chen',
        assignedFOH: 'David Wilson',
        notes: 'Source: WALK IN, External Ref: T-011. Edge Case: Equipment malfunction - hookah base cracked',
        created: '1:19:07 PM',
        team: 'EDGE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setSessions(mockSessions);
  }, []);

  // Mock session notes
  useEffect(() => {
    const mockNotes: SessionNotes[] = [
      {
        id: 'note_1',
        sessionId: 'session_T-007_1758552685415',
        note: 'Customer requested extra mint in the mix',
        author: 'Mike Rodriguez',
        timestamp: new Date(),
        type: 'customer_request'
      },
      {
        id: 'note_2',
        sessionId: 'session_T-011_1758552685417',
        note: 'Equipment issue: Hookah base cracked during setup. Need replacement.',
        author: 'Sarah Chen',
        timestamp: new Date(),
        type: 'issue'
      }
    ];
    setSessionNotes(mockNotes);
  }, []);

  const metrics = [
    {
      title: 'Active Sessions',
      value: '3',
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Revenue',
      value: '$110',
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
      value: '1',
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
      value: '7',
      icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
      change: '+15%',
      changeType: 'positive' as const
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview (7)', count: 7 },
    { id: 'boh', label: 'BOH (3)', count: 3 },
    { id: 'foh', label: 'FOH (0)', count: 0 },
    { id: 'edge', label: 'Edge Cases (1)', count: 1 }
  ];

  const handleCreateSession = (sessionData: any) => {
    const newSession: Session = {
      id: `session_${sessionData.tableId}_${Date.now()}`,
      tableId: sessionData.tableId,
      customerName: sessionData.customerName,
      customerPhone: sessionData.customerPhone,
      sessionType: sessionData.sessionType,
      flavor: sessionData.flavor,
      amount: sessionData.amount,
      status: 'CREATED',
      statusColor: 'bg-blue-500',
      statusIcon: '🆕',
      assignedBOH: sessionData.bohStaff,
      assignedFOH: sessionData.fohStaff,
      notes: sessionData.notes,
      created: new Date().toLocaleTimeString(),
      team: 'BOH',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const handleStatusChange = (sessionId: string, newStatus: SessionStatus) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: newStatus, updatedAt: new Date() }
        : session
    ));
  };

  const handleAction = (actionId: string, sessionId: string) => {
    console.log(`Action ${actionId} triggered for session ${sessionId}`);
    // Handle specific actions here
  };

  const handleAddNote = (sessionId: string, note: string, type: SessionNotes['type']) => {
    const newNote: SessionNotes = {
      id: `note_${Date.now()}`,
      sessionId,
      note,
      author: 'Current User',
      timestamp: new Date(),
      type
    };
    setSessionNotes(prev => [newNote, ...prev]);
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

  const filteredSessions = sessions.filter(session => {
    switch (activeTab) {
      case 'boh': return session.team === 'BOH';
      case 'foh': return session.team === 'FOH';
      case 'edge': return session.team === 'EDGE';
      default: return true;
    }
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
                onClick={() => setShowCreateModal(true)}
                variant="primary" 
                size="lg"
              >
                Create New Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pretty Theme Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="status-bar">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H+</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  HOOKAH+
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                Fire Session Dashboard
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-zinc-400">Live</span>
              </div>
              <div className="text-sm text-zinc-400">
                Total Sessions: {sessions.length}
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
              <Link href="/test-session">
                <Button className="btn-pretty-secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Test Page
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-xl text-zinc-400">
            Complete BOH/FOH workflow management with edge case handling
          </p>
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
            Modal State: {showCreateModal ? '✅ Open' : '❌ Closed'} | 
            Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => {
                console.log('Create Session button clicked, showCreateModal:', showCreateModal);
                setShowCreateModal(true);
              }}
              className="btn-pretty-primary text-lg px-8 py-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              NEW Create Session
            </Button>
            <Button 
              onClick={() => {
                console.log('Debug modal clicked, showCreateModal:', showCreateModal);
                setShowCreateModal(true);
                // Force a re-render
                setTimeout(() => {
                  console.log('Modal state after timeout:', showCreateModal);
                }, 100);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              🔧 Debug Modal
            </Button>
            <Button className="btn-pretty-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
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
          {filteredSessions.map((session, index) => (
            <div key={session.id} className="session-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">
                    {session.team === 'BOH' ? '👨‍🍳' : session.team === 'FOH' ? '🚚' : '⚠️'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-400">
                      Table {session.tableId}
                    </h3>
                    <p className="text-zinc-400">{session.customerName} - {session.flavor}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-zinc-700 rounded-full text-zinc-300">
                        {session.team}
                      </span>
                      <span className="text-xs text-zinc-500">{session.created}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(session.status, session.statusColor, session.statusIcon)}
                  <div className="text-lg font-semibold text-white mt-1">
                    ${session.amount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Assigned BOH:</label>
                  <div className="text-sm text-zinc-300">{session.assignedBOH}</div>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Assigned FOH:</label>
                  <div className="text-sm text-zinc-300">{session.assignedFOH}</div>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Notes:</label>
                  <div className="text-sm text-zinc-300">{session.notes}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <SessionActionButtons
                session={session}
                onAction={handleAction}
                onStatusChange={handleStatusChange}
                onAddNote={(sessionId) => {
                  setSelectedSessionId(sessionId);
                  setShowNotesModal(true);
                }}
                onViewDetails={handleViewDetails}
                onEditSession={handleEditSession}
                onDeleteSession={handleDeleteSession}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSession={handleCreateSession}
      />

      <SessionNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        sessionId={selectedSessionId || ''}
        sessionNotes={sessionNotes.filter(note => note.sessionId === selectedSessionId)}
        onAddNote={handleAddNote}
      />
    </div>
  );
}