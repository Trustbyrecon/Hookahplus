import { useState, useEffect, useCallback } from 'react';
import { FireSession, SessionTimer } from '../types/enhancedSession';
import { calculateRemainingTime, formatDuration } from '../lib/sessionStateMachine';

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
        throw new Error(`HTTP ${sessionsResponse.status}: ${sessionsResponse.statusText}`);
      }
      
      const sessionsResult = await sessionsResponse.json();
      console.log('[useLiveSessionData] Sessions result:', sessionsResult);

      if (sessionsResult.success) {
        // Convert Prisma API sessions to FireSession format
        const fireSessions: FireSession[] = sessionsResult.sessions.map((session: any) => ({
          id: session.id,
          tableId: session.externalRef || 'Unknown',
          customerName: session.customerRef || 'Anonymous',
          customerPhone: session.customerPhone || '',
          flavor: session.flavorMix || 'Custom Mix',
          amount: session.priceCents || 0,
          status: mapPrismaStateToFireSession(session.state),
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
          guestTimerDisplay: session.state === 'active'
        }));

        console.log('[useLiveSessionData] Successfully loaded sessions:', fireSessions.length);
        
        // If no sessions from API, load demo data
        if (fireSessions.length === 0) {
          console.log('[useLiveSessionData] No sessions from API, loading demo data');
          const demoData = generateRichDemoData();
          setSessions(demoData);
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
      setError(errorMessage);
      
      // Add rich demo data when API fails or returns empty
      console.log('[useLiveSessionData] API failed, loading demo data');
      const demoData = generateRichDemoData();
      setSessions(demoData);
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

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSessions();
    }, 30000);

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
function mapPrismaStateToFireSession(state: string): any {
  const stateMap: Record<string, any> = {
    'active': 'ACTIVE',
    'prep_in_progress': 'PREP_IN_PROGRESS',
    'ready_for_delivery': 'READY_FOR_DELIVERY',
    'delivered': 'DELIVERED',
    'paused': 'STAFF_HOLD',
    'completed': 'CLOSED',
    'cancelled': 'VOIDED',
    'pending': 'NEW'
  };
  return stateMap[state] || 'NEW';
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
