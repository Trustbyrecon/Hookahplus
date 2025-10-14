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
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Star,
  Heart,
  Zap,
  Target,
  Activity,
  TrendingDown,
  Star as StarIcon,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Session, SessionStatus, SessionTeam, SessionNotes } from '../../types/session';

export default function FireSessionDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold mb-2">Loading Dashboard...</h2>
        <p className="text-zinc-400 text-sm">Setting up your session</p>
      </div>
    </div>}>
      <FireSessionDashboardContent />
    </Suspense>
  );
}

function FireSessionDashboardContent() {
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [useEnhancedDesign, setUseEnhancedDesign] = useState(true);
  
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

  // Sample sessions data
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'session-1',
      tableId: 'T-001',
      customerRef: 'Alex Johnson',
      flavor: 'Blue Mist + Mint',
      priceCents: 3500,
      state: 'ACTIVE',
      assignedBOHId: 'staff-1',
      assignedFOHId: 'staff-2',
      createdAt: new Date(),
      updatedAt: new Date(),
      timerDuration: 45,
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
      timerStatus: 'running'
    },
    {
      id: 'session-2',
      tableId: 'T-002',
      customerRef: 'Sarah Chen',
      flavor: 'Strawberry Mojito',
      priceCents: 3000,
      state: 'PREP_IN_PROGRESS',
      assignedBOHId: 'staff-3',
      assignedFOHId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      timerDuration: undefined,
      startedAt: undefined,
      timerStatus: 'stopped'
    }
  ]);

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
      setSessions(prev => [...prev, newSession]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleStatusChange = (sessionId: string, newStatus: SessionStatus) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, state: newStatus, updatedAt: new Date() }
        : session
    ));
  };

  const getThemeClasses = () => {
    // Always use midnight theme (black base)
    return 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white';
  };

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      {/* Enhanced Design Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setUseEnhancedDesign(!useEnhancedDesign)}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {useEnhancedDesign ? 'Enhanced' : 'Classic'} Design
        </button>
      </div>

      {/* Enhanced Design */}
      {useEnhancedDesign ? (
        <EnhancedFSDDesign
          sessions={sessions}
          userRole="MANAGER"
          onSessionAction={(action, sessionId) => {
            if (action === 'complete') {
              handleStatusChange(sessionId, 'COMPLETED');
            } else if (action === 'pause') {
              handleStatusChange(sessionId, 'PAUSED');
            }
          }}
        />
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
                      {session.state}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p><strong>Customer:</strong> {session.customerRef}</p>
                    <p><strong>Flavor:</strong> {session.flavor}</p>
                    <p><strong>Price:</strong> ${(session.priceCents / 100).toFixed(2)}</p>
                    <p><strong>State:</strong> {session.state}</p>
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