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

      // Load active sessions
      const sessionsResponse = await fetch('/api/sessions?state=ACTIVE');
      const sessionsResult = await sessionsResponse.json();

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
        throw new Error(sessionsResult.error || 'Failed to load sessions');
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load live metrics
  const loadMetrics = useCallback(async () => {
    try {
      const metricsResponse = await fetch('/api/metrics/live');
      const metricsResult = await metricsResponse.json();

      if (metricsResult.success) {
        setMetrics(metricsResult.metrics);
      } else {
        console.error('Failed to load metrics:', metricsResult.error);
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
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
