import { useState, useEffect, useCallback } from 'react';
import { FireSession, SessionTimer, TrackerStage, STATUS_TO_TRACKER_STAGE } from '../types/enhancedSession';
import { calculateRemainingTime, formatDuration } from '../lib/sessionStateMachine';

// Environment-based demo mode configuration
const USE_DEMO_MODE = process.env.NEXT_PUBLIC_USE_DEMO_MODE === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Generate rich demo data for Fire Session Dashboard
function generateRichDemoData(): FireSession[] {
  const now = Date.now();
  const thirtyMinutesAgo = now - (30 * 60 * 1000);

  return [
    // PAID_CONFIRMED session so NAN flows from Claim Prep (Payment → Prep → …)
    {
      id: 'demo-session-1',
      tableId: 'T-001',
      customerName: 'Demo Guest',
      customerPhone: '+1 (555) 000-0000',
      flavor: 'Double Apple + Mint',
      amount: 2500,
      status: 'PAID_CONFIRMED',
      state: 'PENDING',
      paymentStatus: 'succeeded',
      externalRef: 'test_cs_demo_session_1',
      stage: 'Payment',
      action: undefined,
      currentStage: 'BOH',
      assignedStaff: { boh: undefined, foh: undefined },
      createdAt: now - (2 * 60 * 1000),
      updatedAt: now,
      sessionStartTime: undefined,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: '',
      edgeCase: null,
      bohState: undefined,
      guestTimerDisplay: false
    },
    // Second PAID_CONFIRMED session for Claim Prep (Sarah & Friends)
    {
      id: 'demo-session-2',
      tableId: 'T-005',
      customerName: 'Sarah & Friends',
      customerPhone: '+1 (555) 234-5678',
      flavor: 'Blue Mist + Mint Fresh',
      amount: 3500,
      status: 'PAID_CONFIRMED',
      state: 'PENDING',
      paymentStatus: 'succeeded',
      externalRef: 'test_cs_demo_session_2',
      stage: 'Payment',
      action: undefined,
      currentStage: 'BOH',
      assignedStaff: { boh: undefined, foh: undefined },
      createdAt: thirtyMinutesAgo,
      updatedAt: now,
      sessionStartTime: undefined,
      sessionDuration: 60 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: '',
      edgeCase: null,
      bohState: undefined,
      guestTimerDisplay: false
    }
  ];
}

interface LiveMetrics {
  activeSessions: number;
  revenue: number;
  avgDuration: number;
  alerts: number;
  staffAssigned: number;
  totalSessions: number;
  changes: {
    activeSessions: string;
    revenue: string;
    avgDuration: string;
    alerts: string;
    staffAssigned: string;
    totalSessions: string;
  };
}

interface UseLiveSessionDataReturn {
  sessions: FireSession[];
  metrics: LiveMetrics;
  sessionTimers: Record<string, SessionTimer>;
  loading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  updateSessionState: (sessionId: string, action: string) => Promise<void>;
}

