"use client";

import React, { useState, useEffect, Suspense } from 'react';
import CreateSessionModal from '../../components/CreateSessionModal';
import GlobalNavigation from '../../components/GlobalNavigation';
import SimpleFSDDesign from '../../components/SimpleFSDDesign';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import { SessionProvider, useSessionContext } from '../../contexts/SessionContext';
import { 
  Flame, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { SessionStatus } from '../../types/session';
import Breadcrumbs from '../../components/Breadcrumbs';
import PageHero from '../../components/PageHero';
import SyncIndicator from '../../components/SyncIndicator';
import RelatedSessions from '../../components/RelatedSessions';

export default function FireSessionDashboard() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading Dashboard...</h2>
            <p className="text-zinc-400 text-sm">Setting up your session</p>
          </div>
        </div>}>
          <ErrorBoundary>
            <FireSessionDashboardContent />
          </ErrorBoundary>
        </Suspense>
      </SessionProvider>
    </ThemeProvider>
  );
}

function FireSessionDashboardContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userRole, setUserRole] = useState<'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'>('MANAGER');
  
  // Use session context for shared state
  const { sessions, metrics, loading, error, refreshSessions, updateSessionState, lastUpdated } = useSessionContext();
  const { currentTheme } = useTheme();
  
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
      // Convert session data to root Prisma API format
      const prismaSessionData = {
        loungeId: 'default-lounge',
        source: 'WALK_IN',
        externalRef: `table-${sessionData.tableId}-${Date.now()}`,
        customerPhone: sessionData.customerPhone || '',
        flavorMix: sessionData.flavor || 'Custom Mix'
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prismaSessionData),
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
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs className="mb-6" />
        
        <PageHero
          headline="Fire Session Dashboard"
          subheadline="Real-time session management with intelligent workflow automation. Monitor live sessions, manage BOH/FOH workflows, and optimize operations."
          benefit={{
            value: `${metrics.activeSessions} Active Sessions`,
            description: `$${metrics.revenue.toFixed(2)} revenue • ${metrics.staffAssigned} staff assigned`,
            icon: <Flame className="w-5 h-5 text-orange-400" />
          }}
          primaryCTA={{
            text: 'View Analytics',
            href: '/analytics'
          }}
          secondaryCTA={{
            text: 'View All Sessions',
            href: '/sessions'
          }}
          trustIndicators={[
            { icon: <RefreshCw className="w-4 h-4" />, text: 'Real-time updates' },
            { icon: <AlertCircle className="w-4 h-4" />, text: `${metrics.alerts} alerts` }
          ]}
        />

        {/* Sync Indicator */}
        <div className="mb-6 flex items-center justify-between">
          <SyncIndicator
            lastUpdated={lastUpdated}
            isLoading={loading}
            error={error}
            autoRefreshInterval={30}
          />
          <div className="flex items-center gap-4">
            <button
              onClick={() => refreshSessions()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-zinc-400">Role:</span>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value as any)}
                className="bg-zinc-800 text-white text-sm font-medium px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="MANAGER">MANAGER</option>
                <option value="BOH">BOH</option>
                <option value="FOH">FOH</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-200 text-sm mt-2">{error}</p>
          </div>
        )}

        {/* Session Management */}
        <SimpleFSDDesign
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

        {/* Related Features */}
        <div className="mt-16 border-t border-zinc-800 pt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Related Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/sessions"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-5 h-5 text-teal-400" />
                <span className="font-medium text-white">Sessions Management</span>
              </div>
              <p className="text-sm text-zinc-400">Advanced session management and monitoring</p>
            </a>
            <a
              href="/analytics"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Analytics</span>
              </div>
              <p className="text-sm text-zinc-400">View detailed analytics and reports</p>
            </a>
            <a
              href="/staff-ops"
              className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">Staff Operations</span>
              </div>
              <p className="text-sm text-zinc-400">Daily operations and staff management</p>
            </a>
          </div>
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