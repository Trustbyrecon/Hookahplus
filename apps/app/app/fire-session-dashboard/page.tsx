"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
  CheckCircle,
  Share2,
  Building2,
  MapPin
} from 'lucide-react';
import { SessionStatus } from '../../types/session';
import Breadcrumbs from '../../components/Breadcrumbs';
import PageHero from '../../components/PageHero';
import SyncIndicator from '../../components/SyncIndicator';
import RelatedSessions from '../../components/RelatedSessions';
import PulseCard from '../../components/PulseCard';
import FirstLightBanner from '../../components/FirstLightBanner';
import { WeekOneWinsCard } from '../../components/launchpad/WeekOneWinsCard';
import { PreviewModeBanner } from '../../components/launchpad/PreviewModeBanner';
import { SoftLaunchBanner } from '../../components/launchpad/SoftLaunchBanner';
import ShiftGuide from '../../components/ShiftGuide';
import { HPlusOperatorPanel } from '../../components/operator/HPlusOperatorPanel';
import { getFeatureFlags, markFirstLightCompleted, enableMetrics, activateAlphaStability } from '../../lib/feature-flags';
import { useLoungeLayoutMode } from '../../hooks/useLoungeLayoutMode';

const SELECT_ALL_LOCATIONS = '__all_locations__';

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
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userRole, setUserRole] = useState<'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'>('MANAGER');
  const [demoSessionCreated, setDemoSessionCreated] = useState(false);
  const [firstLightFocus, setFirstLightFocus] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [firstLightAchieved, setFirstLightAchieved] = useState(false);
  const [previousSessionCount, setPreviousSessionCount] = useState(0);
  const [alphaStabilityMode, setAlphaStabilityMode] = useState(false);
  const [metricsEnabled, setMetricsEnabled] = useState(false);
  // Initialize with defaults to avoid hydration mismatch (getFeatureFlags uses window/localStorage)
  const [featureFlags, setFeatureFlags] = useState<ReturnType<typeof getFeatureFlags>>({
    firstLightCompleted: false,
    firstLightFocus: false,
    metricsEnabled: false,
    alphaStabilityActive: false,
    isDevelopment: false,
    isProduction: false,
    isDemoMode: false,
    showFirstLightBanner: true,
    showFirstLightHealthCard: false,
    showFirstLightChecklist: false,
    showTestSessionButton: false,
    showClearOldSessions: false,
    showFirstLightFocusToggle: false,
    showAlphaStabilityBanners: false,
    showFlywheelBanner: false,
  });
  const [sessionClaimTimes, setSessionClaimTimes] = useState<Map<string, number>>(new Map());
  const demoProgressionTimersRef = useRef<Map<string, NodeJS.Timeout[]>>(new Map());
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const normalizeRole = (role: string | null): 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN' => {
    const upper = (role || '').toUpperCase();
    if (upper === 'BOH' || upper === 'FOH' || upper === 'ADMIN' || upper === 'MANAGER') {
      return upper as any;
    }
    return 'MANAGER';
  };
  
  // Listen for global role changes (from GlobalNavigation) and sync locally
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const readRole = () => {
      const stored = localStorage.getItem('active_role');
      if (stored) {
        setUserRole(normalizeRole(stored));
      }
    };
    
    const handleRoleChange = (event: Event) => {
      const detailRole = (event as CustomEvent)?.detail?.role as string | undefined;
      if (detailRole) {
        setUserRole(normalizeRole(detailRole));
      } else {
        readRole();
      }
    };
    
    readRole();
    window.addEventListener('activeRoleChanged', handleRoleChange);
    window.addEventListener('storage', readRole);
    return () => {
      window.removeEventListener('activeRoleChanged', handleRoleChange);
      window.removeEventListener('storage', readRole);
    };
  }, []);
  
  // Check for demo mode from URL params
  const isDemoMode = searchParams.get('mode') === 'demo';
  
  // Update feature flags when localStorage changes (after mount to avoid hydration issues)
  useEffect(() => {
    const updateFlags = () => {
      const flags = getFeatureFlags();
      setFeatureFlags(flags);
      // Sync state with flags
      setFirstLightFocus(flags.firstLightFocus);
      setAlphaStabilityMode(flags.alphaStabilityActive);
      setMetricsEnabled(flags.metricsEnabled);
    };
    
    // Only update after mount (client-side only)
    if (typeof window !== 'undefined') {
      updateFlags();
      // Listen for storage changes (from other tabs)
      window.addEventListener('storage', updateFlags);
      return () => window.removeEventListener('storage', updateFlags);
    }
  }, []);

  const paymentConfirmed = searchParams.get('payment') === 'confirmed';
  const sessionIdFromUrl = searchParams.get('session');
  const demoLounge = searchParams.get('lounge') || null;
  const loungeIdsParam = searchParams.get('loungeIds');
  const organizationIdParam = searchParams.get('organizationId');
  const showWelcome = searchParams.get('welcome') === 'true';
  const fsdTabFromUrl = searchParams.get('tab') || searchParams.get('fsdTab');
  const demoSource = searchParams.get('source') as 'onboarding' | 'marketing' | null;
  const isDemoSlug = isDemoMode && demoLounge !== null; // True when accessed via /demo/[slug]
  const demoFlavorsParam = searchParams.get('flavors');
  const demoMenuFlavors = demoFlavorsParam ? demoFlavorsParam.split(',').filter(Boolean) : null;
  const parsedLoungeIds = React.useMemo(
    () => (loungeIdsParam || '').split(',').map((id) => id.trim()).filter(Boolean),
    [loungeIdsParam]
  );
  const [operatorLoungesFromApi, setOperatorLoungesFromApi] = useState<
    Array<{ loungeId: string; name: string; role: string }>
  >([]);

  const candidateLoungeIds = React.useMemo(
    () =>
      Array.from(
        new Set([
          ...(demoLounge ? [demoLounge] : []),
          ...parsedLoungeIds,
          ...operatorLoungesFromApi.map((l) => l.loungeId),
        ])
      ),
    [demoLounge, parsedLoungeIds, operatorLoungesFromApi]
  );

  useEffect(() => {
    if (isDemoMode || typeof window === 'undefined') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/me/operator-context', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (!data?.success || cancelled) return;
        setOperatorLoungesFromApi(Array.isArray(data.lounges) ? data.lounges : []);
      } catch {
        /* not signed in or API error — keep URL-only scope */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isDemoMode]);
  const candidateLoungeIdsKey = React.useMemo(
    () => candidateLoungeIds.join(','),
    [candidateLoungeIds]
  );
  const [selectedLoungeId, setSelectedLoungeId] = useState<string | null>(demoLounge || parsedLoungeIds[0] || null);
  const { useFloorPlan } = useLoungeLayoutMode(selectedLoungeId);

  // CODIGO: Unpause metrics when CODIGO instance is selected
  useEffect(() => {
    if (selectedLoungeId === 'CODIGO' && typeof window !== 'undefined' && localStorage.getItem('metricsEnabled') !== 'true') {
      enableMetrics();
      setMetricsEnabled(true);
    }
  }, [selectedLoungeId]);
  const [week1Rollup, setWeek1Rollup] = useState<{
    locationCount: number;
    activeLocations: number;
    totalWins: number;
    totalCompedSessionsAvoided: number;
    totalAddOnsCaptured: number;
    totalRepeatGuestsRecognized: number;
    avgTimeSavedPerShift: number;
  } | null>(null);
  const [rollupLoading, setRollupLoading] = useState(false);
  const [reconcileNowRunning, setReconcileNowRunning] = useState(false);
  const [reconcileNowMessage, setReconcileNowMessage] = useState<string | null>(null);
  const [reconcileNowOk, setReconcileNowOk] = useState<boolean | null>(null);
  const [reconcileStatusLoading, setReconcileStatusLoading] = useState(false);
  const [reconcileStatusRows, setReconcileStatusRows] = useState<
    Array<{
      loungeId: string;
      hasPolicyOverride?: boolean;
      effectivePolicy?: {
        cadenceMinutes: number;
        graceWindowMinutes: number;
        suppressionWindowMinutes: number;
        reconcileDeltaAlertMin: number;
        reconcileDeltaPctAlertMin: number;
      };
      lastRunId: string | null;
      lastWindowTo: string | null;
      updatedAt: string | null;
      drift24h: {
        total24h: number;
        critical24h: number;
        warning24h: number;
        byActionType?: Record<string, number>;
        latestActionType?: string | null;
        latestActionAt?: string | null;
      };
    }>
  >([]);
  const [reconcilePolicyDefaults, setReconcilePolicyDefaults] = useState<{
    cadenceMinutes: number;
    graceWindowMinutes: number;
    suppressionWindowMinutes: number;
    unassignedTicketAlertAfterRuns: number;
    reconcileDeltaAlertMin: number;
    reconcileDeltaPctAlertMin: number;
  } | null>(null);
  
  // Determine demo source: onboarding (from /demo/[slug]) or marketing (direct FSD access)
  const effectiveDemoSource: 'onboarding' | 'marketing' = demoSource || (isDemoSlug ? 'onboarding' : 'marketing');
  
  // Use session context for shared state
  const { sessions, metrics, loading, error, refreshSessions, updateSessionState, lastUpdated } = useSessionContext();
  const { currentTheme } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedLoungeId) {
      localStorage.setItem('active_lounge', selectedLoungeId);
    } else {
      localStorage.setItem('active_lounge', SELECT_ALL_LOCATIONS);
    }
    const url = new URL(window.location.href);
    if (selectedLoungeId) {
      url.searchParams.set('lounge', selectedLoungeId);
    } else {
      url.searchParams.delete('lounge');
    }
    window.history.replaceState({}, '', url.toString());
    refreshSessions();
  }, [selectedLoungeId, refreshSessions]);

  // When URL has loungeIds (e.g. loungeIds=CODIGO), prefer URL scope over localStorage.
  // This ensures CODIGO and other single-lounge flows show the correct scope instead of "All locations (org-wide)".
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (parsedLoungeIds.length > 0 && selectedLoungeId !== parsedLoungeIds[0]) {
      setSelectedLoungeId(parsedLoungeIds[0]);
      return;
    }
    if (selectedLoungeId) return;
    const remembered = localStorage.getItem('active_lounge');
    if (remembered === SELECT_ALL_LOCATIONS) {
      return;
    }
    if (remembered && candidateLoungeIds.includes(remembered)) {
      setSelectedLoungeId(remembered);
    }
  }, [candidateLoungeIds, selectedLoungeId, parsedLoungeIds]);

  useEffect(() => {
    if (selectedLoungeId === null) return;
    if (selectedLoungeId && candidateLoungeIds.includes(selectedLoungeId)) return;
    setSelectedLoungeId(candidateLoungeIds[0] || null);
  }, [candidateLoungeIds, selectedLoungeId]);

  useEffect(() => {
    async function fetchWeek1Rollup() {
      if (isDemoMode) return;
      if (!organizationIdParam && candidateLoungeIds.length < 2) {
        setWeek1Rollup(null);
        return;
      }
      setRollupLoading(true);
      try {
        const query = organizationIdParam
          ? `organizationId=${encodeURIComponent(organizationIdParam)}`
          : `loungeIds=${encodeURIComponent(candidateLoungeIds.join(','))}`;
        const response = await fetch(`/api/launchpad/week1-wins?${query}`);
        if (!response.ok) return;
        const data = await response.json();
        setWeek1Rollup(data.metrics || null);
      } catch (err) {
        console.error('[FSD] Failed to fetch week-1 rollup:', err);
      } finally {
        setRollupLoading(false);
      }
    }
    fetchWeek1Rollup();
  }, [isDemoMode, organizationIdParam, candidateLoungeIds, candidateLoungeIdsKey]);

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
    // CODIGO operator: always call API to create real session (ACTIVE for floor)
    const codigoOperator = sessionData?.codigoOperator === true;
    // In demo mode (and not CODIGO), create in-memory session and inject so Claim Prep / NAN flow work
    if (isDemoMode && !codigoOperator) {
      console.log('[Create Session] 🎭 Demo Mode: Creating in-memory demo session (no API call)');
      const now = Date.now();
      const demoSessionId = `demo-session-${now}-${Math.random().toString(36).substr(2, 9)}`;
      const tableId = sessionData?.table_id || sessionData?.tableId || `T-${String(Math.floor(Math.random() * 900) + 100)}`;
      const customerName = sessionData?.customer_name || sessionData?.customerName || 'Demo Guest';
      const demoSession = {
        id: demoSessionId,
        tableId,
        customerName,
        customerPhone: sessionData?.customer_phone || sessionData?.customerPhone || '',
        flavor: sessionData?.flavor_mix ? (Array.isArray(sessionData.flavor_mix) ? sessionData.flavor_mix.join(' + ') : sessionData.flavor_mix) : 'Double Apple + Mint',
        amount: sessionData?.amount ? Math.round(Number(sessionData.amount) * 100) : 2500,
        status: 'PAID_CONFIRMED' as const,
        state: 'PENDING' as const,
        paymentStatus: 'succeeded',
        externalRef: `test_cs_${demoSessionId}`,
        stage: 'Payment' as const,
        action: undefined,
        currentStage: 'BOH' as const,
        assignedStaff: { boh: undefined, foh: undefined },
        createdAt: now,
        updatedAt: now,
        sessionStartTime: undefined,
        sessionDuration: (sessionData?.timer_duration ? Number(sessionData.timer_duration) * 60 : 45 * 60),
        coalStatus: 'active' as const,
        refillStatus: 'none' as const,
        notes: '',
        edgeCase: null,
        bohState: undefined,
        guestTimerDisplay: false
      };
      try {
        window.dispatchEvent(new CustomEvent('hp:addDemoSession', { detail: { session: demoSession } }));
      } catch (e) {
        console.warn('[Create Session] hp:addDemoSession dispatch failed:', e);
      }
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
        flavorMix: Array.isArray(sessionData.flavor_mix) ? sessionData.flavor_mix : undefined,
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
        // CODIGO operator flow: treat as paid (Toast handles payment)
        isDemo: sessionData.isDemo ?? sessionData.codigoOperator ?? isDemoMode,
        codigoOperator: sessionData.codigoOperator ?? (sessionData.lounge_id === 'CODIGO' || selectedLoungeId === 'CODIGO'),
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
      
      // If DB fallback mode is active, sessions won't persist via GET /api/sessions.
      // Inject the returned session into the in-memory dashboard so the user can keep testing.
      if (responseData?.fallbackMode && responseData?.session) {
        try {
          window.dispatchEvent(new CustomEvent('hp:addDemoSession', { detail: { session: responseData.session } }));
        } catch (e) {
          // non-blocking
        }
      }

      // CODIGO: Optimistically inject session so card appears immediately (avoids tenantId/refresh delay)
      if (responseData?.session && (apiPayload?.codigoOperator || apiPayload?.loungeId === 'CODIGO' || selectedLoungeId === 'CODIGO')) {
        try {
          window.dispatchEvent(new CustomEvent('hp:addSession', { detail: { session: responseData.session } }));
        } catch (e) {
          // non-blocking
        }
      }

      await refreshSessions(); // Refresh live data (may be empty in fallback mode)
      // CODIGO: double-refresh for faster Floor→Kitchen propagation (catches DB lag)
      const isCodigo = apiPayload?.codigoOperator || apiPayload?.loungeId === 'CODIGO' || selectedLoungeId === 'CODIGO';
      if (isCodigo) {
        setTimeout(() => refreshSessions(), 500);
        // Signal SimpleFSDDesign to switch to Hookah Room tab (steady-state card + Night After Night flow)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('hp:switchToHookahRoom'));
        }
      }

      // Return session ID for payment checkout
      return responseData.session?.id || responseData.id;
    } catch (error) {
      console.error('[Create Session] Error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      const displayMsg = msg.includes('Failed to fetch') || msg.includes('NetworkError')
        ? 'Network error. Check your connection and try again.'
        : msg;
      alert(`Failed to create session: ${displayMsg}`);
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

  const loadReconcileStatus = React.useCallback(async () => {
    if (isDemoMode || candidateLoungeIds.length === 0) {
      setReconcileStatusRows([]);
      return;
    }
    setReconcileStatusLoading(true);
    try {
      const query = `loungeIds=${encodeURIComponent(candidateLoungeIds.join(","))}`;
      const response = await fetch(`/api/admin/pos/reconcile-status?${query}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data?.lounges)) {
        setReconcileStatusRows(data.lounges);
      } else {
        setReconcileStatusRows([]);
      }
      if (data?.policyDefaults) {
        setReconcilePolicyDefaults(data.policyDefaults);
      }
    } catch (error) {
      console.error("[FSD] failed to load reconcile status", error);
      setReconcileStatusRows([]);
    } finally {
      setReconcileStatusLoading(false);
    }
  }, [isDemoMode, candidateLoungeIds, candidateLoungeIdsKey]);

  useEffect(() => {
    loadReconcileStatus();
  }, [loadReconcileStatus]);

  const handleRunReconcileNow = async () => {
    const targetLounges = selectedLoungeId ? [selectedLoungeId] : candidateLoungeIds;
    if (targetLounges.length === 0) {
      setReconcileNowOk(false);
      setReconcileNowMessage("No lounge scope found. Select a location or pass loungeIds in the URL.");
      return;
    }

    setReconcileNowRunning(true);
    setReconcileNowMessage(null);
    setReconcileNowOk(null);

    try {
      const response = await fetch("/api/admin/pos/reconcile-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loungeIds: targetLounges }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(data?.details || data?.error || `HTTP ${response.status}`);
      }

      const failed = typeof data?.failed === "number" ? data.failed : 0;
      const requested = Array.isArray(data?.requestedLounges) ? data.requestedLounges.length : targetLounges.length;
      const processedCount = typeof data?.processed?.processed === "number" ? data.processed.processed : undefined;
      const processedText = processedCount != null ? `, processed ${processedCount} raw events` : "";
      setReconcileNowOk(failed === 0);
      setReconcileNowMessage(
        failed === 0
          ? `Reconcile completed for ${requested} lounge(s)${processedText}.`
          : `Reconcile completed with ${failed} failure(s) across ${requested} lounge(s).`,
      );
      refreshSessions();
      loadReconcileStatus();
    } catch (error) {
      setReconcileNowOk(false);
      setReconcileNowMessage(error instanceof Error ? error.message : "Failed to run reconcile now.");
    } finally {
      setReconcileNowRunning(false);
    }
  };

  const getReconcileSeverity = (row: {
    drift24h: { critical24h: number; warning24h: number; total24h: number };
  }): "critical" | "watch" | "healthy" => {
    if (row.drift24h.critical24h > 0) return "critical";
    if (row.drift24h.warning24h > 0 || row.drift24h.total24h > 0) return "watch";
    return "healthy";
  };

  const getSeverityStyle = (severity: "critical" | "watch" | "healthy") => {
    if (severity === "critical") {
      return {
        label: "Critical",
        className: "border-red-500/50 bg-red-500/15 text-red-200",
      };
    }
    if (severity === "watch") {
      return {
        label: "Watch",
        className: "border-amber-500/50 bg-amber-500/15 text-amber-200",
      };
    }
    return {
      label: "Healthy",
      className: "border-emerald-500/50 bg-emerald-500/15 text-emerald-200",
    };
  };

  const getEscalationHint = (row: {
    drift24h: { critical24h: number; warning24h: number; total24h: number };
  }) => {
    if (row.drift24h.critical24h > 0) {
      return {
        text: "Escalated: critical drift detected. Open POS Ops and verify Slack alert delivery.",
        className: "text-red-300",
      };
    }
    if (row.drift24h.warning24h >= 2) {
      return {
        text: "Escalation threshold met: 2+ warnings in 24h. Confirm suppression window and monitor next run.",
        className: "text-amber-300",
      };
    }
    if (row.drift24h.warning24h === 1) {
      return {
        text: "Watch: first warning in 24h. Escalates on repeated warning across consecutive runs.",
        className: "text-amber-300",
      };
    }
    return {
      text: "Healthy: no drift escalation signals in the last 24h.",
      className: "text-emerald-300",
    };
  };

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      <Suspense fallback={<div className="h-16 bg-zinc-950 border-b border-zinc-800"></div>}>
        <GlobalNavigation />
      </Suspense>
      
      {/* First Light Banner - Show based on feature flags, hidden for CODIGO (floor leads) */}
      {featureFlags.showFirstLightBanner && !useFloorPlan && (
        <FirstLightBanner 
          onRunTest={() => {
            setShowCreateModal(true);
          }}
        />
      )}

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 border-b border-teal-500/30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            <Shield className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-medium text-teal-200">
                Demo Mode — safe to tap everything, no real payments.
              </p>
              {demoLounge && (
                <p className="text-xs text-teal-300/70 mt-0.5">
                  Testing: {demoLounge.replace(/-/g, ' ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Flame className="w-4 h-4" />
                Start Demo Session
              </button>
              <button
                onClick={() => {
                  // Launch accelerated guest experience only (no staff actions required)
                  const demoSessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  const guestTrackerUrl = process.env.NEXT_PUBLIC_GUEST_URL || 'https://guest.hookahplus.net';
                  const loungeId = demoLounge || 'default-lounge';
                  const tableId = 'T-001';
                  
                  const trackerUrl = `${guestTrackerUrl}/hookah-tracker?sessionId=${demoSessionId}&loungeId=${loungeId}&tableId=${tableId}&demo=true&mode=demo&accelerated=true`;
                  
                  console.log('[Demo Mode] 🎭 Launching accelerated guest experience:', trackerUrl);
                  window.open(trackerUrl, '_blank');
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Try Guest Experience (2-3 min)
              </button>
              <button
                onClick={() => {
                  // Generate shareable demo link - points to guest portal to start from beginning
                  const guestTrackerUrl = process.env.NEXT_PUBLIC_GUEST_URL || 'https://guest.hookahplus.net';
                  const loungeId = demoLounge || 'default-lounge';
                  
                  // Point to guest portal with demo mode - they'll go through full ordering flow
                  const shareUrl = `${guestTrackerUrl}/?loungeId=${loungeId}&demo=true&mode=demo&accelerated=true`;
                  
                  // Copy to clipboard
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      // Show success notification
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md';
                      notification.textContent = '✅ Share link copied to clipboard!';
                      document.body.appendChild(notification);
                      setTimeout(() => {
                        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                        setTimeout(() => notification.remove(), 300);
                      }, 3000);
                    }).catch(err => {
                      console.error('Failed to copy:', err);
                      // Fallback: show in alert
                      alert(`Share this link:\n\n${shareUrl}`);
                    });
                  } else {
                    // Fallback for older browsers
                    alert(`Share this link:\n\n${shareUrl}`);
                  }
                  
                  console.log('[Demo Mode] 📋 Share link generated:', shareUrl);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Guest Link
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <Breadcrumbs className="mb-6" />
        </Suspense>
        
        {/* CODIGO: Compact hero — live session-derived metrics, Shisha Master CTA */}
        {useFloorPlan ? (
          <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-lg font-semibold text-white">Fire Session Dashboard</span>
                <span className="text-emerald-400 font-medium">
                  {sessions.filter((s) => {
                    const st = s.status || s.state;
                    return ['ACTIVE', 'DELIVERED', 'OUT_FOR_DELIVERY', 'PAID_CONFIRMED', 'PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(st);
                  }).length} Active
                </span>
                <span className="text-zinc-400">
                  ${sessions.reduce((sum, s) => sum + ((s.amount ?? 0) / 100), 0).toFixed(0)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium flex items-center gap-2"
                  data-testid="create-session-cta"
                >
                  <Flame className="w-4 h-4" />
                  Shisha Master
                </button>
              </div>
            </div>
          </section>
        ) : (
          <PageHero
            headline="Fire Session Dashboard"
            subheadline="Real-time session management with intelligent workflow automation. Monitor live sessions, manage BOH/FOH workflows, and optimize operations."
            benefit={{
              value: hasMounted ? `${metrics.activeSessions} Active Sessions` : '... Active Sessions',
              description: hasMounted ? `$${metrics.revenue.toFixed(2)} revenue • ${metrics.staffAssigned} staff assigned` : 'Loading metrics...',
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
              { icon: <AlertCircle className="w-4 h-4" />, text: hasMounted ? `${metrics.alerts} alerts` : '... alerts' }
            ]}
          />
        )}

        {/* Daily Pulse Card - Hidden in demo mode and CODIGO (floor leads) */}
        {!isDemoMode && !useFloorPlan && (
          <div className="mb-6">
            <PulseCard 
              compact={true} 
              window="24h" 
              autoRefresh={true}
              loungeId={selectedLoungeId || undefined}
            />
          </div>
        )}

        {/* H+ Operator — tool-calling assistant wired to /api/sessions + command API */}
        {!isDemoMode && (
          <HPlusOperatorPanel
            loungeId={selectedLoungeId}
            onActionComplete={() => refreshSessions()}
            defaultOpen={!useFloorPlan}
          />
        )}

        {/* Sync Indicator - Hidden in demo mode */}
        {!isDemoMode && (
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <SyncIndicator
              lastUpdated={lastUpdated}
              isLoading={hasMounted ? loading : false}
              error={error}
              autoRefreshInterval={30}
              isDemoMode={isDemoMode}
            />
            <div className="flex items-center gap-4">
              <button
                onClick={() => refreshSessions()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
                disabled={hasMounted ? loading : false}
              >
                <RefreshCw className={`w-4 h-4 ${hasMounted && loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-zinc-400">Role:</span>
                <span className="text-sm font-semibold text-white px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
                  {userRole}
                </span>
              </div>
              {featureFlags.showFirstLightFocusToggle && (
                <div className="flex items-center space-x-2">
                  <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={firstLightFocus}
                      onChange={(e) => {
                        setFirstLightFocus(e.target.checked);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('firstLightFocus', String(e.target.checked));
                        }
                      }}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-teal-500 focus:ring-teal-500"
                    />
                    <span>First Light Focus</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* First Light Achievement Celebration - Reduced visibility, collapsible */}
        {!isDemoMode && firstLightAchieved && !featureFlags.firstLightCompleted && (
          <div className="mb-4">
            <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-zinc-400">First session created successfully</span>
                </div>
                <button
                  onClick={() => {
                    setFirstLightAchieved(false);
                    markFirstLightCompleted();
                    setFeatureFlags(getFeatureFlags());
                  }}
                  className="text-zinc-500 hover:text-zinc-400 transition-colors px-2 py-1 text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Banner - Show after LaunchPad completion */}
        {showWelcome && (
          <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-green-500/20 border-2 border-teal-500/50 rounded-lg p-6 shadow-lg shadow-teal-500/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse shrink-0">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      🎉 Welcome to H+! 🎉
                    </h3>
                    <p className="text-teal-200 mb-3">
                      Your lounge is live! Start creating sessions and track your Week-1 Wins.
                    </p>
                    {selectedLoungeId && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-zinc-400">Lounge ID:</span>
                        <code className="text-sm text-teal-300 font-mono bg-zinc-900/60 px-2 py-1 rounded break-all">
                          {selectedLoungeId}
                        </code>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(selectedLoungeId)}
                          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300"
                        >
                          Copy
                        </button>
                        <a
                          href={`/onboarding/${selectedLoungeId}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-400 hover:text-teal-300"
                        >
                          Continue to Onboarding →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.delete('welcome');
                    window.history.replaceState({}, '', newUrl);
                    window.location.reload();
                  }}
                  className="text-zinc-400 hover:text-white transition-colors px-3 py-1 shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Mode Banner - Show if lounge is in preview mode */}
        {!isDemoMode && demoLounge && (
          <div className="mb-6">
            <PreviewModeBanner
              loungeId={demoLounge}
              onActivate={() => {
                // Refresh sessions after activation
                refreshSessions();
              }}
            />
          </div>
        )}

        {/* Soft Launch Banner - Show when lounge has soft launch enabled */}
        {!isDemoMode && selectedLoungeId && (
          <SoftLaunchBanner loungeId={selectedLoungeId} />
        )}

        {/* Operator location context — URL scope + lounges from your account (after /select-lounge) */}
        {!isDemoMode && candidateLoungeIds.length > 0 && (
          <div className="mb-6 bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-zinc-300 mb-3">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium">Operator location</span>
              {operatorLoungesFromApi.length > 0 && (
                <span className="text-[10px] text-zinc-500 font-normal">(signed-in)</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-zinc-400">Active location:</label>
              <select
                value={selectedLoungeId || SELECT_ALL_LOCATIONS}
                onChange={(e) => setSelectedLoungeId(e.target.value === SELECT_ALL_LOCATIONS ? null : e.target.value)}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white min-w-[12rem]"
              >
                <option value={SELECT_ALL_LOCATIONS}>All locations (org-wide)</option>
                {candidateLoungeIds.map((id) => (
                  <option key={id} value={id}>
                    {operatorLoungesFromApi.find((l) => l.loungeId === id)?.name || id}
                  </option>
                ))}
              </select>
              <Link
                href={`/select-lounge?next=${encodeURIComponent('/fire-session-dashboard')}`}
                className="text-xs text-teal-400 hover:text-teal-300"
              >
                Change location scope…
              </Link>
            </div>
            {week1Rollup && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-zinc-800/70 rounded-lg p-3">
                  <p className="text-xs text-zinc-400">Locations</p>
                  <p className="text-lg font-semibold text-white">{week1Rollup.locationCount}</p>
                </div>
                <div className="bg-zinc-800/70 rounded-lg p-3">
                  <p className="text-xs text-zinc-400">Active</p>
                  <p className="text-lg font-semibold text-white">{week1Rollup.activeLocations}</p>
                </div>
                <div className="bg-zinc-800/70 rounded-lg p-3">
                  <p className="text-xs text-zinc-400">Total Wins</p>
                  <p className="text-lg font-semibold text-teal-400">{week1Rollup.totalWins}</p>
                </div>
                <div className="bg-zinc-800/70 rounded-lg p-3">
                  <p className="text-xs text-zinc-400">Avg Time Saved/Shift</p>
                  <p className="text-lg font-semibold text-white">{week1Rollup.avgTimeSavedPerShift}m</p>
                </div>
              </div>
            )}
            {rollupLoading && (
              <p className="mt-3 text-xs text-zinc-500">Loading org rollup...</p>
            )}
            <div className="mt-4 border-t border-zinc-800 pt-3">
              <p className="text-xs font-medium text-zinc-400 mb-2">Phase C Ready</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRunReconcileNow}
                  disabled={reconcileNowRunning}
                  className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed border border-teal-600 text-xs text-white transition-colors"
                >
                  {reconcileNowRunning ? "Running reconcile..." : "Run reconcile now"}
                </button>
                <a
                  href="/admin/pos-inbox"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-200 transition-colors"
                >
                  Open POS Inbox
                </a>
                <a
                  href="/admin/pos-ops"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-200 transition-colors"
                >
                  Open POS Ops View
                </a>
                <a
                  href="/square/settings"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-200 transition-colors"
                >
                  Verify Square Status
                </a>
              </div>
              <div className="mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-zinc-300">Reconcile confidence (24h)</p>
                  {reconcileStatusLoading ? (
                    <span className="text-[11px] text-zinc-500">Loading...</span>
                  ) : (
                    <button
                      type="button"
                      onClick={loadReconcileStatus}
                      className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      Refresh
                    </button>
                  )}
                </div>
                {reconcilePolicyDefaults ? (
                  <p className="text-[11px] text-zinc-500 mb-2">
                    Org policy defaults: {reconcilePolicyDefaults.cadenceMinutes}m cadence, {reconcilePolicyDefaults.graceWindowMinutes}m grace,
                    {` `}alert on delta {">="} {reconcilePolicyDefaults.reconcileDeltaAlertMin}
                    {` `}or {reconcilePolicyDefaults.reconcileDeltaPctAlertMin}%.
                  </p>
                ) : null}
                {reconcileStatusRows.length === 0 ? (
                  <p className="text-[11px] text-zinc-500">No reconcile metadata yet.</p>
                ) : (
                  <div className="space-y-2">
                    {reconcileStatusRows
                      .filter((row) => (selectedLoungeId ? row.loungeId === selectedLoungeId : true))
                      .map((row) => (
                        <div key={row.loungeId} className="rounded border border-zinc-700 bg-zinc-900/50 px-2 py-2">
                          {(() => {
                            const hint = getEscalationHint(row);
                            return (
                              <>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-200 font-medium">{row.loungeId}</span>
                              {(() => {
                                const severity = getReconcileSeverity(row);
                                const style = getSeverityStyle(severity);
                                return (
                                  <div className="flex items-center gap-1">
                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${style.className}`}>
                                      {style.label}
                                    </span>
                                    {row.hasPolicyOverride ? (
                                      <span className="inline-flex items-center rounded-full border border-indigo-500/50 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-200">
                                        Override
                                      </span>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-zinc-400">
                                Last run: {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "Never"}
                              </span>
                              <a
                                href={`/admin/pos-ops?loungeId=${encodeURIComponent(row.loungeId)}`}
                                className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-200 hover:bg-zinc-700 transition-colors"
                              >
                                Open POS Ops
                              </a>
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-1">
                            Window end: {row.lastWindowTo ? new Date(row.lastWindowTo).toLocaleString() : "n/a"} ·
                            Drift 24h: {row.drift24h.total24h} total / {row.drift24h.warning24h} warning / {row.drift24h.critical24h} critical
                          </p>
                          {row.effectivePolicy ? (
                            <p className="text-[11px] text-zinc-500 mt-1">
                              Effective policy: {row.effectivePolicy.cadenceMinutes}m cadence · {row.effectivePolicy.graceWindowMinutes}m grace ·
                              delta {row.effectivePolicy.reconcileDeltaAlertMin} / {row.effectivePolicy.reconcileDeltaPctAlertMin}%
                            </p>
                          ) : null}
                          {row.drift24h.latestActionType ? (
                            <p className="text-[11px] text-zinc-400 mt-1">
                              Latest recon action: {row.drift24h.latestActionType}
                              {row.drift24h.latestActionAt ? ` (${new Date(row.drift24h.latestActionAt).toLocaleString()})` : ""}
                            </p>
                          ) : null}
                          <p className={`text-[11px] mt-1 ${hint.className}`}>
                            {hint.text}
                          </p>
                              </>
                            );
                          })()}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {reconcileNowMessage ? (
                <p className={`mt-3 text-xs ${reconcileNowOk ? "text-teal-300" : "text-amber-300"}`}>
                  {reconcileNowMessage}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Week-1 Wins Card - Show for active location */}
        {!isDemoMode && selectedLoungeId && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500">
              <MapPin className="w-3 h-3" />
              <span>Week-1 view for: {selectedLoungeId}</span>
            </div>
            <WeekOneWinsCard loungeId={selectedLoungeId} />
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

        {/* Metrics Status Message — hidden for CODIGO (metrics unpaused) */}
        {!isDemoMode && firstLightFocus && !metricsEnabled && selectedLoungeId !== 'CODIGO' && (
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

        {/* First Light Achievement Celebration - Consolidated */}
        {featureFlags.showAlphaStabilityBanners && firstLightAchieved && !alphaStabilityMode && (
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
                      enableMetrics();
                      setMetricsEnabled(true);
                      setFirstLightFocus(false);
                      // Refresh metrics to load real data
                      await refreshSessions();
                      setFeatureFlags(getFeatureFlags());
                      console.log('[Dashboard] ✅ Metrics enabled - Alpha Stability mode activated');
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Enable Metrics
                  </button>
                  <button
                    onClick={async () => {
                      // Transition to Alpha Stability
                      activateAlphaStability();
                      setAlphaStabilityMode(true);
                      setMetricsEnabled(true);
                      setFirstLightFocus(false);
                      // Refresh sessions to ensure we have the latest data
                      await refreshSessions();
                      // Hide the celebration banner
                      setFirstLightAchieved(false);
                      setFeatureFlags(getFeatureFlags());
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
        
        {/* Persistent Alpha Stability Controls - Reduced visibility */}
        {featureFlags.showAlphaStabilityBanners && !alphaStabilityMode && !metricsEnabled && (
          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">System ready for advanced features</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    enableMetrics();
                    setMetricsEnabled(true);
                    await refreshSessions();
                    setFeatureFlags(getFeatureFlags());
                  }}
                  className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-xs transition-colors"
                >
                  Enable Metrics
                </button>
                <button
                  onClick={async () => {
                    activateAlphaStability();
                    setAlphaStabilityMode(true);
                    setMetricsEnabled(true);
                    await refreshSessions();
                    setFeatureFlags(getFeatureFlags());
                  }}
                  className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-xs transition-colors"
                >
                  Alpha Stability
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Flywheel Status - Reduced visibility, smaller banner */}
        {featureFlags.showFlywheelBanner && sessions.some(s => {
          const status = s.status || (s.state === 'PENDING' && (s.paymentStatus === 'succeeded' || s.externalRef?.startsWith('cs_')) ? 'PAID_CONFIRMED' : 'NEW');
          return status === 'PAID_CONFIRMED';
        }) && (
          <div className="mb-4">
            <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-zinc-400">
                  {sessions.filter(s => {
                    const status = s.status || (s.state === 'PENDING' && (s.paymentStatus === 'succeeded' || s.externalRef?.startsWith('cs_')) ? 'PAID_CONFIRMED' : 'NEW');
                    return status === 'PAID_CONFIRMED';
                  }).length} paid session(s) ready for prep
                </span>
              </div>
            </div>
          </div>
        )}

        {/* P1: Shift start/end guide + closeout (habit + money motivation) */}
        <ShiftGuide />

        {/* Session Management */}
        <SimpleFSDDesign
          sessions={sessions}
          userRole={userRole}
          refreshSessions={refreshSessions}
          onSessionAction={handleStatusChange}
          onCreateSession={handleCreateSession}
          isDemoMode={isDemoMode}
          scopeLabel={selectedLoungeId || 'All locations (org-wide)'}
          loungeId={selectedLoungeId || undefined}
          useFloorPlan={useFloorPlan}
          requestedTab={fsdTabFromUrl}
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
          loungeId={demoLounge || selectedLoungeId || undefined}
        />
    </div>
  );
}