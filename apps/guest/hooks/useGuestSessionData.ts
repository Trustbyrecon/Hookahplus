import { useState, useEffect, useCallback } from 'react';
import { FireSession, SessionTimer, STATUS_TO_TRACKER_STAGE } from '../../app/types/enhancedSession';

interface UseGuestSessionDataOptions {
  tableId?: string;
  customerPhone?: string;
  sessionId?: string;
}

interface UseGuestSessionDataReturn {
  sessions: FireSession[];
  activeSession: FireSession | null;
  loading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
}

export function useGuestSessionData(options: UseGuestSessionDataOptions = {}): UseGuestSessionDataReturn {
  const { tableId, customerPhone, sessionId } = options;
  const [sessions, setSessions] = useState<FireSession[]>([]);
  const [activeSession, setActiveSession] = useState<FireSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (tableId) params.append('tableId', tableId);
      if (customerPhone) params.append('customerPhone', customerPhone);
      if (sessionId) params.append('sessionId', sessionId);

      const url = `/api/sessions${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let sessionList: FireSession[] = [];
      if (data.sessions) {
        sessionList = Array.isArray(data.sessions) ? data.sessions : [];
      } else if (data.session) {
        sessionList = [data.session];
      } else if (Array.isArray(data)) {
        sessionList = data;
      }

      setSessions(sessionList);

      // Find active session (ACTIVE, PREP_IN_PROGRESS, READY_FOR_DELIVERY, OUT_FOR_DELIVERY, DELIVERED)
      const active = sessionList.find(
        (s) =>
          s.status === 'ACTIVE' ||
          s.status === 'PREP_IN_PROGRESS' ||
          s.status === 'READY_FOR_DELIVERY' ||
          s.status === 'OUT_FOR_DELIVERY' ||
          s.status === 'DELIVERED' ||
          s.status === 'HEAT_UP'
      );
      setActiveSession(active || null);
    } catch (err) {
      console.error('[useGuestSessionData] Error loading sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      setSessions([]);
      setActiveSession(null);
    } finally {
      setLoading(false);
    }
  }, [tableId, customerPhone, sessionId]);

  useEffect(() => {
    loadSessions();

    // Poll for updates every 10 seconds if we have filters
    if (tableId || customerPhone || sessionId) {
      const interval = setInterval(loadSessions, 10000);
      return () => clearInterval(interval);
    }
  }, [loadSessions]);

  return {
    sessions,
    activeSession,
    loading,
    error,
    refreshSessions: loadSessions,
  };
}

