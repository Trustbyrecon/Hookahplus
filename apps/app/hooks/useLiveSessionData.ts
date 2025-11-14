import { useState, useEffect, useCallback } from 'react';
import { FireSession, SessionTimer } from '../types/enhancedSession';
import { calculateRemainingTime, formatDuration } from '../lib/sessionStateMachine';

// Environment-based demo mode configuration
const USE_DEMO_MODE = process.env.NEXT_PUBLIC_USE_DEMO_MODE === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Generate rich demo data for Fire Session Dashboard
function generateRichDemoData(): FireSession[] {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const twoHoursAgo = now - (2 * 60 * 60 * 1000);
  const threeHoursAgo = now - (3 * 60 * 60 * 1000);

  return [
    // BOH Operations - Active sessions
    {
      id: 'demo-1',
      tableId: 'T-001',
      customerName: 'Sarah Johnson',
      customerPhone: '+1-555-0123',
      flavor: 'Mint Fresh + Watermelon',
      amount: 3200,
      status: 'PREP_IN_PROGRESS',
      currentStage: 'BOH',
      assignedStaff: { boh: 'staff-boh-1', foh: undefined },
      createdAt: oneHourAgo,
      updatedAt: now - (10 * 60 * 1000),
      sessionStartTime: oneHourAgo,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'VIP customer - extra attention to detail',
      edgeCase: null,
      bohState: 'PREPARING',
      guestTimerDisplay: false
    },
    {
      id: 'demo-2',
      tableId: 'T-002',
      customerName: 'Mike Chen',
      customerPhone: '+1-555-0124',
      flavor: 'Peach Wave + Strawberry',
      amount: 2800,
      status: 'HEAT_UP',
      currentStage: 'BOH',
      assignedStaff: { boh: 'staff-boh-2', foh: undefined },
      createdAt: now - (30 * 60 * 1000),
      updatedAt: now - (5 * 60 * 1000),
      sessionStartTime: now - (30 * 60 * 1000),
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Coals heating up - almost ready',
      edgeCase: null,
      bohState: 'WARMING_UP',
      guestTimerDisplay: false
    },
    {
      id: 'demo-3',
      tableId: 'T-003',
      customerName: 'Emma Davis',
      customerPhone: '+1-555-0125',
      flavor: 'Classic Mint',
      amount: 2500,
      status: 'READY_FOR_DELIVERY',
      currentStage: 'BOH',
      assignedStaff: { boh: 'staff-boh-1', foh: 'staff-foh-1' },
      createdAt: now - (45 * 60 * 1000),
      updatedAt: now - (2 * 60 * 1000),
      sessionStartTime: now - (45 * 60 * 1000),
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Ready for FOH pickup',
      edgeCase: null,
      bohState: 'READY_FOR_PICKUP',
      guestTimerDisplay: false
    },

    // FOH Operations - Active sessions
    {
      id: 'demo-4',
      tableId: 'T-004',
      customerName: 'Alex Rodriguez',
      customerPhone: '+1-555-0126',
      flavor: 'Mixed Berry + Ice Mint',
      amount: 3500,
      status: 'OUT_FOR_DELIVERY',
      currentStage: 'FOH',
      assignedStaff: { boh: undefined, foh: 'staff-foh-2' },
      createdAt: twoHoursAgo,
      updatedAt: now - (15 * 60 * 1000),
      sessionStartTime: twoHoursAgo,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'En route to table - 2 minutes away',
      edgeCase: null,
      bohState: 'PICKED_UP',
      guestTimerDisplay: true,
      sessionTimer: {
        remaining: 25 * 60, // 25 minutes left
        total: 45 * 60,
        isActive: true,
        startedAt: twoHoursAgo
      }
    },
    {
      id: 'demo-5',
      tableId: 'T-005',
      customerName: 'Lisa Wang',
      customerPhone: '+1-555-0127',
      flavor: 'Grape + Menthol',
      amount: 3000,
      status: 'DELIVERED',
      currentStage: 'FOH',
      assignedStaff: { boh: undefined, foh: 'staff-foh-1' },
      createdAt: threeHoursAgo,
      updatedAt: now - (5 * 60 * 1000),
      sessionStartTime: threeHoursAgo,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Delivered and active - customer enjoying',
      edgeCase: null,
      bohState: 'PICKED_UP',
      guestTimerDisplay: true,
      sessionTimer: {
        remaining: 15 * 60, // 15 minutes left
        total: 45 * 60,
        isActive: true,
        startedAt: threeHoursAgo
      }
    },

    // Edge Cases & Escalations
    {
      id: 'demo-6',
      tableId: 'T-006',
      customerName: 'John Smith',
      customerPhone: '+1-555-0128',
      flavor: 'Custom Mix',
      amount: 2800,
      status: 'STAFF_HOLD',
      currentStage: 'BOH',
      assignedStaff: { boh: 'staff-boh-2', foh: 'staff-foh-2' },
      createdAt: now - (20 * 60 * 1000),
      updatedAt: now - (5 * 60 * 1000),
      sessionStartTime: now - (20 * 60 * 1000),
      sessionDuration: 45 * 60,
      coalStatus: 'needs_refill',
      refillStatus: 'none',
      notes: 'Customer requested flavor change - on hold',
      edgeCase: 'Customer requested flavor change - on hold',
      bohState: 'PREPARING',
      guestTimerDisplay: false
    },
    {
      id: 'demo-7',
      tableId: 'T-007',
      customerName: 'Maria Garcia',
      customerPhone: '+1-555-0129',
      flavor: 'Strawberry Mojito',
      amount: 2600,
      status: 'STOCK_BLOCKED',
      currentStage: 'BOH',
      assignedStaff: { boh: 'staff-boh-1', foh: undefined },
      createdAt: now - (15 * 60 * 1000),
      updatedAt: now - (2 * 60 * 1000),
      sessionStartTime: now - (15 * 60 * 1000),
      sessionDuration: 45 * 60,
      coalStatus: 'burnt_out',
      refillStatus: 'none',
      notes: 'Out of strawberry flavor - waiting for restock',
      edgeCase: 'Customer requested flavor change - on hold',
      bohState: 'PREPARING',
      guestTimerDisplay: false
    },
    {
      id: 'demo-8',
      tableId: 'T-008',
      customerName: 'David Kim',
      customerPhone: '+1-555-0130',
      flavor: 'Watermelon Mint',
      amount: 2900,
      status: 'REMAKE',
      currentStage: 'BOH',
      assignedStaff: { boh: 'staff-boh-2', foh: 'staff-foh-1' },
      createdAt: now - (10 * 60 * 1000),
      updatedAt: now - (1 * 60 * 1000),
      sessionStartTime: now - (10 * 60 * 1000),
      sessionDuration: 45 * 60,
      coalStatus: 'needs_refill',
      refillStatus: 'none',
      notes: 'Customer not satisfied with flavor - remaking',
      edgeCase: 'Customer requested flavor change - on hold',
      bohState: 'PREPARING',
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

  // Load live session data
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useLiveSessionData] Starting to load sessions...');
      
      // Load active sessions from root Prisma API
      console.log('[useLiveSessionData] Fetching from: /api/sessions');
      const sessionsResponse = await fetch('/api/sessions');
      console.log('[useLiveSessionData] Sessions response status:', sessionsResponse.status);
      
      if (!sessionsResponse.ok) {
        const errorText = await sessionsResponse.text();
        console.error('[useLiveSessionData] Sessions API error:', {
          status: sessionsResponse.status,
          statusText: sessionsResponse.statusText,
          body: errorText
        });
        
        // Provide user-friendly error message
        if (sessionsResponse.status === 500) {
          throw new Error('Server error: Unable to connect to database. Using demo data.');
        } else if (sessionsResponse.status === 404) {
          throw new Error('Sessions endpoint not found. Using demo data.');
        } else {
          throw new Error(`HTTP ${sessionsResponse.status}: ${sessionsResponse.statusText || 'Failed to load sessions'}. Using demo data.`);
        }
      }
      
      const sessionsResult = await sessionsResponse.json();
      console.log('[useLiveSessionData] Sessions result:', sessionsResult);

      if (sessionsResult.success) {
        // Convert Prisma API sessions to FireSession format
        const fireSessions: FireSession[] = sessionsResult.sessions.map((session: any) => {
          // Parse flavorMix if it's a JSON string
          let flavorMix = session.flavorMix || 'Custom Mix';
          if (typeof flavorMix === 'string') {
            try {
              const parsed = JSON.parse(flavorMix);
              flavorMix = typeof parsed === 'string' ? parsed : parsed.join(' + ');
            } catch {
              // Keep as is if not valid JSON
            }
          }
          
          // Map Prisma state to FireSession status (same logic as API route)
          // Handle undefined/null state gracefully
          const sessionState = session.state || 'PENDING';
          let fireSessionStatus = mapPrismaStateToFireSession(sessionState);
          // Special handling: PENDING + paymentStatus 'succeeded' = PAID_CONFIRMED
          if (sessionState === 'PENDING' && session.paymentStatus === 'succeeded') {
            fireSessionStatus = 'PAID_CONFIRMED';
          }
          
          return {
            id: session.id,
            tableId: session.tableId || session.externalRef || 'Unknown',
            customerName: session.customerRef || 'Anonymous',
            customerPhone: session.customerPhone || '',
            flavor: flavorMix,
            amount: session.priceCents || 0,
            status: fireSessionStatus,
            currentStage: mapStateToStage(session.state),
            assignedStaff: {
              boh: session.assignedBOHId,
              foh: session.assignedFOHId
            },
            createdAt: new Date(session.createdAt).getTime(),
            updatedAt: new Date(session.updatedAt).getTime(),
            sessionStartTime: session.startedAt ? new Date(session.startedAt).getTime() : undefined,
            sessionDuration: session.durationSecs || 45 * 60,
            coalStatus: 'active' as const,
            refillStatus: 'none' as const,
            notes: session.tableNotes || '',
            edgeCase: session.edgeCase,
            sessionTimer: session.timerStartedAt ? {
              remaining: calculateRemainingTimeFromPrisma(session),
              total: session.timerDuration || 45 * 60,
              isActive: session.timerStatus === 'active',
              startedAt: new Date(session.timerStartedAt).getTime()
            } : undefined,
            bohState: 'PREPARING' as const,
            guestTimerDisplay: session.state === 'ACTIVE'
          };
        });

        console.log('[useLiveSessionData] Successfully loaded sessions:', fireSessions.length);
        
        // If no sessions from API, conditionally load demo data
        if (fireSessions.length === 0) {
          if (USE_DEMO_MODE && IS_DEVELOPMENT) {
            // Dev mode: Load demo data when no real sessions
            console.log('[Dev Mode] No sessions from API, loading demo data');
            const demoData = generateRichDemoData();
            setSessions(demoData);
          } else {
            // Production: Show empty state
            setSessions([]);
          }
        } else {
          setSessions(fireSessions);
        }

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
      console.error('[useLiveSessionData] Error loading sessions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions';
      
      // Extract user-friendly message if it's already formatted
      let displayError = errorMessage;
      if (errorMessage.includes('HTTP 500')) {
        displayError = 'Server error: Database connection issue. Using demo data.';
      } else if (errorMessage.includes('HTTP')) {
        // Keep the formatted error message
        displayError = errorMessage;
      } else {
        displayError = `${errorMessage}. Using demo data.`;
      }
      
      // Hybrid Demo Data Approach:
      // - Development: Silent fallback to demo data (no error shown)
      // - Production/Load Testing: Show error, require real database
      if (USE_DEMO_MODE && IS_DEVELOPMENT) {
        // Dev mode: Silent fallback to demo data
        console.warn('[Dev Mode] Using demo data - database connection failed');
        const demoData = generateRichDemoData();
        setSessions(demoData);
        setError(null); // Don't show error in dev mode
        
        // Calculate metrics from demo data
        const demoMetrics = {
          activeSessions: demoData.filter(s => ['ACTIVE', 'DELIVERED', 'OUT_FOR_DELIVERY'].includes(s.status)).length,
          revenue: demoData.reduce((sum, s) => sum + (s.amount / 100), 0),
          avgDuration: 45,
          alerts: demoData.filter(s => s.edgeCase !== null).length,
          staffAssigned: new Set([
            ...demoData.map(s => s.assignedStaff.boh).filter(Boolean),
            ...demoData.map(s => s.assignedStaff.foh).filter(Boolean)
          ]).size,
          totalSessions: demoData.length,
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
      } else {
        // Production/Load Testing: Show error, require real database
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
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load live metrics
  const loadMetrics = useCallback(async () => {
    try {
      console.log('[useLiveSessionData] Loading metrics...');
      const metricsResponse = await fetch('/api/metrics/live');
      console.log('[useLiveSessionData] Metrics response status:', metricsResponse.status);
      
      if (!metricsResponse.ok) {
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
      console.error('[useLiveSessionData] Error loading metrics:', err);
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
  }, []);

  // Update session state
  const updateSessionState = useCallback(async (sessionId: string, action: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/sessions/${sessionId}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          operatorId: 'enhanced_fsd',
          timestamp: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh sessions after successful update
        await loadSessions();
        await loadMetrics();
      } else {
        throw new Error(result.error || 'Failed to update session');
      }
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to update session');
    } finally {
      setLoading(false);
    }
  }, [loadSessions, loadMetrics]);

  // Refresh all data
  const refreshSessions = useCallback(async () => {
    await Promise.all([loadSessions(), loadMetrics()]);
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
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSessions();
    }, 5000);

    return () => clearInterval(interval);
  }, []); // Remove refreshSessions dependency to prevent recreation

  // Initial load
  useEffect(() => {
    refreshSessions();
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
    'CLOSED': 'CLOSED',
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
