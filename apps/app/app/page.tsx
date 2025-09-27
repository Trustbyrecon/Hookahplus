"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components';
import { ErrorBoundary, ErrorMessage } from '../components/ErrorBoundary';
import { 
  MetricCardSkeleton, 
  SessionCardSkeleton, 
  TabSkeleton, 
  FlowOverviewSkeleton 
} from '../components/LoadingSkeleton';
import { 
  ToastContainer, 
  PulseDot, 
  ProgressBar, 
  StatusIndicator as MicroStatusIndicator,
  FloatingActionButton,
  ConfirmationModal
} from '../components/MicroInteractions';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useResponsive } from '../hooks/useResponsive';
import { useAccessibility, useAnnouncement } from '../hooks/useAccessibility';
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
  Sparkles
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function FireSessionDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newSession, setNewSession] = useState({
    tableId: 'T-001',
    customerName: '',
    flavor: 'Blue Mist',
    amount: 3000
  });

  const {
    sessions,
    metrics,
    isLoading,
    error,
    lastUpdated,
    createSession,
    updateSession,
    fetchData
  } = useRealtimeData();

  const {
    isMobile,
    isTablet,
    isDesktop,
    getGridCols,
    getCardPadding,
    getTextSize
  } = useResponsive();

  const { getFocusClasses, getAriaLabel } = useAccessibility();
  const { announcement, announce } = useAnnouncement();

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    announce(message);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const tabs = [
    { id: 'overview', label: `Overview (${metrics.totalSessions})`, icon: <BarChart3 className="w-4 h-4" />, count: metrics.totalSessions },
    { id: 'boh', label: `BOH (${metrics.bohActive})`, icon: <ChefHat className="w-4 h-4" />, count: metrics.bohActive },
    { id: 'foh', label: `FOH (${metrics.fohActive})`, icon: <Users className="w-4 h-4" />, count: metrics.fohActive },
    { id: 'edge', label: `Edge Cases (${metrics.edgeCases})`, icon: <AlertTriangle className="w-4 h-4" />, count: metrics.edgeCases },
    { id: 'analytics', label: `Analytics (${metrics.totalSessions})`, icon: <TrendingUp className="w-4 h-4" />, count: metrics.totalSessions },
    { id: 'more', label: 'More', icon: <Settings className="w-4 h-4" />, count: 0 }
  ];

  const handleCreateSession = async () => {
    try {
      await createSession({
        tableId: newSession.tableId,
        customerName: newSession.customerName,
        flavor: newSession.flavor,
        amount: newSession.amount / 100
      });
      setShowCreateModal(false);
      setNewSession({
        tableId: 'T-001',
        customerName: '',
        flavor: 'Blue Mist',
        amount: 3000
      });
      addToast('Session created successfully!', 'success');
    } catch (err) {
      addToast('Failed to create session', 'error');
    }
  };

  const handleSessionAction = async (sessionId: string, action: string) => {
    try {
      await updateSession(sessionId, { 
        status: action,
        lastUpdated: Date.now()
      });
      addToast(`Session ${action.toLowerCase()} completed`, 'success');
    } catch (err) {
      addToast(`Failed to ${action.toLowerCase()} session`, 'error');
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;
    
    try {
      addToast('Session deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedSession(null);
    } catch (err) {
      addToast('Failed to delete session', 'error');
    }
  };

  const getStatusBadge = (status: string, statusColor: string, statusIcon: string) => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg" role="img" aria-label={`Status: ${status}`}>
          {statusIcon}
        </span>
        <Badge className={`${statusColor} text-white text-sm font-bold px-3 py-1 animate-pulse`}>
          {status.replace(/_/g, ' ')}
        </Badge>
      </div>
    );
  };

  const filteredSessions = sessions.filter(session => {
    switch (activeTab) {
      case 'boh':
        return session.team === 'BOH';
      case 'foh':
        return session.team === 'FOH';
      case 'edge':
        return session.team === 'EDGE';
      case 'overview':
      default:
        return true;
    }
  });

  // Edge case alert data
  const edgeCaseAlert = {
    title: "Equipment malfunction - hookah base cracked - Table T-011",
    details: "Edge case: Equipment malfunction - hookah base cracked for Table T-011",
    customer: "Customer 15551234560 | Flavor: Custom Mix | Reported: 1:29:07 PM",
    priority: "Medium Priority",
    assigned: "Sarah Chen"
  };

  // Analytics data
  const analyticsData = {
    revenue: {
      total: 280.00,
      average: 40.00,
      duration: 2,
      profit: 84.00
    },
    staff: [
      { name: "Mike Rodriguez", revenue: 55.00, sessions: 2, avgValue: 27.50, duration: 0 },
      { name: "Sarah Chen", revenue: 45.00, sessions: 1, avgValue: 45.00, duration: 0 },
      { name: "Alex Johnson", revenue: 75.00, sessions: 2, avgValue: 37.50, duration: 0 }
    ],
    flavors: [
      { name: "mint + blueberry", sessions: 2 },
      { name: "Watermelon + Mint", sessions: 1 },
      { name: "Blue Mist", sessions: 1 },
      { name: "Double Apple + Mint", sessions: 1 },
      { name: "Peach Wave", sessions: 1 },
      { name: "Custom Mix", sessions: 1 }
    ]
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        {/* Screen Reader Announcements */}
        <div 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {announcement}
        </div>

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Top Navigation */}
        <div className="bg-zinc-900/95 backdrop-blur-sm border-b border-teal-500/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Logo and SESSIONS button */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">H+</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    HOOKAH+
                  </span>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  SESSIONS
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-all duration-300 hover:scale-105">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-all duration-300 hover:scale-105">
                  <Flame className="w-4 h-4" />
                  <span>Sessions</span>
                </button>
                <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-all duration-300 hover:scale-105">
                  <Users className="w-4 h-4" />
                  <span>Staff Ops</span>
                </button>
                <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-all duration-300 hover:scale-105">
                  <UserCheck className="w-4 h-4" />
                  <span>Staff Panel</span>
                </button>
                <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-all duration-300 hover:scale-105">
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Right side status and actions */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-zinc-400">Flow Status</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold">{metrics.totalSessions}</span>
                    <span className="text-sm">🔥</span>
                  </div>
                  <div className="text-xs text-green-400">Active</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 text-zinc-300 hover:text-white transition-all duration-300 hover:scale-105">
                    <Folder className="w-4 h-4" />
                    <span className="text-sm">Support</span>
                  </button>
                  <button className="flex items-center space-x-1 text-zinc-300 hover:text-white transition-all duration-300 hover:scale-105">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Docs</span>
                  </button>
                </div>

                <button className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm">Admin</span>
                  <span className="text-xs">▼</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Fire Session Dashboard
              </h1>
            </div>
            <p className="text-xl text-zinc-400">
              Complete BOH/FOH workflow management with edge case handling
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-zinc-500">Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <PulseDot color="bg-green-400" size="sm" />
              <span className="text-sm text-green-400">Live</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <ErrorMessage error={error} onRetry={fetchData} />
          )}

          {/* Edge Case Alert */}
          {metrics.edgeCases > 0 && (
            <div className="mb-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Lightning className="w-6 h-6 text-yellow-400" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-400">{edgeCaseAlert.title}</h3>
                  <p className="text-sm text-zinc-300 mt-1">{edgeCaseAlert.details}</p>
                  <p className="text-xs text-zinc-400 mt-1">{edgeCaseAlert.customer}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="info" size="sm" className="bg-blue-500 hover:bg-blue-600">
                    Assign
                  </Button>
                  <Button variant="success" size="sm" className="bg-green-500 hover:bg-green-600">
                    Resolve
                  </Button>
                  <Button variant="danger" size="sm" className="bg-red-500 hover:bg-red-600">
                    Escalate
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading && sessions.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))
            ) : (
              [
                {
                  title: 'Total Sessions',
                  value: metrics.totalSessions.toString(),
                  icon: <Flame className="w-8 h-8 text-orange-400" />,
                  change: '+12%',
                  changeType: 'positive' as const,
                  trend: 'up',
                  progress: (metrics.totalSessions / 10) * 100
                },
                {
                  title: 'BOH Active',
                  value: metrics.bohActive.toString(),
                  icon: <ChefHat className="w-8 h-8 text-purple-400" />,
                  change: '+5%',
                  changeType: 'positive' as const,
                  trend: 'up',
                  progress: (metrics.bohActive / 5) * 100
                },
                {
                  title: 'FOH Active',
                  value: metrics.fohActive.toString(),
                  icon: <Users className="w-8 h-8 text-purple-400" />,
                  change: '-2%',
                  changeType: 'negative' as const,
                  trend: 'down',
                  progress: (metrics.fohActive / 5) * 100
                },
                {
                  title: 'Edge Cases',
                  value: metrics.edgeCases.toString(),
                  icon: <AlertTriangle className="w-8 h-8 text-yellow-400" />,
                  change: '0%',
                  changeType: 'neutral' as const,
                  trend: 'stable',
                  progress: (metrics.edgeCases / 3) * 100
                }
              ].map((metric, index) => (
                <Card 
                  key={index} 
                  className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 p-6 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-white group-hover:text-teal-400 transition-colors duration-300">
                      {metric.value}
                    </div>
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {metric.icon}
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 mb-2">{metric.title}</div>
                  <div className="mb-2">
                    <ProgressBar progress={metric.progress} color="bg-teal-500" animated />
                  </div>
                  <div className={`text-sm font-medium flex items-center space-x-1 ${
                    metric.changeType === 'positive' ? 'text-green-400' :
                    metric.changeType === 'negative' ? 'text-red-400' : 'text-zinc-400'
                  }`}>
                    <span className={`${metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-zinc-400'}`}>
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                    </span>
                    <span>{metric.change}</span>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setShowCreateModal(true)}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 relative shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute -top-2 -left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                  NEW
                </span>
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Creating...' : 'Create Session'}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-600 hover:border-teal-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View All Sessions
              </Button>
            </div>

            <button className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
              <Crown className="w-4 h-4" />
              <span>Admin</span>
              <span className="text-xs">▼</span>
            </button>
          </div>

          {/* Filter Tabs */}
          {isLoading && sessions.length === 0 ? (
            <TabSkeleton />
          ) : (
            <div className="flex space-x-2 mb-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === tab.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-zinc-600 text-white'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Analytics Dashboard */}
          {activeTab === 'analytics' && (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-6 h-6 text-teal-400" />
                <h2 className="text-2xl font-semibold">Live Analytics Dashboard</h2>
                <div className="ml-auto flex items-center space-x-2">
                  <PulseDot color="bg-green-400" size="sm" />
                  <span className="text-sm text-green-400">Live Data • Last updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">${analyticsData.revenue.total}</div>
                      <div className="text-sm text-zinc-400">Total Revenue</div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30 p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Target className="w-6 h-6 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">${analyticsData.revenue.average}</div>
                      <div className="text-sm text-zinc-400">Avg Order Value</div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-violet-900/20 border-purple-500/30 p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock3 className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{analyticsData.revenue.duration}</div>
                      <div className="text-sm text-zinc-400">Avg Duration (min)</div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-500/30 p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                    <div>
                      <div className="text-2xl font-bold text-orange-400">${analyticsData.revenue.profit}</div>
                      <div className="text-sm text-zinc-400">Est. Profit (30%)</div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 p-6">
                  <h3 className="text-lg font-semibold mb-4">Staff Performance</h3>
                  <div className="space-y-4">
                    {analyticsData.staff.map((staff, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-zinc-400">
                            Revenue: ${staff.revenue} • Sessions: {staff.sessions} • Avg: ${staff.avgValue}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-zinc-400">{staff.duration}min</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 p-6">
                  <h3 className="text-lg font-semibold mb-4">Flavor Performance</h3>
                  <div className="space-y-3">
                    {analyticsData.flavors.map((flavor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">{flavor.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full" 
                              style={{ width: `${(flavor.sessions / 2) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-zinc-400">{flavor.sessions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Session Flow Overview */}
          {activeTab !== 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30 p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{metrics.bohActive}</div>
                    <div className="text-sm text-zinc-400">Back of House</div>
                  </div>
                </div>
                <div className="text-sm text-zinc-300 mb-2">Prep & Assembly</div>
                <ProgressBar progress={(metrics.bohActive / 5) * 100} color="bg-purple-500" />
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{metrics.fohActive}</div>
                    <div className="text-sm text-zinc-400">Front of House</div>
                  </div>
                </div>
                <div className="text-sm text-zinc-300 mb-2">Delivery & Service</div>
                <ProgressBar progress={(metrics.fohActive / 5) * 100} color="bg-blue-500" />
              </Card>

              <Card className="bg-gradient-to-br from-pink-900/20 to-pink-800/20 border-pink-500/30 p-6 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-400">
                      {sessions.filter(s => s.team === 'CUSTOMER').length}
                    </div>
                    <div className="text-sm text-zinc-400">Active Customers</div>
                  </div>
                </div>
                <div className="text-sm text-zinc-300 mb-2">Live Sessions</div>
                <ProgressBar progress={(sessions.filter(s => s.team === 'CUSTOMER').length / 5) * 100} color="bg-pink-500" />
              </Card>
            </div>
          )}

          {/* Content Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <ChefHat className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-semibold">Recent Sessions</h2>
              <div className="ml-auto flex items-center space-x-2">
                <PulseDot color="bg-green-400" size="sm" />
                <span className="text-sm text-green-400">Live Updates</span>
              </div>
            </div>

            {/* Session Cards */}
            <div className="space-y-4">
              {isLoading && sessions.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <SessionCardSkeleton key={i} />
                ))
              ) : filteredSessions.length === 0 ? (
                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold text-zinc-400 mb-2">No sessions found</h3>
                  <p className="text-zinc-500">
                    {activeTab === 'overview' 
                      ? 'No sessions available at the moment.' 
                      : `No ${activeTab.toUpperCase()} sessions found.`
                    }
                  </p>
                </Card>
              ) : (
                filteredSessions.map((session, index) => (
                  <Card 
                    key={session.id} 
                    className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 p-6 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 transform hover:scale-[1.02] group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                          {session.team === 'BOH' ? '👨‍🍳' : session.team === 'FOH' ? '🚚' : session.team === 'CUSTOMER' ? '🟢' : '⚠️'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-blue-400 group-hover:text-teal-400 transition-colors duration-300">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="text-sm text-zinc-400 block mb-2">Assigned Staff:</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={session.assignedBOH}
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-300"
                            readOnly
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-zinc-700 hover:bg-zinc-600 border-zinc-600 hover:border-teal-500 transition-all duration-300"
                          >
                            Assign
                            <span className="ml-1">▼</span>
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-zinc-400 block mb-2">Session Notes:</label>
                        <button className="text-teal-400 text-sm hover:text-teal-300 mb-2 transition-colors duration-300">
                          Add Note
                        </button>
                        <div className="bg-zinc-800 rounded-lg p-3 text-sm text-zinc-300 border border-zinc-700 hover:border-teal-500/50 transition-colors duration-300">
                          {session.notes}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-zinc-400 block mb-2">Created:</label>
                        <div className="text-zinc-300">{session.created}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handleSessionAction(session.id, 'HEAT_UP')}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Heat Up
                      </Button>
                      
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleSessionAction(session.id, 'RESTART_PREP')}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restart Prep
                      </Button>
                      
                      <Button 
                        variant="info" 
                        size="sm" 
                        onClick={() => handleSessionAction(session.id, 'RESOLVE_ISSUE')}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve Issue
                      </Button>
                      
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleSessionAction(session.id, 'FLAG_MANAGER')}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Flag Manager
                      </Button>
                      
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handleSessionAction(session.id, 'HOLD_SESSION')}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Hold Session
                      </Button>
                      
                      <Button 
                        variant="accent" 
                        size="sm" 
                        onClick={() => handleSessionAction(session.id, 'REQUEST_REFILL')}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Request Refill
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedSession(session.id);
                          setShowDeleteModal(true);
                        }}
                        className="bg-zinc-700 hover:bg-red-600 border-zinc-600 hover:border-red-500 text-zinc-300 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button - Only on mobile */}
        {isMobile && (
          <FloatingActionButton
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-6 h-6" />}
            label="Create New Session"
            position="bottom-right"
          />
        )}

        {/* Create Session Modal */}
        <ConfirmationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateSession}
          title="Create New Session"
          message="Are you sure you want to create a new session?"
          confirmText="Create"
          cancelText="Cancel"
          type="info"
        />

        {/* Delete Session Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSession(null);
          }}
          onConfirm={handleDeleteSession}
          title="Delete Session"
          message="Are you sure you want to delete this session? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </ErrorBoundary>
  );
}