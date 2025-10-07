'use client';

export interface SessionData {
  sessionId: string;
  tableId: string;
  loungeId: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  duration: number;
  timeRemaining: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  staffAssigned: {
    foh: string | null;
    boh: string | null;
  };
  appBuildUrl?: string;
  staffPanelUrl?: string;
  dashboardUrl?: string;
}

class SessionManager {
  private static instance: SessionManager;
  private currentSession: SessionData | null = null;
  private listeners: Set<(session: SessionData | null) => void> = new Set();

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Start a new session
  async startSession(sessionData: {
    tableId: string;
    loungeId: string;
    customerId?: string;
    items: any[];
    totalAmount: number;
    customerName?: string;
    customerPhone?: string;
    sessionDuration?: number;
  }): Promise<{ ok: boolean; session?: SessionData; error?: string }> {
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });

      const result = await response.json();

      if (result.ok) {
        this.currentSession = {
          sessionId: result.sessionId,
          tableId: result.tableId,
          loungeId: result.loungeId,
          status: 'ACTIVE',
          startedAt: result.startedAt,
          duration: sessionData.sessionDuration || 60,
          timeRemaining: sessionData.sessionDuration || 60,
          items: sessionData.items,
          totalAmount: sessionData.totalAmount,
          staffAssigned: {
            foh: null,
            boh: null
          },
          appBuildUrl: result.appBuildUrl,
          staffPanelUrl: result.staffPanelUrl,
          dashboardUrl: result.dashboardUrl
        };

        this.notifyListeners();
        return { ok: true, session: this.currentSession };
      } else {
        return { ok: false, error: result.error };
      }
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }

  // Get current session status
  async getSessionStatus(sessionId?: string, tableId?: string): Promise<{ ok: boolean; session?: SessionData; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (tableId) params.append('tableId', tableId);

      const response = await fetch(`/api/session/status?${params.toString()}`);
      const result = await response.json();

      if (result.ok) {
        this.currentSession = result.session;
        this.notifyListeners();
        return { ok: true, session: result.session };
      } else {
        return { ok: false, error: result.error };
      }
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }

  // Get current session
  getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  // Subscribe to session updates
  subscribe(callback: (session: SessionData | null) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify listeners of session changes
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentSession));
  }

  // Clear current session
  clearSession(): void {
    this.currentSession = null;
    this.notifyListeners();
  }

  // Open App build in new tab with session context
  openAppBuild(context: 'session' | 'staff' | 'dashboard' = 'session'): void {
    if (!this.currentSession) return;

    let url = '';
    switch (context) {
      case 'session':
        url = this.currentSession.appBuildUrl || `https://hookahplus-app-prod.vercel.app/fire-session-dashboard?session=${this.currentSession.sessionId}`;
        break;
      case 'staff':
        url = this.currentSession.staffPanelUrl || `https://hookahplus-app-prod.vercel.app/fire-session-dashboard?table=${this.currentSession.tableId}`;
        break;
      case 'dashboard':
        url = this.currentSession.dashboardUrl || `https://hookahplus-app-prod.vercel.app/dashboard?session=${this.currentSession.sessionId}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  // Start real-time session monitoring
  startMonitoring(): void {
    if (!this.currentSession) return;

    // Check session status every 30 seconds
    const interval = setInterval(async () => {
      if (!this.currentSession) {
        clearInterval(interval);
        return;
      }

      const result = await this.getSessionStatus(this.currentSession.sessionId);
      if (result.ok && result.session) {
        // Update time remaining
        if (this.currentSession) {
          this.currentSession.timeRemaining = result.session.timeRemaining;
          this.currentSession.status = result.session.status;
          this.notifyListeners();
        }
      }
    }, 30000);

    // Store interval ID for cleanup
    (this as any).monitoringInterval = interval;
  }

  // Stop real-time monitoring
  stopMonitoring(): void {
    if ((this as any).monitoringInterval) {
      clearInterval((this as any).monitoringInterval);
      (this as any).monitoringInterval = null;
    }
  }
}

export const sessionManager = SessionManager.getInstance();
