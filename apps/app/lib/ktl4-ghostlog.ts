/**
 * KTL-4 Enhanced GhostLog System
 * 
 * Provides structured event logging for Keep-The-Lights-On flows
 * with trust signatures, audit trails, and operational monitoring.
 */

import crypto from 'crypto';

export interface Ktl4Event {
  id: string;
  timestamp: string;
  flowName: 'payment_settlement' | 'session_lifecycle' | 'order_intake' | 'pos_sync';
  eventType: string;
  sessionId?: string;
  stationId?: string;
  operatorId?: string;
  chargeId?: string;
  ticketId?: string;
  amountCents?: number;
  status: 'success' | 'warning' | 'error' | 'critical';
  details: Record<string, any>;
  trustSignature: string;
  previousHash?: string | null;
  repairRunId?: string;
}

export interface Ktl4HealthStatus {
  flowName: string;
  status: 'healthy' | 'degraded' | 'critical' | 'failed';
  lastCheck: string;
  issues: string[];
  metrics: Record<string, number>;
}

class Ktl4GhostLog {
  private static instance: Ktl4GhostLog;
  private events: Map<string, Ktl4Event> = new Map();
  private healthStatus: Map<string, Ktl4HealthStatus> = new Map();
  private lastHash: string | null = null;

  static getInstance(): Ktl4GhostLog {
    if (!Ktl4GhostLog.instance) {
      Ktl4GhostLog.instance = new Ktl4GhostLog();
    }
    return Ktl4GhostLog.instance;
  }

  /**
   * Log a KTL-4 event with trust signature
   */
  async logEvent(event: Omit<Ktl4Event, 'id' | 'timestamp' | 'trustSignature'>): Promise<Ktl4Event> {
    const id = `ktl4_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Create trust signature
    const eventData = {
      ...event,
      id,
      timestamp,
      previousHash: this.lastHash
    };
    
    const trustSignature = this.createTrustSignature(eventData);
    
    const ktl4Event: Ktl4Event = {
      ...eventData,
      trustSignature
    };

    // Store event
    this.events.set(id, ktl4Event);
    this.lastHash = trustSignature;

    // Log to console for debugging
    console.log(`[KTL-4 GhostLog] 🔒 ${event.flowName}.${event.eventType}: ${event.status}`);
    console.log(`[KTL-4 GhostLog] 📝 Trust Signature: ${trustSignature}`);

    // Emit to external systems if configured (non-blocking)
    this.emitToExternalSystems(ktl4Event).catch(err => {
      // Silently fail - don't block event logging
      console.warn('[KTL-4 GhostLog] Failed to emit to external systems (non-blocking):', err.message);
    });

    return ktl4Event;
  }

  /**
   * Create trust signature for event integrity
   */
  private createTrustSignature(eventData: any): string {
    const dataString = JSON.stringify(eventData, Object.keys(eventData).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Verify trust chain integrity
   */
  verifyTrustChain(): { valid: boolean; brokenAt?: string; issues: string[] } {
    const issues: string[] = [];
    let lastHash: string | null = null;
    let brokenAt: string | undefined;

    const sortedEvents = Array.from(this.events.values())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (const event of sortedEvents) {
      if (lastHash && event.previousHash !== lastHash) {
        issues.push(`Trust chain broken at event ${event.id}`);
        brokenAt = event.id;
      }
      lastHash = event.trustSignature;
    }

    return {
      valid: issues.length === 0,
      brokenAt,
      issues
    };
  }

  /**
   * Update health status for a flow
   */
  updateHealthStatus(flowName: string, status: Ktl4HealthStatus): void {
    this.healthStatus.set(flowName, status);
    console.log(`[KTL-4 Health] ${flowName}: ${status.status} (${status.issues.length} issues)`);
  }

  /**
   * Get current health status for all flows
   */
  getAllHealthStatus(): Ktl4HealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Get events for a specific flow
   */
  getFlowEvents(flowName: string, limit: number = 100): Ktl4Event[] {
    return Array.from(this.events.values())
      .filter(event => event.flowName === flowName)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get critical events (error/critical status)
   */
  getCriticalEvents(limit: number = 50): Ktl4Event[] {
    return Array.from(this.events.values())
      .filter(event => event.status === 'error' || event.status === 'critical')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Emit events to external systems (API, database, etc.)
   * Non-blocking - failures are logged but don't prevent event storage
   */
  private async emitToExternalSystems(event: Ktl4Event): Promise<void> {
    // Only emit if we're in a browser context (client-side)
    // Server-side: skip external API calls to avoid URL errors
    if (typeof window === 'undefined') {
      // Server-side: skip fetch calls that would fail with relative URLs
      return;
    }

    try {
      // Build absolute URL for client-side fetch
      const baseUrl = window.location.origin;
      
      // Emit to GhostLog API
      await fetch(`${baseUrl}/api/ghost-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: event.timestamp,
          kind: `ktl4.${event.flowName}.${event.eventType}`,
          data: event
        })
      });

      // Emit to Reflex events
      await fetch(`${baseUrl}/api/reflex/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: `ktl4.${event.flowName}.${event.eventType}`,
          source: 'ktl4-ghostlog',
          sessionId: event.sessionId,
          paymentIntent: event.chargeId,
          payload: event.details
        })
      });
    } catch (error: any) {
      // Silently fail - don't block event logging
      // This is expected in server-side contexts
      if (error?.code !== 'ERR_INVALID_URL') {
        console.warn('[KTL-4 GhostLog] Failed to emit to external systems (non-blocking):', error?.message || error);
      }
    }
  }

  /**
   * Create repair run ID for tracking fixes
   */
  createRepairRunId(): string {
    return `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log repair action
   */
  async logRepairAction(
    flowName: 'payment_settlement' | 'session_lifecycle' | 'order_intake' | 'pos_sync',
    action: string,
    targetId: string,
    operatorId: string,
    details: Record<string, any>
  ): Promise<Ktl4Event> {
    return this.logEvent({
      flowName,
      eventType: 'repair_action',
      sessionId: targetId,
      operatorId,
      status: 'success',
      details: {
        action,
        targetId,
        ...details
      }
    });
  }
}

// Export singleton instance
export const ktl4GhostLog = Ktl4GhostLog.getInstance();

// Export convenience functions
export const logKtl4Event = (event: Omit<Ktl4Event, 'id' | 'timestamp' | 'trustSignature'>) => 
  ktl4GhostLog.logEvent(event);

export const updateKtl4Health = (flowName: string, status: Ktl4HealthStatus) => 
  ktl4GhostLog.updateHealthStatus(flowName, status);

export const getKtl4HealthStatus = () => ktl4GhostLog.getAllHealthStatus();

export const getKtl4CriticalEvents = (limit?: number) => ktl4GhostLog.getCriticalEvents(limit);

export const createKtl4RepairRun = () => ktl4GhostLog.createRepairRunId();

export const logKtl4Repair = (
  flowName: 'payment_settlement' | 'session_lifecycle' | 'order_intake' | 'pos_sync',
  action: string,
  targetId: string,
  operatorId: string,
  details: Record<string, any>
) => ktl4GhostLog.logRepairAction(flowName, action, targetId, operatorId, details);
