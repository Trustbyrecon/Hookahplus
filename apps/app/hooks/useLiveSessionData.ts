import { useState, useEffect, useCallback } from 'react';
import { FireSession, SessionTimer } from '../types/enhancedSession';
import { calculateRemainingTime, formatDuration } from '../lib/sessionStateMachine';

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
      const sessionsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sessions`);
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
      console.error('[useLiveSessionData] Error loading sessions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions';
      setError(errorMessage);
      
      // Fallback: Use sample data if API fails
      console.log('[useLiveSessionData] Using fallback sample data...');
      const fallbackSessions: FireSession[] = [
        {
          id: 'fallback-1',
          tableId: 'T-001',
          customerName: 'Sample Customer',
          customerPhone: '+1 (555) 000-0000',
          flavor: 'Blue Mist + Mint',
          amount: 3500,
          status: 'ACTIVE',
          currentStage: 'CUSTOMER',
          assignedStaff: { boh: 'Staff-1', foh: 'Staff-2' },
          createdAt: Date.now() - 30 * 60 * 1000,
          updatedAt: Date.now(),
          sessionStartTime: Date.now() - 25 * 60 * 1000,
          sessionDuration: 25 * 60 * 1000,
          coalStatus: 'active',
          refillStatus: 'none',
          notes: 'Fallback session - API unavailable',
          edgeCase: null,
          sessionTimer: {
            remaining: 35 * 60,
            total: 60 * 60,
            isActive: true,
            startedAt: Date.now() - 25 * 60 * 1000
          },
          bohState: 'PREPARING',
          guestTimerDisplay: true
        }
      ];
      setSessions(fallbackSessions);
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
