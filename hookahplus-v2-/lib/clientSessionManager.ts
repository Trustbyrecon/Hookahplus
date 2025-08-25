// Client-side session manager for static export
// This provides dashboard functionality without server-side APIs

export interface Session {
  id: string;
  tableId: string;
  state: 'PAID_CONFIRMED' | 'PREPARING' | 'READY_FOR_DELIVERY' | 'DELIVERED';
  flavor: string;
  amount: number;
  customer: string;
  payment: { status: string; amount: number };
  timers: {
    deliveryBuffer: 5 | 10 | 15;
    lastActivity: number;
    startTime?: number;
  };
  meta: {
    deliveryZone: string;
    prepNotes: string;
    customerId: string;
    staffRole?: 'foh' | 'boh';
  };
  created: number;
  audit: Array<{
    timestamp: number;
    action: string;
    actor: string;
    data: any;
  }>;
}

class ClientSessionManager {
  private sessions: Map<string, Session> = new Map();
  private listeners: Set<(sessions: Session[]) => void> = new Set();

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    if (this.sessions.size === 0) {
      // Create demo sessions
      for (let i = 1; i <= 10; i++) {
        const sessionId = `demo-${i}`;
        const session: Session = {
          id: sessionId,
          tableId: `T-${i}`,
          state: 'PAID_CONFIRMED',
          flavor: ['Blue Mist + Mint', 'Double Apple', 'Grape + Mint'][Math.floor(Math.random() * 3)],
          amount: [3000, 5000, 7000][Math.floor(Math.random() * 3)],
          customer: `Customer ${i}`,
          payment: { status: 'completed', amount: [30, 50, 70][Math.floor(Math.random() * 3)] },
          timers: {
            deliveryBuffer: [5, 10, 15][Math.floor(Math.random() * 3)],
            lastActivity: Date.now()
          },
          meta: {
            deliveryZone: ['Zone A', 'Zone B', 'Zone C'][Math.floor(Math.random() * 3)],
            prepNotes: `Prep notes for session ${i}`,
            customerId: `cust_${i}`
          },
          created: Date.now() - (i * 60000), // Stagger creation times
          audit: []
        };
        this.sessions.set(sessionId, session);
      }
    }
  }

  // Get all sessions
  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  // Get session by ID
  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  // Seed demo sessions
  seedDemoSessions(count: number = 10): Session[] {
    this.sessions.clear();
    this.initializeDemoData();
    this.notifyListeners();
    return this.getAllSessions();
  }

  // Execute session command
  executeCommand(sessionId: string, cmd: string, data: any, actor: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Update session based on command
    switch (cmd) {
      case 'SET_DELIVERY_BUFFER':
        session.timers.deliveryBuffer = data.buffer;
        break;
      case 'UPDATE_DELIVERY_ZONE':
        session.meta.deliveryZone = data.zone;
        break;
      case 'ADD_PREP_NOTES':
        session.meta.prepNotes = data.notes;
        break;
      case 'UPDATE_STATE':
        session.state = data.state;
        break;
      case 'START_PREPARATION':
        session.state = 'PREPARING';
        session.timers.startTime = Date.now();
        break;
      case 'READY_FOR_DELIVERY':
        session.state = 'READY_FOR_DELIVERY';
        break;
      case 'DELIVERED':
        session.state = 'DELIVERED';
        break;
    }

    session.timers.lastActivity = Date.now();
    session.audit.push({
      timestamp: Date.now(),
      action: cmd,
      actor,
      data
    });

    this.notifyListeners();
    return session;
  }

  // Subscribe to session updates
  subscribe(listener: (sessions: Session[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  private notifyListeners() {
    const sessions = this.getAllSessions();
    this.listeners.forEach(listener => listener(sessions));
  }

  // Get session statistics
  getStats() {
    const sessions = this.getAllSessions();
    return {
      total: sessions.length,
      live: sessions.filter(s => s.state !== 'DELIVERED').length,
      revenue: sessions.reduce((sum, s) => sum + s.payment.amount, 0),
      byState: sessions.reduce((acc, s) => {
        acc[s.state] = (acc[s.state] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Export singleton instance
export const sessionManager = new ClientSessionManager();

// Export types and functions for use in components
export type { Session };
export { ClientSessionManager };