export function useLiveSessionData(): UseLiveSessionDataReturn {
  const [sessions, setSessions] = useState<FireSession[]>([]);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    activeSessions: 0,
    revenue: 0,
    avgDuration: 0,
    alerts: 0,
    staffAssigned: 0,
    totalSessions: 0,
    changes: {
      activeSessions: '0%',
      revenue: '0%',
      avgDuration: '0%',
      alerts: '0%',
      staffAssigned: '0%',
      totalSessions: '0%'
    }
  });
  const [sessionTimers, setSessionTimers] = useState<Record<string, SessionTimer>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Store updated demo sessions to persist across refreshes
  const [updatedDemoSessions, setUpdatedDemoSessions] = useState<Record<string, FireSession>>({});

  // Allow other UI components (like CreateSessionModal) to inject demo sessions in-memory
  useEffect(() => {
    const isDemoMode =
      typeof window !== 'undefined' &&
      window.location &&
      new URLSearchParams(window.location.search).get('mode') === 'demo';

    const handler = (event: Event) => {
      const detail = (event as CustomEvent)?.detail as { session?: FireSession } | undefined;
      const incoming = detail?.session;
      if (!incoming?.id) return;

      if (isDemoMode) {
        setUpdatedDemoSessions(prev => ({
          ...prev,
          [incoming.id]: incoming,
        }));
      }

      // Optimistically merge into current sessions (demo + CODIGO/production)
      setSessions(prev => {
        const idx = prev.findIndex(s => s.id === incoming.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = incoming;
          return copy;
        }
        return [...prev, incoming];
      });
    };

    window.addEventListener('hp:addDemoSession', handler as EventListener);
    window.addEventListener('hp:addSession', handler as EventListener);
    return () => {
      window.removeEventListener('hp:addDemoSession', handler as EventListener);
      window.removeEventListener('hp:addSession', handler as EventListener);
    };
  }, []);

  // Load live session data
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're in demo mode from URL
      const isDemoMode = typeof window !== 'undefined' && 
        window.location &&
        new URLSearchParams(window.location.search).get('mode') === 'demo';

      // In demo mode, skip API calls and use demo data directly
      if (isDemoMode) {
        console.log('[useLiveSessionData] 🎭 Demo Mode: Using in-memory demo data (no API calls)');
        const demoData = generateRichDemoData();
        
        // Merge updated demo sessions with generated demo data
        // This preserves user actions (like Claim Prep) across refreshes
        const mergedSessions = demoData.map(session => {
          const updatedSession = updatedDemoSessions[session.id];
          if (updatedSession) {
            console.log(`[Demo Mode] 🔄 Merging updated session: ${session.id}`, {
              original: session.status,
              updated: updatedSession.status
            });
            return updatedSession;
          }
          return session;
        });
        
        // Also add any new sessions that were created but don't exist in demo data
        Object.values(updatedDemoSessions).forEach(updatedSession => {
          if (!mergedSessions.find(s => s.id === updatedSession.id)) {
            console.log(`[Demo Mode] ➕ Adding new updated session: ${updatedSession.id}`);
            mergedSessions.push(updatedSession);
          }
        });
        
        setSessions(mergedSessions);
        setLoading(false);
        return;
      }

      console.log('[useLiveSessionData] Starting to load sessions...');
      
      // Load active sessions from root Prisma API
      // Add firstLightFocus param if First Light mode is enabled
      const sessionsUrl = new URL('/api/sessions', window.location.origin);
      const params = new URLSearchParams(window.location.search);
      // Support both lounge and loungeIds (CODIGO FSD uses loungeIds=CODIGO)
      const selectedLoungeId = params.get('lounge') || (params.get('loungeIds') || '').split(',')[0]?.trim() || null;
      if (selectedLoungeId) {
        sessionsUrl.searchParams.set('loungeId', selectedLoungeId);
      }
      if (process.env.NEXT_PUBLIC_FIRST_LIGHT_MODE === 'true' || 
          window.location.search.includes('firstLightFocus=true')) {
        sessionsUrl.searchParams.set('firstLightFocus', 'true');
      }
      console.log('[useLiveSessionData] Fetching from:', sessionsUrl.pathname + sessionsUrl.search);
      const sessionsResponse = await fetch(sessionsUrl.toString());
      console.log('[useLiveSessionData] Sessions response status:', sessionsResponse.status);
      
      if (!sessionsResponse.ok) {
        const errorText = await sessionsResponse.text();
        console.error('[useLiveSessionData] Sessions API error:', {
          status: sessionsResponse.status,
          statusText: sessionsResponse.statusText,
          body: errorText
        });
        
        // Try to parse error response for fallback mode
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.fallbackMode) {
            // Fallback mode - return empty state gracefully
            console.warn('[useLiveSessionData] ⚠️ Fallback mode active - database not configured');
            setSessions([]);
            setError(null);
            setMetrics({
              activeSessions: 0,
              revenue: 0,
              avgDuration: 0,
              alerts: 0,
              staffAssigned: 0,
              totalSessions: 0,
              changes: {
                activeSessions: '0%',
                revenue: '0%',
                avgDuration: '0%',
                alerts: '0%',
                staffAssigned: '0%',
                totalSessions: '0%'
              }
            });
            if (errorData.message) {
              console.info('[useLiveSessionData]', errorData.message);
            }
            return;
          }
        } catch {
          // Not JSON or no fallback mode, continue with error handling
        }
        
        // Provide user-friendly error message (First Light: no demo data fallback)
        if (sessionsResponse.status === 500) {
          throw new Error('Server error: Database connection failed. Check DATABASE_URL and ensure database is running.');
        } else if (sessionsResponse.status === 404) {
          throw new Error('Sessions endpoint not found.');
        } else {
          throw new Error(`HTTP ${sessionsResponse.status}: ${sessionsResponse.statusText || 'Failed to load sessions'}`);
        }
      }
      
      const sessionsResult = await sessionsResponse.json();
      console.log('[useLiveSessionData] Sessions result:', sessionsResult);

      // Handle graceful fallback mode (database not configured)
      if (sessionsResult.fallbackMode) {
        console.warn('[useLiveSessionData] ⚠️ Fallback mode active - database not configured');
        setSessions([]);
        setError(null); // Don't show error, just empty state
        setMetrics({
          activeSessions: 0,
          revenue: 0,
          avgDuration: 0,
          alerts: 0,
          staffAssigned: 0,
          totalSessions: 0,
          changes: {
            activeSessions: '0%',
            revenue: '0%',
            avgDuration: '0%',
            alerts: '0%',
            staffAssigned: '0%',
            totalSessions: '0%'
          }
        });
        // Log the message for developers
        if (sessionsResult.message) {
          console.info('[useLiveSessionData]', sessionsResult.message);
        }
        return;
      }

      if (sessionsResult.success) {
        // API already converts sessions using convertPrismaSessionToFireSession
        // which correctly sets the status field. Use that status directly instead of re-mapping.
        const fireSessions: FireSession[] = sessionsResult.sessions.map((session: any) => {
          // Parse flavorMix if it's a JSON string
          let flavorMix = session.flavorMix || session.flavor || 'Custom Mix';
          if (typeof flavorMix === 'string') {
            try {
              const parsed = JSON.parse(flavorMix);
              flavorMix = typeof parsed === 'string' ? parsed : parsed.join(' + ');
            } catch {
              // Keep as is if not valid JSON
            }
          }
          
          // Use the status from the API (already correctly mapped by convertPrismaSessionToFireSession)
          // The API's convertPrismaSessionToFireSession correctly handles:
          // - ACTIVE + assignedBOHId + payment → PREP_IN_PROGRESS
          // - PENDING + payment → PAID_CONFIRMED
          // So we should trust the API's status field
          let fireSessionStatus = session.status;
          const trackerStageToCurrent = (stage: TrackerStage): 'BOH' | 'FOH' | 'CUSTOMER' => {
            if (stage === 'Ready' || stage === 'Deliver') return 'FOH';
            if (stage === 'Light') return 'CUSTOMER';
            return 'BOH';
          };
          
          // Fallback: if status is missing, use the same logic as the API
          if (!fireSessionStatus) {
            const sessionState = session.state || 'PENDING';
            fireSessionStatus = mapPrismaStateToFireSession(sessionState);
            // Special handling: PENDING + paymentStatus 'succeeded' = PAID_CONFIRMED
            if (sessionState === 'PENDING' && session.paymentStatus === 'succeeded') {
              fireSessionStatus = 'PAID_CONFIRMED';
            }
            // Special handling: ACTIVE + assignedBOHId + payment = PREP_IN_PROGRESS
            const hasPayment = session.paymentStatus === 'succeeded' || 
                              (session.externalRef && (session.externalRef.startsWith('cs_') || session.externalRef.startsWith('test_cs_')));
            const assignedBOHId = session.assignedBOHId || session.assignedStaff?.boh;
            if (sessionState === 'ACTIVE' && assignedBOHId && hasPayment) {
              fireSessionStatus = 'PREP_IN_PROGRESS';
            }
          }
          
          const trackerStage: TrackerStage =
            (session.stage as TrackerStage) ||
            STATUS_TO_TRACKER_STAGE[fireSessionStatus as keyof typeof STATUS_TO_TRACKER_STAGE] ||
            'Payment';
          return {
            id: session.id,
            tableId: session.tableId || session.externalRef || 'Unknown',
            customerName: session.customerRef || session.customerName || 'Anonymous',
            customerPhone: session.customerPhone || '',
            flavor: flavorMix,
            amount: session.priceCents || session.amount || 0,
            status: fireSessionStatus,
            stage: trackerStage,
            action: session.action,
            currentStage: trackerStageToCurrent(trackerStage),
            assignedStaff: {
              boh: session.assignedBOHId || session.assignedStaff?.boh || '',
              foh: session.assignedFOHId || session.assignedStaff?.foh || ''
            },
            createdAt: new Date(session.createdAt).getTime(),
            updatedAt: new Date(session.updatedAt).getTime(),
            sessionStartTime: session.startedAt ? new Date(session.startedAt).getTime() : undefined,
            sessionDuration: session.durationSecs || session.sessionDuration || 45 * 60,
            coalStatus: 'active' as const,
            refillStatus: 'none' as const,
            notes: session.notes || '',
            edgeCase: session.edgeCase,
            sessionTimer: session.timerStartedAt ? {
              remaining: calculateRemainingTimeFromPrisma(session),
              total: session.timerDuration || 45 * 60,
              isActive: session.timerStatus === 'active',
              startedAt: new Date(session.timerStartedAt).getTime()
            } : undefined,
            bohState: 'PREPARING' as const,
            guestTimerDisplay: session.state === 'ACTIVE',
            // Include raw database fields for getSessionStatus to work correctly
            state: session.state,
            paymentStatus: session.paymentStatus,
            externalRef: session.externalRef
          };
        });

        console.log('[useLiveSessionData] Successfully loaded sessions:', fireSessions.length);
        
        // First Light: Always use real data, show empty state if no sessions
        setSessions(fireSessions);

        // Update session timers
        const timers: Record<string, SessionTimer> = {};
        fireSessions.forEach(session => {
          if (session.sessionTimer) {
            timers[session.id] = session.sessionTimer;
          }
        });
        setSessionTimers(timers);
      } else {
        console.error('[useLiveSessionData] API returned error:', sessionsResult.error);
        throw new Error(sessionsResult.error || 'Failed to load sessions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        console.warn('[useLiveSessionData] Sessions unavailable (network):', errorMessage);
      } else {
        console.error('[useLiveSessionData] Error loading sessions:', err);
      }
      
      // First Light: No demo data fallback - fail hard with clear error
      let displayError = errorMessage;
      if (errorMessage.includes('HTTP 500') || errorMessage.includes('Database connection')) {
        displayError = 'Database connection failed. Check DATABASE_URL and ensure database is running.';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        displayError = 'Network error. Check your connection and try again.';
      } else if (errorMessage.includes('HTTP')) {
        // Keep the formatted error message
        displayError = errorMessage;
      }
      
      // First Light: Always show error, require real database
      setError(displayError);
      setSessions([]); // Empty state - require real data
      setMetrics({
        activeSessions: 0,
        revenue: 0,
        avgDuration: 0,
        alerts: 0,
        staffAssigned: 0,
        totalSessions: 0,
        changes: {
          activeSessions: '0%',
          revenue: '0%',
          avgDuration: '0%',
          alerts: '0%',
          staffAssigned: '0%',
          totalSessions: '0%'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [updatedDemoSessions]);

  // Load live metrics
  const loadMetrics = useCallback(async () => {
    // Check if we're in demo mode
    const isDemoMode = typeof window !== 'undefined' && 
      window.location &&
      new URLSearchParams(window.location.search).get('mode') === 'demo';
    
    // Check if metrics are enabled (Alpha Stability mode)
    const metricsEnabled = typeof window !== 'undefined' && 
      localStorage.getItem('metricsEnabled') === 'true';

    // In demo mode, calculate metrics from current sessions (no API call)
    if (isDemoMode) {
      console.log('[useLiveSessionData] 🎭 Demo Mode: Calculating metrics from in-memory sessions');
      const demoMetrics = {
        activeSessions: sessions.filter(s => ['ACTIVE', 'DELIVERED', 'OUT_FOR_DELIVERY'].includes(s.status)).length,
        revenue: sessions.reduce((sum, s) => sum + (s.amount / 100), 0),
        avgDuration: 45,
        alerts: sessions.filter(s => s.edgeCase !== null).length,
        staffAssigned: new Set([
          ...sessions.map(s => s.assignedStaff.boh).filter(Boolean),
          ...sessions.map(s => s.assignedStaff.foh).filter(Boolean)
        ]).size,
        totalSessions: sessions.length,
        changes: {
          activeSessions: '+0%',
          revenue: '+0%',
          avgDuration: '0%',
          alerts: '0%',
          staffAssigned: '+0%',
          totalSessions: '+0%'
        }
      };
      setMetrics(demoMetrics);
      return;
    }

    // Production mode: call API
    try {
      // Check if metrics are enabled (Alpha Stability mode)
      const metricsEnabled = typeof window !== 'undefined' && 
        localStorage.getItem('metricsEnabled') === 'true';
      
      console.log('[useLiveSessionData] Loading metrics...');
      const metricsUrl = new URL('/api/metrics/live', window.location.origin);
      const selectedLoungeId = new URLSearchParams(window.location.search).get('lounge');
      if (selectedLoungeId) {
        metricsUrl.searchParams.set('loungeId', selectedLoungeId);
      }
      if (metricsEnabled) {
        metricsUrl.searchParams.set('metricsEnabled', 'true');
        metricsUrl.searchParams.set('alphaStability', 'true');
      }
      const metricsResponse = await fetch(metricsUrl.toString());
      console.log('[useLiveSessionData] Metrics response status:', metricsResponse.status);
      
      if (!metricsResponse.ok) {
        // Auth is optional for some public/demo surfaces; treat 401 as non-fatal.
        if (metricsResponse.status === 401) {
          console.warn('[useLiveSessionData] Metrics unauthorized (401) - using fallback metrics');
          setMetrics({
            activeSessions: 1,
            revenue: 35,
            avgDuration: 25,
            alerts: 0,
            staffAssigned: 2,
            totalSessions: 1,
            changes: {
              activeSessions: '+0%',
              revenue: '+0%',
              avgDuration: '0%',
              alerts: '0%',
              staffAssigned: '+0%',
              totalSessions: '+0%'
            }
          });
          return;
        }
        throw new Error(`HTTP ${metricsResponse.status}: ${metricsResponse.statusText}`);
      }
      
      const metricsResult = await metricsResponse.json();
      console.log('[useLiveSessionData] Metrics result:', metricsResult);

      if (metricsResult.success) {
        setMetrics(metricsResult.metrics);
      } else {
        console.error('[useLiveSessionData] Metrics API returned error:', metricsResult.error);
        // Use fallback metrics
        setMetrics({
          activeSessions: 1,
          revenue: 35,
          avgDuration: 25,
          alerts: 0,
          staffAssigned: 2,
          totalSessions: 1,
          changes: {
            activeSessions: '+0%',
            revenue: '+0%',
            avgDuration: '0%',
            alerts: '0%',
            staffAssigned: '+0%',
            totalSessions: '+0%'
          }
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        console.warn('[useLiveSessionData] Metrics unavailable (network), using fallback');
      } else {
        console.error('[useLiveSessionData] Error loading metrics:', err);
      }
      // Use fallback metrics
      setMetrics({
        activeSessions: 1,
        revenue: 35,
        avgDuration: 25,
        alerts: 0,
        staffAssigned: 2,
        totalSessions: 1,
        changes: {
          activeSessions: '+0%',
          revenue: '+0%',
          avgDuration: '0%',
          alerts: '0%',
          staffAssigned: '+0%',
          totalSessions: '+0%'
        }
      });
    }
  }, [sessions]);

  // Update session state
  const updateSessionState = useCallback(async (sessionId: string, action: string) => {
    // Check if we're in demo mode
    const isDemoMode = typeof window !== 'undefined' && 
      window.location &&
      new URLSearchParams(window.location.search).get('mode') === 'demo';

    // In demo mode, update in-memory without API calls
    if (isDemoMode) {
      try {
        setLoading(true);
        console.log(`[Demo Mode] 🎭 Updating session ${sessionId} with action: ${action}`);
        
        // Import state machine utilities
        const { nextStateWithTrust } = await import('../lib/sessionStateMachine');
        
        // Find the session
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) {
          throw new Error('Session not found');
        }

        const currentSession = sessions[sessionIndex];
        
        // Map action string to SessionAction type (handle both uppercase and lowercase)
        // SimpleFSDDesign passes lowercase actions like 'claim_prep', 'start_active', etc.
        const actionMap: Record<string, string> = {
          'claim_prep': 'CLAIM_PREP',
          'heat_up': 'HEAT_UP',
          'ready_for_delivery': 'READY_FOR_DELIVERY',
          'deliver_now': 'DELIVER_NOW',
          'mark_delivered': 'MARK_DELIVERED',
          'start_active': 'START_ACTIVE',
          'pause_session': 'PAUSE_SESSION',
          'resume_session': 'RESUME_SESSION',
          'request_refill': 'REQUEST_REFILL',
          'complete_refill': 'COMPLETE_REFILL',
          'request_flavor_bowl': 'REQUEST_REFILL',
          'close_session': 'CLOSE_SESSION',
          'put_on_hold': 'PUT_ON_HOLD',
          'resolve_hold': 'RESOLVE_HOLD',
          'request_remake': 'REQUEST_REMAKE',
          'complete': 'CLOSE_SESSION',
          'pause': 'PAUSE_SESSION',
          // Also handle uppercase versions
          'CLAIM_PREP': 'CLAIM_PREP',
          'HEAT_UP': 'HEAT_UP',
          'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
          'DELIVER_NOW': 'DELIVER_NOW',
          'MARK_DELIVERED': 'MARK_DELIVERED',
          'START_ACTIVE': 'START_ACTIVE',
          'PAUSE_SESSION': 'PAUSE_SESSION',
          'RESUME_SESSION': 'RESUME_SESSION',
          'REQUEST_REFILL': 'REQUEST_REFILL',
          'COMPLETE_REFILL': 'COMPLETE_REFILL',
          'CLOSE_SESSION': 'CLOSE_SESSION',
          'PUT_ON_HOLD': 'PUT_ON_HOLD',
          'RESOLVE_HOLD': 'RESOLVE_HOLD',
          'REQUEST_REMAKE': 'REQUEST_REMAKE'
        };

        const normalizedAction = action.toLowerCase();
        const sessionAction = (actionMap[normalizedAction] || actionMap[action] || action.toUpperCase()) as any;

        // Refill / flavor upsell: update refillStatus in-place (no status change)
        if (sessionAction === 'REQUEST_REFILL' || normalizedAction === 'request_flavor_bowl') {
          const updatedSessionsRefill = [...sessions];
          const idx = updatedSessionsRefill.findIndex(s => s.id === sessionId);
          if (idx !== -1) {
            const s = updatedSessionsRefill[idx];
            if (s.refillStatus === 'requested') return; // already requested
            const updated = { ...s, refillStatus: 'requested' as const, updatedAt: Date.now() };
            updated.notes = (updated.notes || '') + (normalizedAction === 'request_flavor_bowl' ? '\nFlavor upsell requested (staff/verbal).' : '\nCoal refill requested (staff/verbal).');
            updatedSessionsRefill[idx] = updated;
            setSessions(updatedSessionsRefill);
            setUpdatedDemoSessions(prev => ({ ...prev, [sessionId]: updated }));
          }
          return;
        }
        if (sessionAction === 'COMPLETE_REFILL') {
          const updatedSessionsRefill = [...sessions];
          const idx = updatedSessionsRefill.findIndex(s => s.id === sessionId);
          if (idx !== -1) {
            const s = updatedSessionsRefill[idx];
            const updated = { ...s, refillStatus: 'delivered' as const, updatedAt: Date.now() };
            updated.notes = (updated.notes || '') + '\nRefill completed (staff).';
            updatedSessionsRefill[idx] = updated;
            setSessions(updatedSessionsRefill);
            setUpdatedDemoSessions(prev => ({ ...prev, [sessionId]: updated }));
          }
          return;
        }
        
        // Apply state machine transition
        const updatedSession = nextStateWithTrust(
          currentSession,
          { 
            type: sessionAction as any, 
            operatorId: 'demo-user',
            timestamp: Date.now()
          },
          'MANAGER' // Allow all actions in demo mode
        );

        // Lock NAN flow: set stage (Payment/Prep/Ready/Deliver/Light) and action so UI advances
        updatedSession.stage = STATUS_TO_TRACKER_STAGE[updatedSession.status as keyof typeof STATUS_TO_TRACKER_STAGE] ?? (updatedSession.stage as TrackerStage) ?? 'Payment';
        updatedSession.action = sessionAction;

        // Handle special actions that require additional updates
        if (sessionAction === 'CLAIM_PREP') {
          // Set BOH staff assignment when prep is claimed
          updatedSession.assignedStaff = {
            ...updatedSession.assignedStaff,
            boh: 'demo-boh-staff'
          };
          // Update state to ACTIVE (database representation) for PREP_IN_PROGRESS
          updatedSession.state = 'ACTIVE';
          // Add note to track workflow stage
          updatedSession.notes = (updatedSession.notes || '') + '\nAction CLAIM_PREP executed by MANAGER';
        } else if (sessionAction === 'READY_FOR_DELIVERY') {
          // Optionally assign FOH when ready for delivery
          updatedSession.assignedStaff = {
            ...updatedSession.assignedStaff,
            foh: 'demo-foh-staff'
          };
          updatedSession.notes = (updatedSession.notes || '') + '\nAction READY_FOR_DELIVERY executed by MANAGER';
        } else if (sessionAction === 'HEAT_UP') {
          updatedSession.notes = (updatedSession.notes || '') + '\nAction HEAT_UP executed by MANAGER';
        } else if (sessionAction === 'DELIVER_NOW') {
          updatedSession.notes = (updatedSession.notes || '') + '\nAction DELIVER_NOW executed by MANAGER';
        } else if (sessionAction === 'MARK_DELIVERED') {
          updatedSession.notes = (updatedSession.notes || '') + '\nAction MARK_DELIVERED executed by MANAGER';
        } else if (sessionAction === 'START_ACTIVE') {
          updatedSession.notes = (updatedSession.notes || '') + '\nAction START_ACTIVE executed by MANAGER';
        }

        // Ensure state is set for all workflow stages (ACTIVE in database)
        if (['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'ACTIVE'].includes(updatedSession.status)) {
          updatedSession.state = 'ACTIVE';
        }

        // Update session in state
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = updatedSession;
        setSessions(updatedSessions);
        
        // Store updated session in updatedDemoSessions to persist across refreshes
        setUpdatedDemoSessions(prev => ({
          ...prev,
          [sessionId]: updatedSession
        }));
        
        console.log(`[Demo Mode] ✅ Session state updated:`, {
          id: updatedSession.id,
          status: updatedSession.status,
          state: updatedSession.state,
          assignedStaff: updatedSession.assignedStaff
        });

        // Update metrics from updated sessions
        const updatedMetrics = {
          activeSessions: updatedSessions.filter(s => ['ACTIVE', 'DELIVERED', 'OUT_FOR_DELIVERY'].includes(s.status)).length,
          revenue: updatedSessions.reduce((sum, s) => sum + (s.amount / 100), 0),
          avgDuration: 45,
          alerts: updatedSessions.filter(s => s.edgeCase !== null).length,
          staffAssigned: new Set([
            ...updatedSessions.map(s => s.assignedStaff.boh).filter(Boolean),
            ...updatedSessions.map(s => s.assignedStaff.foh).filter(Boolean)
          ]).size,
          totalSessions: updatedSessions.length,
          changes: {
            activeSessions: '+0%',
            revenue: '+0%',
            avgDuration: '0%',
            alerts: '0%',
            staffAssigned: '+0%',
            totalSessions: '+0%'
          }
        };
        setMetrics(updatedMetrics);

        console.log(`[Demo Mode] ✅ Session updated: ${currentSession.status} → ${updatedSession.status}`);
      } catch (err) {
        console.error('[Demo Mode] Error updating session:', err);
        setError(err instanceof Error ? err.message : 'Failed to update session');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Production mode: call API using PATCH /api/sessions
    try {
      setLoading(true);
      
      // Map action to SessionAction format
      const actionMap: Record<string, string> = {
        'claim_prep': 'CLAIM_PREP',
        'heat_up': 'HEAT_UP',
        'ready_for_delivery': 'READY_FOR_DELIVERY',
        'deliver_now': 'DELIVER_NOW',
        'mark_delivered': 'MARK_DELIVERED',
        'start_active': 'START_ACTIVE',
        'pause_session': 'PAUSE_SESSION',
        'resume_session': 'RESUME_SESSION',
        'close_session': 'CLOSE_SESSION',
        'put_on_hold': 'PUT_ON_HOLD',
        'resolve_hold': 'RESOLVE_HOLD',
        'request_remake': 'REQUEST_REMAKE',
      };
      
      const mappedAction = actionMap[action.toLowerCase()] || action.toUpperCase();
      
      const response = await fetch(`/api/sessions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          action: mappedAction,
          userRole: 'MANAGER',
          operatorId: 'enhanced_fsd',
          notes: `Action ${mappedAction} executed via dashboard`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Refresh sessions after successful update
        await loadSessions();
        await loadMetrics();
      } else {
        throw new Error(result.error || result.details || 'Failed to update session');
      }
    } catch (err) {
      console.error('Error updating session:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update session';
      setError(msg.includes('Failed to fetch') || msg.includes('NetworkError')
        ? 'Network error. Check your connection and try again.'
        : msg);
    } finally {
      setLoading(false);
    }
  }, [sessions, loadSessions, loadMetrics]);

  // Refresh all data (never rejects - catches network/server errors to avoid unhandled rejections)
  const refreshSessions = useCallback(async () => {
    try {
      await Promise.all([loadSessions(), loadMetrics()]);
    } catch (err) {
      // loadSessions/loadMetrics handle their own errors; catch any unexpected rejections
      const msg = err instanceof Error ? err.message : 'Unknown';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        console.debug('[useLiveSessionData] Refresh skipped (network unavailable)');
      } else {
        console.warn('[useLiveSessionData] Refresh failed:', msg);
      }
    }
  }, [loadSessions, loadMetrics]);

  // Timer updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(sessionId => {
          const timer = updated[sessionId];
          if (timer.isActive && timer.remaining > 0) {
            updated[sessionId] = {
              ...timer,
              remaining: Math.max(0, timer.remaining - 1)
            };
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh data every 5 seconds (optimized for real-time updates)
  // Polling: 2s for CODIGO (faster Floor→Kitchen propagation), 5s otherwise
  useEffect(() => {
    const isCodigo = typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('lounge') === 'CODIGO';
    const intervalMs = isCodigo ? 2000 : 5000;
    const interval = setInterval(() => {
      refreshSessions().catch(() => {});
    }, intervalMs);

    return () => clearInterval(interval);
  }, []); // Remove refreshSessions dependency to prevent recreation

  // Initial load
  useEffect(() => {
    refreshSessions().catch(() => {});
  }, []); // Remove refreshSessions dependency to prevent recreation

  return {
    sessions,
    metrics,
    sessionTimers,
    loading,
    error,
    refreshSessions,
    updateSessionState
  };
}

// Helper function to map Prisma session state to FireSession status
function mapPrismaStateToFireSession(state: string | undefined | null): any {
  // Handle undefined/null state
  if (!state) {
    return 'NEW';
  }
  
  // Normalize to uppercase for enum values
  const stateUpper = state.toUpperCase();
  
  const stateMap: Record<string, any> = {
    // Database enum values (uppercase)
    'PENDING': 'NEW', // Will be overridden if paymentStatus is 'succeeded'
    'ACTIVE': 'ACTIVE',
    'PAUSED': 'STAFF_HOLD',
    'CLOSED': 'CLOSED',
    'CANCELED': 'VOIDED',
    // Legacy lowercase values (for backward compatibility)
    'active': 'ACTIVE',
    'prep_in_progress': 'PREP_IN_PROGRESS',
    'ready_for_delivery': 'READY_FOR_DELIVERY',
    'delivered': 'DELIVERED',
    'paused': 'STAFF_HOLD',
    'completed': 'CLOSED',
    'cancelled': 'VOIDED',
    'pending': 'NEW',
    // FireSession status values (pass through)
    'NEW': 'NEW',
    'PREP_IN_PROGRESS': 'PREP_IN_PROGRESS',
    'HEAT_UP': 'HEAT_UP',
    'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED',
    'PAID_CONFIRMED': 'PAID_CONFIRMED',
    'STAFF_HOLD': 'STAFF_HOLD',
    'VOIDED': 'VOIDED'
  };
  
  // Try uppercase first, then original
  return stateMap[stateUpper] || stateMap[state] || 'NEW';
}

// Helper function to calculate remaining time from Prisma session
function calculateRemainingTimeFromPrisma(session: any): number {
  if (!session.timerStartedAt || !session.timerDuration) return 0;
  
  const now = Date.now();
  const startedAt = new Date(session.timerStartedAt).getTime();
  const elapsed = Math.floor((now - startedAt) / 1000);
  const pausedTime = session.timerPausedDuration || 0;
  
  return Math.max(0, session.timerDuration - elapsed + pausedTime);
}

// Helper function to map state to stage
function mapStateToStage(state: string): 'BOH' | 'FOH' | 'CUSTOMER' {
  switch (state) {
    case 'NEW':
    case 'ACTIVE':
    case 'FAILED_PAYMENT':
      return 'CUSTOMER';
    case 'PAID_CONFIRMED':
    case 'PREP_IN_PROGRESS':
    case 'HEAT_UP':
    case 'READY_FOR_DELIVERY':
    case 'STAFF_HOLD':
    case 'STOCK_BLOCKED':
    case 'REMAKE':
      return 'BOH';
    case 'OUT_FOR_DELIVERY':
    case 'DELIVERED':
    case 'CLOSE_PENDING':
    case 'CLOSED':
    case 'REFUND_REQUESTED':
    case 'REFUNDED':
    case 'VOIDED':
      return 'FOH';
    default:
      return 'CUSTOMER';
  }
}
