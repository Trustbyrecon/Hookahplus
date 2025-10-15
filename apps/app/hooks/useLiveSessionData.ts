import { useState, useEffect, useCallback } from 'react';
import { FireSession, SessionTimer, calculateRemainingTime, formatDuration } from '@/lib/sessionStateMachine';

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
      
      // Load active sessions
      const sessionsResponse = await fetch('/api/sessions?state=ACTIVE');
      console.log('[useLiveSessionData] Sessions response status:', sessionsResponse.status);
      
      if (!sessionsResponse.ok) {
        throw new Error(`HTTP ${sessionsResponse.status}: ${sessionsResponse.statusText}`);
      }
      
      const sessionsResult = await sessionsResponse.json();
      console.log('[useLiveSessionData] Sessions result:', sessionsResult);

      if (sessionsResult.success) {
        // Convert API sessions to FireSession format
        const fireSessions: FireSession[] = sessionsResult.sessions.map((session: any) => ({
          id: session.id,
          tableId: session.table_id || session.tableId || 'Unknown',
          customerName: session.customer_name || 'Anonymous',
          customerPhone: session.customer_phone,
          flavor: session.flavor_mix ? session.flavor_mix.join(' + ') : 'Custom Mix',
          amount: (session.amount || 30) * 100, // Convert to cents
          status: session.state as any,
          currentStage: mapStateToStage(session.state),
          assignedStaff: {
            boh: session.boh_staff,
            foh: session.foh_staff
          },
          createdAt: new Date(session.created_at).getTime(),
          updatedAt: new Date(session.lastUpdated || session.created_at).getTime(),
          sessionStartTime: session.started_at ? new Date(session.started_at).getTime() : undefined,
          sessionDuration: session.started_at ? Date.now() - new Date(session.started_at).getTime() : 0,
          coalStatus: 'active' as const,
          refillStatus: 'none' as const,
          notes: session.notes || '',
          edgeCase: session.state === 'PAYMENT_FAILED' ? 'Payment Failed' : null,
          sessionTimer: session.timer_duration ? {
            remaining: session.started_at ? Math.max(0, (session.timer_duration * 60) - Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)) : session.timer_duration * 60,
            total: session.timer_duration * 60,
            isActive: session.state === 'ACTIVE',
            startedAt: session.started_at ? new Date(session.started_at).getTime() : undefined,
            pausedAt: undefined,
            pausedDuration: 0
          } : undefined,
          bohState: 'PREPARING' as const,
          guestTimerDisplay: session.state === 'ACTIVE'
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
