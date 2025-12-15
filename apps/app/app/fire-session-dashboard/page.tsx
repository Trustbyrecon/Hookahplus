"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
  Shield,
  CheckCircle
} from 'lucide-react';
import { SessionStatus } from '../../types/session';
import Breadcrumbs from '../../components/Breadcrumbs';
import PageHero from '../../components/PageHero';
import SyncIndicator from '../../components/SyncIndicator';
import RelatedSessions from '../../components/RelatedSessions';
import PulseCard from '../../components/PulseCard';
import FirstLightBanner from '../../components/FirstLightBanner';
import FirstLightHealthCard from '../../components/FirstLightHealthCard';
import FirstLightChecklist from '../../components/FirstLightChecklist';

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
  const [firstLightFocus, setFirstLightFocus] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [firstLightAchieved, setFirstLightAchieved] = useState(false);
  const [previousSessionCount, setPreviousSessionCount] = useState(0);
  const [alphaStabilityMode, setAlphaStabilityMode] = useState(false);
  const [metricsEnabled, setMetricsEnabled] = useState(false);
  const [sessionClaimTimes, setSessionClaimTimes] = useState<Map<string, number>>(new Map());
  const demoProgressionTimersRef = useRef<Map<string, NodeJS.Timeout[]>>(new Map());
  
  // Check for demo mode from URL params
  const isDemoMode = searchParams.get('mode') === 'demo';
  const paymentConfirmed = searchParams.get('payment') === 'confirmed';
  const sessionIdFromUrl = searchParams.get('session');
  const demoLounge = searchParams.get('lounge') || null;
  const demoSource = searchParams.get('source') as 'onboarding' | 'marketing' | null;
  const isDemoSlug = isDemoMode && demoLounge !== null; // True when accessed via /demo/[slug]
  const demoFlavorsParam = searchParams.get('flavors');
  const demoMenuFlavors = demoFlavorsParam ? demoFlavorsParam.split(',').filter(Boolean) : null;
  
  // Determine demo source: onboarding (from /demo/[slug]) or marketing (direct FSD access)
  const effectiveDemoSource: 'onboarding' | 'marketing' = demoSource || (isDemoSlug ? 'onboarding' : 'marketing');
  
  // Use session context for shared state
  const { sessions, metrics, loading, error, refreshSessions, updateSessionState, lastUpdated } = useSessionContext();
  const { currentTheme } = useTheme();

  // Check database connection status
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setDatabaseConnected(data.database === 'connected');
      } catch {
        setDatabaseConnected(false);
      }
    };
    checkDatabase();
    const interval = setInterval(checkDatabase, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check for First Light achievement (session created and persists)
  useEffect(() => {
    if (!isDemoMode && databaseConnected && sessions.length > 0 && sessions.length > previousSessionCount) {
      // Session was created - check if it persists after a delay
      const checkPersist = setTimeout(async () => {
        await refreshSessions();
        // If session count is still > 0 after refresh, First Light is achieved
        if (sessions.length > 0) {
          setFirstLightAchieved(true);
          // Show celebration for 10 seconds
          setTimeout(() => {
            // Keep it achieved but don't auto-hide - user can dismiss manually
          }, 10000);
        }
      }, 2000);
      return () => clearTimeout(checkPersist);
    }
    setPreviousSessionCount(sessions.length);
  }, [sessions.length, databaseConnected, isDemoMode, previousSessionCount, refreshSessions]);
  
  // Check if session from URL exists (for paid sessions from checkout)
  useEffect(() => {
    if (sessionIdFromUrl && searchParams.get('paid') === 'true') {
      // Check if this session exists in the list
      const sessionExists = sessions.some(s => s.id === sessionIdFromUrl || s.externalRef === sessionIdFromUrl);
      if (sessionExists && !firstLightAchieved) {
        // This is a paid session - celebrate First Light!
        setFirstLightAchieved(true);
        // Refresh to ensure we have the latest session data
        refreshSessions();
      } else if (!sessionExists) {
        // Session not found yet - keep polling
        const pollInterval = setInterval(async () => {
          await refreshSessions();
          const updatedSessions = await fetch('/api/sessions').then(r => r.json()).catch(() => ({ sessions: [] }));
          const found = (updatedSessions.sessions || updatedSessions).some((s: any) => 
            s.id === sessionIdFromUrl || s.externalRef === sessionIdFromUrl
          );
          if (found) {
            clearInterval(pollInterval);
            setFirstLightAchieved(true);
          }
        }, 2000);
        // Stop polling after 30 seconds
        setTimeout(() => clearInterval(pollInterval), 30000);
        return () => clearInterval(pollInterval);
      }
    }
  }, [sessionIdFromUrl, sessions, firstLightAchieved, searchParams, refreshSessions]);
  
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

  // Track when sessions are claimed for automatic progression
  useEffect(() => {
    if (!isDemoMode) return;

    sessions.forEach(session => {
      const status = session.status || session.state;
      const hasBeenClaimed = session.assignedStaff?.boh && 
                            (status === 'PREP_IN_PROGRESS' || status === 'HEAT_UP' || 
                             status === 'READY_FOR_DELIVERY' || status === 'OUT_FOR_DELIVERY' || 
                             status === 'DELIVERED' || status === 'ACTIVE');
      
      // Record claim time if session was just claimed
      if (hasBeenClaimed && !sessionClaimTimes.has(session.id)) {
        setSessionClaimTimes(prev => {
          const newMap = new Map(prev);
          newMap.set(session.id, Date.now());
          return newMap;
        });
      }
    });
  }, [sessions, isDemoMode, sessionClaimTimes]);

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

  // Automatic progression for demo sessions in accelerated mode
  // Must be after handleStatusChange is declared
  useEffect(() => {
    if (!isDemoMode) return;

    // Clean up timers for sessions that no longer exist or are complete
    demoProgressionTimersRef.current.forEach((timers, sessionId) => {
      const session = sessions.find(s => s.id === sessionId);
      const status = session?.status || session?.state;
      const isComplete = !session || status === 'ACTIVE' || status === 'CLOSED' || status === 'CLOSE_PENDING';
      
      if (isComplete) {
        timers.forEach(clearTimeout);
        demoProgressionTimersRef.current.delete(sessionId);
      }
    });

    // Set up progression timers for sessions that need them
    sessions.forEach(session => {
      const status = session.status || session.state;
      const claimTime = sessionClaimTimes.get(session.id);
      
      // Only progress sessions that have been claimed
      if (!claimTime || !session.assignedStaff?.boh) return;
      
      // Don't progress if already active or closed
      if (status === 'ACTIVE' || status === 'CLOSED' || status === 'CLOSE_PENDING') return;
      
      // Don't set up new timers if already running
      if (demoProgressionTimersRef.current.has(session.id)) return;

      const elapsed = Date.now() - claimTime;
      const timers: NodeJS.Timeout[] = [];

      // Accelerated demo timing (matches guest tracker 2-3 minute trial)
      const timings = {
        heatUp: 20000,        // 20s after CLAIM_PREP
        readyForDelivery: 60000,  // 60s total (40s after HEAT_UP)
        deliverNow: 120000,   // 120s total (60s after READY)
        markDelivered: 150000, // 150s total (30s after OUT_FOR_DELIVERY)
        startActive: 151000   // 151s total (1s after DELIVERED)
      };

      // Progress from PREP_IN_PROGRESS to HEAT_UP
      if (status === 'PREP_IN_PROGRESS' && elapsed < timings.heatUp) {
        const delay = Math.max(0, timings.heatUp - elapsed);
        timers.push(setTimeout(() => {
          console.log(`[Demo Auto-Progression] ${session.id}: PREP_IN_PROGRESS → HEAT_UP`);
          handleStatusChange(session.id, 'HEAT_UP');
        }, delay));
      }

      // Progress from HEAT_UP to READY_FOR_DELIVERY
      if (status === 'HEAT_UP' && elapsed < timings.readyForDelivery) {
        const delay = Math.max(0, timings.readyForDelivery - elapsed);
        timers.push(setTimeout(() => {
          console.log(`[Demo Auto-Progression] ${session.id}: HEAT_UP → READY_FOR_DELIVERY`);
          handleStatusChange(session.id, 'READY_FOR_DELIVERY');
        }, delay));
      }

      // Progress from READY_FOR_DELIVERY to OUT_FOR_DELIVERY (DELIVER_NOW)
      if (status === 'READY_FOR_DELIVERY' && elapsed < timings.deliverNow) {
        const delay = Math.max(0, timings.deliverNow - elapsed);
        timers.push(setTimeout(() => {
          console.log(`[Demo Auto-Progression] ${session.id}: READY_FOR_DELIVERY → OUT_FOR_DELIVERY`);
          handleStatusChange(session.id, 'DELIVER_NOW');
        }, delay));
      }

      // Progress from OUT_FOR_DELIVERY to DELIVERED
      if (status === 'OUT_FOR_DELIVERY' && elapsed < timings.markDelivered) {
        const delay = Math.max(0, timings.markDelivered - elapsed);
        timers.push(setTimeout(() => {
          console.log(`[Demo Auto-Progression] ${session.id}: OUT_FOR_DELIVERY → DELIVERED`);
          handleStatusChange(session.id, 'MARK_DELIVERED');
        }, delay));
      }

      // Progress from DELIVERED to ACTIVE
      if (status === 'DELIVERED' && elapsed < timings.startActive) {
        const delay = Math.max(0, timings.startActive - elapsed);
        timers.push(setTimeout(() => {
          console.log(`[Demo Auto-Progression] ${session.id}: DELIVERED → ACTIVE`);
          handleStatusChange(session.id, 'START_ACTIVE');
        }, delay));
      }

      // Store timers in ref
      if (timers.length > 0) {
        demoProgressionTimersRef.current.set(session.id, timers);
      }
    });

    // Cleanup function
    return () => {
      demoProgressionTimersRef.current.forEach((timers) => {
        timers.forEach(clearTimeout);
      });
      demoProgressionTimersRef.current.clear();
    };
  }, [sessions, isDemoMode, sessionClaimTimes, handleStatusChange]);

  const getThemeClasses = () => {
    return `bg-gradient-to-br ${currentTheme.gradients.background} text-${currentTheme.colors.text}`;
  };

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      <Suspense fallback={<div className="h-16 bg-zinc-950 border-b border-zinc-800"></div>}>
        <GlobalNavigation />
      </Suspense>
      
      {/* First Light Banner - Show when not in demo mode */}
      {!isDemoMode && (
        <FirstLightBanner 
          onRunTest={() => {
            setShowCreateModal(true);
          }}
        />
      )}

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
            <button
              onClick={() => {
                // Create a demo session and redirect to guest tracker
                const demoSessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const guestTrackerUrl = process.env.NEXT_PUBLIC_GUEST_URL || 'https://guest.hookahplus.net';
                const loungeId = demoLounge || 'default-lounge';
                const tableId = 'T-001';
                
                // Use accelerated demo mode (2-3 minute trial)
                const trackerUrl = `${guestTrackerUrl}/hookah-tracker?sessionId=${demoSessionId}&loungeId=${loungeId}&tableId=${tableId}&demo=true&mode=demo&accelerated=true`;
                
                console.log('[Demo Mode] 🎭 Launching accelerated guest experience:', trackerUrl);
                window.open(trackerUrl, '_blank');
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Try Guest Experience (2-3 min)
            </button>
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
              {!isDemoMode && (
                <div className="flex items-center space-x-2">
                  <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={firstLightFocus}
                      onChange={(e) => setFirstLightFocus(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-teal-500 focus:ring-teal-500"
                    />
                    <span>First Light Focus</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* First Light Achievement Celebration */}
        {!isDemoMode && firstLightAchieved && (
          <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-green-500/20 border-2 border-teal-500/50 rounded-lg p-6 shadow-lg shadow-teal-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      🎉 First Light Achieved! 🎉
                    </h3>
                    <p className="text-teal-200">
                      Your first session has been created and persisted to the database!
                    </p>
                    <p className="text-teal-300/80 text-sm mt-1">
                      Session count: <span className="font-bold text-teal-200">{sessions.length}</span> • Database: <span className="font-bold text-teal-200">Connected</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFirstLightAchieved(false)}
                  className="text-zinc-400 hover:text-white transition-colors px-3 py-1"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* First Light Health Card and Checklist - Show when First Light Focus is ON */}
        {!isDemoMode && firstLightFocus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FirstLightHealthCard />
            <FirstLightChecklist 
              sessionsCount={sessions.length}
              databaseConnected={databaseConnected}
            />
          </div>
        )}

        {/* Clear Old Sessions Button - First Light Mode Only */}
        {!isDemoMode && firstLightFocus && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={async () => {
                if (confirm('Clear all sessions older than 1 hour? This will help focus on First Light testing.\n\nOnly sessions from the last hour will be kept.')) {
                  try {
                    const response = await fetch('/api/sessions/clear-old?keepRecent=1', {
                      method: 'DELETE',
                    });
                    const data = await response.json();
                    if (data.success) {
                      alert(`✅ Cleared ${data.deleted} old sessions.\n\nKept sessions from the last hour.`);
                      await refreshSessions();
                    } else {
                      alert(`❌ Failed to clear sessions: ${data.error || 'Unknown error'}`);
                    }
                  } catch (error) {
                    console.error('Failed to clear old sessions:', error);
                    alert('❌ Failed to clear old sessions. Check console for details.');
                  }
                }
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              🗑️ Clear Old Sessions (Keep Last Hour)
            </button>
          </div>
        )}

        {/* Error Display - First Light messaging */}
        {error && !isDemoMode && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-300 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Sessions Engine Blocked</span>
            </div>
            <p className="text-red-200 text-sm mb-2">
              We could not connect to the database.
            </p>
            <p className="text-red-200/80 text-xs mb-3">
              Demo mode is disabled in First Light.
            </p>
            <div className="text-red-200/70 text-xs mb-3">
              <div className="font-medium mb-1">What this means:</div>
              <div>Your data is not persisting yet.</div>
            </div>
            <div className="text-red-200/70 text-xs mb-3">
              <div className="font-medium mb-1">Likely causes:</div>
              <ul className="list-disc list-inside space-y-0.5">
                <li>DATABASE_URL missing in this environment</li>
                <li>Database is asleep or unreachable</li>
                <li>Driver or pooling mismatch</li>
              </ul>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => refreshSessions()}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Retry
              </button>
              <a
                href="/docs/setup-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded transition-colors"
              >
                Open Setup Guide
              </a>
            </div>
          </div>
        )}

        {/* Metrics Status Message */}
        {!isDemoMode && firstLightFocus && !metricsEnabled && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-6 text-sm text-zinc-400">
            Metrics are paused during First Light. Sessions are the only required system for this milestone.
          </div>
        )}
        
        {/* Alpha Stability Banner */}
        {!isDemoMode && alphaStabilityMode && (
          <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-blue-500/50 rounded-lg p-6 shadow-lg shadow-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      🚀 Alpha Stability Mode Active
                    </h3>
                    <p className="text-blue-200">
                      Metrics are now enabled. Real-time analytics and performance monitoring are active.
                    </p>
                    <p className="text-blue-300/80 text-sm mt-1">
                      Metrics: <span className="font-bold text-blue-200">{metricsEnabled ? 'Enabled' : 'Disabled'}</span> • 
                      Sessions: <span className="font-bold text-blue-200">{sessions.length}</span> • 
                      Database: <span className="font-bold text-blue-200">Connected</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAlphaStabilityMode(false);
                    localStorage.removeItem('alphaStabilityMode');
                  }}
                  className="text-zinc-400 hover:text-white transition-colors px-3 py-1"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* First Light Achievement Celebration */}
        {!isDemoMode && firstLightAchieved && !alphaStabilityMode && (
          <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 border border-green-700/50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-200 mb-2">
                  FIRST LIGHT ACHIEVED
                </h3>
                <p className="text-green-100 text-sm mb-4">
                  The core sessions engine has run successfully with live data.
                  You have cleared the baseline for business-grade stabilization.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      // Enable metrics API
                      setMetricsEnabled(true);
                      setFirstLightFocus(false);
                      // Store in localStorage to persist across refreshes
                      localStorage.setItem('metricsEnabled', 'true');
                      // Refresh metrics to load real data
                      await refreshSessions();
                      console.log('[Dashboard] ✅ Metrics enabled - Alpha Stability mode activated');
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Enable Metrics
                  </button>
                  <button
                    onClick={async () => {
                      // Transition to Alpha Stability
                      setAlphaStabilityMode(true);
                      setMetricsEnabled(true);
                      setFirstLightFocus(false);
                      // Store in localStorage
                      localStorage.setItem('alphaStabilityMode', 'true');
                      localStorage.setItem('metricsEnabled', 'true');
                      // Refresh sessions to ensure we have the latest data
                      await refreshSessions();
                      // Hide the celebration banner
                      setFirstLightAchieved(false);
                      // Scroll to sessions
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      console.log('[Dashboard] ✅ Alpha Stability mode activated - Metrics enabled');
                    }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Continue to Alpha Stability
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Persistent Alpha Stability Controls - Show even after banner is dismissed */}
        {!isDemoMode && !alphaStabilityMode && !metricsEnabled && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">🚀 Spark the Flywheel</h4>
                <p className="text-xs text-zinc-400">First Light complete! Enable metrics and activate Alpha Stability to unlock the full Night After Night flow.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setMetricsEnabled(true);
                    localStorage.setItem('metricsEnabled', 'true');
                    await refreshSessions();
                  }}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Enable Metrics
                </button>
                <button
                  onClick={async () => {
                    setAlphaStabilityMode(true);
                    setMetricsEnabled(true);
                    localStorage.setItem('alphaStabilityMode', 'true');
                    localStorage.setItem('metricsEnabled', 'true');
                    await refreshSessions();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Alpha Stability
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Flywheel Status - Show when we have paid sessions ready for workflow */}
        {!isDemoMode && sessions.some(s => {
          const status = s.status || (s.state === 'PENDING' && (s.paymentStatus === 'succeeded' || s.externalRef?.startsWith('cs_')) ? 'PAID_CONFIRMED' : 'NEW');
          return status === 'PAID_CONFIRMED';
        }) && (
          <div className="mb-6 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 border-2 border-orange-500/50 rounded-lg p-6 shadow-lg shadow-orange-500/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center animate-pulse">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">
                  🔥 Flywheel Ready to Spark!
                </h3>
                <p className="text-orange-200 mb-2">
                  You have paid sessions ready for the Night After Night flow.
                </p>
                <p className="text-orange-300/80 text-sm">
                  Paid Sessions: <span className="font-bold text-orange-200">
                    {sessions.filter(s => {
                      const status = s.status || (s.state === 'PENDING' && (s.paymentStatus === 'succeeded' || s.externalRef?.startsWith('cs_')) ? 'PAID_CONFIRMED' : 'NEW');
                      return status === 'PAID_CONFIRMED';
                    }).length}
                  </span> • 
                  Next Action: <span className="font-bold text-orange-200">BOH: Claim Prep</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Session Management */}
        <SimpleFSDDesign
          sessions={sessions}
          userRole={userRole}
          refreshSessions={refreshSessions}
          onSessionAction={handleStatusChange}
          isDemoMode={isDemoMode}
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
          demoSource={effectiveDemoSource}
        />
    </div>
  );
}