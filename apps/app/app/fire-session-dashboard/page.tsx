"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { FOHTimerInterface } from '../../components/FOHTimerInterface';
import { ManagerTimerDashboard } from '../../components/ManagerTimerDashboard';
import DollarTestButton from '../../components/DollarTestButton';
import EnhancedFSDDesign from '../../components/EnhancedFSDDesign';
import DynamicMetricsDashboard from '../../components/DynamicMetricsDashboard';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import { useLiveSessionData } from '../../hooks/useLiveSessionData';
import { 
  Flame, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  Settings,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
  Info,
  Star,
  Heart,
  Zap,
  Target,
  TrendingDown,
  Star as StarIcon,
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Session, SessionStatus, SessionTeam, SessionNotes } from '../../types/session';

export default function FireSessionDashboard() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-zinc-400 text-sm">Setting up your session</p>
        </div>
      </div>}>
        <FireSessionDashboardContent />
      </Suspense>
    </ThemeProvider>
  );
}

function FireSessionDashboardContent() {
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [useEnhancedDesign, setUseEnhancedDesign] = useState(true);
  const [userRole, setUserRole] = useState<'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'>('MANAGER');
  
  // Use live session data
  const { sessions, metrics, loading, error, refreshSessions, updateSessionState } = useLiveSessionData();
  const { currentTheme } = useTheme();
  
  // Check for legacy view parameter
  useEffect(() => {
    const view = searchParams.get('view');
    setUseEnhancedDesign(view !== 'legacy');
  }, [searchParams]);
  
  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', showCreateModal);
  }, [showCreateModal]);

  // Listen for Create Session modal events from Enhanced Design
  useEffect(() => {
    const handleOpenCreateSessionModal = () => {
      setShowCreateModal(true);
    };

    window.addEventListener('openCreateSessionModal', handleOpenCreateSessionModal);
    
    return () => {
      window.removeEventListener('openCreateSessionModal', handleOpenCreateSessionModal);
    };
  }, []);

  const handleCreateSession = async (sessionData: any) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const newSession = await response.json();
      await refreshSessions(); // Refresh live data
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleStatusChange = (sessionId: string, newStatus: SessionStatus) => {
    updateSessionState(sessionId, newStatus);
  };

  const getThemeClasses = () => {
    return `bg-gradient-to-br ${currentTheme.gradients.background} text-${currentTheme.colors.text}`;
  };

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      <GlobalNavigation />
      {/* Enhanced Design Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setUseEnhancedDesign(!useEnhancedDesign)}
          className={`px-4 py-2 rounded-xl bg-${currentTheme.colors.surface}/20 border border-${currentTheme.colors.border} text-${currentTheme.colors.text} text-sm font-medium hover:bg-${currentTheme.colors.surface}/30 transition-colors flex items-center gap-2`}
        >
          <Sparkles className="w-4 h-4" />
          {useEnhancedDesign ? 'Enhanced' : 'Classic'} Design
        </button>
      </div>

      {/* Enhanced Design */}
      {useEnhancedDesign ? (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Dynamic Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl bg-${currentTheme.colors.primary}-500/20`}>
                <Flame className={`w-8 h-8 text-${currentTheme.colors.primary}-400`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold text-${currentTheme.colors.text}`}>
                  Fire Session Dashboard
                </h1>
                <p className={`text-sm text-${currentTheme.colors.textSecondary}`}>
                  Real-time session management with intelligent workflow automation and staff coordination.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DollarTestButton />
              <div className="flex items-center space-x-2">
                <span className={`text-sm text-${currentTheme.colors.textSecondary}`}>Role:</span>
                <select 
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className={`bg-${currentTheme.colors.surface} text-${currentTheme.colors.text} text-sm font-medium px-3 py-2 rounded-lg border border-${currentTheme.colors.border} focus:outline-none focus:ring-2 focus:ring-${currentTheme.colors.primary}-500`}
                >
                  <option value="MANAGER">MANAGER</option>
                  <option value="BOH">BOH</option>
                  <option value="FOH">FOH</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <span className={`text-xs text-${currentTheme.colors.textSecondary}`}>(FOH View)</span>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-6 py-3 rounded-xl bg-gradient-to-r ${currentTheme.gradients.primary} text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2`}
              >
                <Plus className="w-5 h-5" />
                Create Session
              </button>
              
              <button
                onClick={refreshSessions}
                disabled={loading}
                className={`px-4 py-3 rounded-xl bg-${currentTheme.colors.surface} border border-${currentTheme.colors.border} text-${currentTheme.colors.text} hover:bg-${currentTheme.colors.surface}/80 transition-colors flex items-center gap-2 disabled:opacity-50`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Dynamic Metrics Dashboard */}
          <DynamicMetricsDashboard metrics={metrics} loading={loading} />

          {/* Error Display */}
          {error && (
            <div className={`bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6`}>
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-200 text-sm mt-2">{error}</p>
            </div>
          )}

          {/* Enhanced Session Management */}
          <EnhancedFSDDesign
            sessions={sessions}
            userRole={userRole}
            onSessionAction={(action, sessionId) => {
              if (action === 'complete') {
                handleStatusChange(sessionId, 'COMPLETED');
              } else if (action === 'pause') {
                handleStatusChange(sessionId, 'PAUSED');
              }
            }}
          />
        </div>
      ) : (
        <>
          {/* Legacy Mode Indicator */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-300">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Legacy Mode Active</span>
            </div>
            <p className="text-yellow-200 text-sm mt-2">
              You're viewing the classic Fire Session Dashboard. 
              <Link href="/fire-session-dashboard" className="text-yellow-300 hover:text-yellow-200 underline ml-1">
                Switch to Enhanced Mode
              </Link> for the latest features and HiTrust intelligence.
            </p>
          </div>

          {/* Classic Design Content */}
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Fire Session Dashboard</h1>
              <p className="text-zinc-400">Classic view - Enhanced mode available</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <Card key={session.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{session.tableId}</h3>
                    <Badge className="bg-green-500 text-white">
                      {session.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p><strong>Customer:</strong> {session.customerName}</p>
                    <p><strong>Flavor:</strong> {session.flavor}</p>
                    <p><strong>Price:</strong> ${(session.amount / 100).toFixed(2)}</p>
                    <p><strong>State:</strong> {session.status}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}