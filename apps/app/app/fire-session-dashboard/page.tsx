"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CreateSessionModal from '../../components/CreateSessionModal';
import GlobalNavigation from '../../components/GlobalNavigation';
import SimpleFSDDesign from '../../components/SimpleFSDDesign';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import { SessionProvider, useSessionContext } from '../../contexts/SessionContext';
import { 
  Flame, 
  AlertCircle,
  RefreshCw,
  Shield
} from 'lucide-react';
import { SessionStatus } from '../../types/session';
import Breadcrumbs from '../../components/Breadcrumbs';
import PageHero from '../../components/PageHero';
import SyncIndicator from '../../components/SyncIndicator';
import RelatedSessions from '../../components/RelatedSessions';
import PulseCard from '../../components/PulseCard';

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
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userRole, setUserRole] = useState<'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'>('MANAGER');
  const [demoSessionCreated, setDemoSessionCreated] = useState(false);
  
  // Check for demo mode from URL params
  const isDemoMode = searchParams.get('mode') === 'demo';
  const paymentConfirmed = searchParams.get('payment') === 'confirmed';
  const sessionIdFromUrl = searchParams.get('session');
  const demoLounge = searchParams.get('lounge') || null;
  const isDemoSlug = isDemoMode && demoLounge !== null; // True when accessed via /demo/[slug]
  const demoFlavorsParam = searchParams.get('flavors');
  const demoMenuFlavors = demoFlavorsParam ? demoFlavorsParam.split(',').filter(Boolean) : null;
  
  // Use session context for shared state
  const { sessions, metrics, loading, error, refreshSessions, updateSessionState, lastUpdated } = useSessionContext();
  const { currentTheme } = useTheme();
  
  // In demo mode, sessions are generated in-memory by useLiveSessionData
  // No API calls needed - demo data is automatically used when database is unavailable
  useEffect(() => {
    if (isDemoMode) {
      console.log('[Demo Mode] 🎭 Using in-memory demo sessions - no API calls required');
      setDemoSessionCreated(true);
      // Refresh to load demo data
      refreshSessions();
    }
  }, [isDemoMode, refreshSessions]);
  
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
    // In demo mode, don't call API - just return a demo session ID
    if (isDemoMode) {
      console.log('[Create Session] 🎭 Demo Mode: Creating in-memory demo session (no API call)');
      const demoSessionId = `demo-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Refresh to show the new demo session in the list
      await refreshSessions();
      return demoSessionId;
    }

    // Production mode: call the API
    try {
      // Convert modal data format to API format
      const apiPayload = {
        tableId: sessionData.table_id || sessionData.tableId,
        customerName: sessionData.customer_name || sessionData.customerName,
        customerPhone: sessionData.customer_phone || sessionData.customerPhone || '',
        flavor: sessionData.flavor_mix && sessionData.flavor_mix.length > 0 
          ? (Array.isArray(sessionData.flavor_mix) ? sessionData.flavor_mix.join(' + ') : sessionData.flavor_mix)
          : 'Custom Mix',
        amount: sessionData.amount ? Math.round(sessionData.amount * 100) : 3000, // Convert to cents
        assignedStaff: {
          boh: sessionData.boh_staff || sessionData.bohStaff || undefined,
          foh: sessionData.foh_staff || sessionData.fohStaff || undefined
        },
        notes: sessionData.notes || '',
        sessionDuration: sessionData.timer_duration ? sessionData.timer_duration * 60 : 45 * 60, // Convert minutes to seconds
        loungeId: sessionData.lounge_id || demoLounge || 'default-lounge',
        source: sessionData.session_type === 'reservation' ? 'RESERVE' : 
                sessionData.session_type === 'vip' ? 'WALK_IN' : 'WALK_IN', // VIP maps to WALK_IN (not a valid SessionSource)
        externalRef: sessionData.externalRef || `table-${sessionData.table_id || sessionData.tableId}-${Date.now()}`,
        // Add demo mode flag
        isDemo: isDemoMode
      };

      console.log('[Create Session] Sending to API:', apiPayload);

      // Use relative URL to hit the app build's API
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      // Parse response safely
      let responseData;
      const responseText = await response.text();
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('[Create Session] Failed to parse response:', parseError);
        throw new Error(`Invalid response from server: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        console.error('[Create Session] API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(responseData.error || responseData.details || `Failed to create session: ${response.status}`);
      }

      console.log('[Create Session] Success:', responseData);
      await refreshSessions(); // Refresh live data
      
      // Return session ID for payment checkout
      return responseData.session?.id || responseData.id;
    } catch (error) {
      console.error('[Create Session] Error:', error);
      alert(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleStatusChange = async (sessionId: string, action: string) => {
    // In demo mode, updateSessionState handles in-memory updates
    // In production, it calls the API
    await updateSessionState(sessionId, action);
  };

  const getThemeClasses = () => {
    return `bg-gradient-to-br ${currentTheme.gradients.background} text-${currentTheme.colors.text}`;
  };

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      <Suspense fallback={<div className="h-16 bg-zinc-950 border-b border-zinc-800"></div>}>
        <GlobalNavigation />
      </Suspense>
      
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 border-b border-teal-500/30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Shield className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-teal-200">
                Demo Mode — Safe to tap everything, no real payments.
              </p>
              {demoLounge && (
                <p className="text-xs text-teal-300/70 mt-0.5">
                  Testing: {demoLounge.replace(/-/g, ' ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
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
          secondaryCTA={!isDemoMode ? {
            text: 'View All Sessions',
            href: '/sessions'
          } : undefined}
          trustIndicators={[
            { icon: <RefreshCw className="w-4 h-4" />, text: 'Real-time updates' },
            { icon: <AlertCircle className="w-4 h-4" />, text: `${metrics.alerts} alerts` }
          ]}
        />

        {/* Daily Pulse Card - Hidden in demo mode */}
        {!isDemoMode && (
          <div className="mb-6">
            <PulseCard 
              compact={true} 
              window="24h" 
              autoRefresh={true}
              loungeId={demoLounge || undefined}
            />
          </div>
        )}

        {/* Sync Indicator - Hidden in demo mode */}
        {!isDemoMode && (
          <div className="mb-6 flex items-center justify-between">
            <SyncIndicator
              lastUpdated={lastUpdated}
              isLoading={loading}
              error={error}
              autoRefreshInterval={30}
              isDemoMode={isDemoMode}
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
        )}

        {/* Error Display - Hidden in demo mode */}
        {error && !isDemoMode && (
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
          refreshSessions={refreshSessions}
          onSessionAction={handleStatusChange}
        />

        {/* Related Features - Hidden in demo mode */}
        {!isDemoMode && (
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
        )}
      </div>

      {/* Modals */}
        <CreateSessionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateSession={handleCreateSession}
          isDemoMode={isDemoMode}
          demoMenuFlavors={demoMenuFlavors}
          isDemoSlug={isDemoSlug}
        />
    </div>
  );
}