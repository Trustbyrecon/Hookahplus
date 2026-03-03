import { useState, useEffect, useCallback } from 'react';

export interface SessionData {
  id: string;
  tableId: string;
  customerName: string;
  flavor: string;
  status: string;
  statusColor: string;
  statusIcon: string;
  amount: number;
  assignedBOH: string;
  notes: string;
  created: string;
  team: 'BOH' | 'FOH' | 'CUSTOMER' | 'EDGE';
  lastUpdated: number;
}

export interface MetricsData {
  totalSessions: number;
  bohActive: number;
  fohActive: number;
  edgeCases: number;
  lastUpdated: number;
}

export function useRealtimeData() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [metrics, setMetrics] = useState<MetricsData>({
    totalSessions: 0,
    bohActive: 0,
    fohActive: 0,
    edgeCases: 0,
    lastUpdated: Date.now()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time data updates
  const generateMockData = useCallback(() => {
    const mockSessions: SessionData[] = [
      {
        id: 'session_T-007_1758552685415',
        tableId: 'T-007',
        customerName: '15551234556',
        flavor: 'Watermelon + Mint',
        status: 'PREP_IN_PROGRESS',
        statusColor: 'bg-green-500',
        statusIcon: '🔄',
        amount: 35.00,
        assignedBOH: 'Mike Rodriguez',
        notes: 'Prep in progress - heating coals',
        created: '10:45 AM',
        team: 'BOH',
        lastUpdated: Date.now()
      },
      {
        id: 'session_T-003_1758552685416',
        tableId: 'T-003',
        customerName: '+1234567890',
        flavor: 'Blue Mist',
        status: 'HEAT_UP',
        statusColor: 'bg-orange-500',
        statusIcon: '🔥',
        amount: 30.00,
        assignedBOH: 'Sarah Chen',
        notes: 'Ready for heat up phase',
        created: '10:30 AM',
        team: 'BOH',
        lastUpdated: Date.now()
      },
      {
        id: 'session_T-005_1758552685417',
        tableId: 'T-005',
        customerName: 'Anonymous',
        flavor: 'Double Apple + Mint',
        status: 'READY_FOR_DELIVERY',
        statusColor: 'bg-blue-500',
        statusIcon: '✅',
        amount: 35.00,
        assignedBOH: 'Alex Johnson',
        notes: 'Ready for FOH pickup',
        created: '10:15 AM',
        team: 'FOH',
        lastUpdated: Date.now()
      },
      {
        id: 'session_T-002_1758552685418',
        tableId: 'T-002',
        customerName: 'VIP Customer',
        flavor: 'Peach Wave',
        status: 'OUT_FOR_DELIVERY',
        statusColor: 'bg-red-500',
        statusIcon: '🚚',
        amount: 40.00,
        assignedBOH: 'Maria Garcia',
        notes: 'Out for delivery to table',
        created: '10:00 AM',
        team: 'FOH',
        lastUpdated: Date.now()
      },
      {
        id: 'session_T-004_1758552685419',
        tableId: 'T-004',
        customerName: 'Custom Order',
        flavor: 'Custom Mix',
        status: 'EDGE_CASE',
        statusColor: 'bg-yellow-500',
        statusIcon: '⚠️',
        amount: 45.00,
        assignedBOH: 'Manager Review',
        notes: 'Special dietary requirements - needs manager approval',
        created: '9:45 AM',
        team: 'EDGE',
        lastUpdated: Date.now()
      },
      {
        id: 'session_T-006_1758552685420',
        tableId: 'T-006',
        customerName: 'Regular Customer',
        flavor: 'Mint + Blueberry',
        status: 'ACTIVE',
        statusColor: 'bg-green-500',
        statusIcon: '🟢',
        amount: 35.00,
        assignedBOH: 'Active Session',
        notes: 'Customer enjoying session',
        created: '9:30 AM',
        team: 'CUSTOMER',
        lastUpdated: Date.now()
      },
      {
        id: 'session_T-008_1758552685421',
        tableId: 'T-008',
        customerName: 'New Customer',
        flavor: 'Mint + Spearmint',
        status: 'ACTIVE',
        statusColor: 'bg-green-500',
        statusIcon: '🟢',
        amount: 35.00,
        assignedBOH: 'Active Session',
        notes: 'First time customer - great experience',
        created: '9:15 AM',
        team: 'CUSTOMER',
        lastUpdated: Date.now()
      }
    ];

    // Simulate some random status changes
    const updatedSessions = mockSessions.map(session => {
      if (Math.random() < 0.1) { // 10% chance of status change
        const statuses = ['PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'ACTIVE'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        return {
          ...session,
          status: newStatus,
          lastUpdated: Date.now()
        };
      }
      return session;
    });

    return updatedSessions;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSessions = generateMockData();
      setSessions(newSessions);
      
      // Calculate metrics
      const newMetrics: MetricsData = {
        totalSessions: newSessions.length,
        bohActive: newSessions.filter(s => s.team === 'BOH').length,
        fohActive: newSessions.filter(s => s.team === 'FOH').length,
        edgeCases: newSessions.filter(s => s.team === 'EDGE').length,
        lastUpdated: Date.now()
      };
      
      setMetrics(newMetrics);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [generateMockData]);

  // Set up real-time updates
  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Set up polling
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [fetchData]);

  const createSession = useCallback(async (sessionData: Partial<SessionData>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSession: SessionData = {
        id: `session_${sessionData.tableId}_${Date.now()}`,
        tableId: sessionData.tableId || 'T-001',
        customerName: sessionData.customerName || 'Anonymous',
        flavor: sessionData.flavor || 'Blue Mist',
        status: 'PREP_IN_PROGRESS',
        statusColor: 'bg-green-500',
        statusIcon: '🔄',
        amount: sessionData.amount || 30.00,
        assignedBOH: 'Unassigned',
        notes: 'New session created',
        created: new Date().toLocaleTimeString(),
        team: 'BOH',
        lastUpdated: Date.now()
      };
      
      setSessions(prev => [newSession, ...prev]);
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        bohActive: prev.bohActive + 1,
        lastUpdated: Date.now()
      }));
      
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<SessionData>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates, lastUpdated: Date.now() }
          : session
      ));
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sessions,
    metrics,
    isLoading,
    error,
    lastUpdated,
    fetchData,
    createSession,
    updateSession
  };
}
