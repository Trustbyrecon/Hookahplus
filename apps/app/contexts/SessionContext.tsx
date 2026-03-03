'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useLiveSessionData } from '../hooks/useLiveSessionData';
import { FireSession, SessionTimer } from '../types/enhancedSession';

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

interface SessionContextType {
  sessions: FireSession[];
  metrics: LiveMetrics;
  sessionTimers: Record<string, SessionTimer>;
  loading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  updateSessionState: (sessionId: string, action: string) => Promise<void>;
  lastUpdated: Date | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const {
    sessions,
    metrics,
    sessionTimers,
    loading,
    error,
    refreshSessions,
    updateSessionState
  } = useLiveSessionData();

  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  // Track last update time
  React.useEffect(() => {
    if (!loading && sessions.length > 0) {
      setLastUpdated(new Date());
    }
  }, [sessions, loading]);

  const value: SessionContextType = {
    sessions,
    metrics,
    sessionTimers,
    loading,
    error,
    refreshSessions,
    updateSessionState,
    lastUpdated
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextType {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}

