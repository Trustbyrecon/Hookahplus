/**
 * KTL-4 Integration Library for Payment Server
 * 
 * Provides integration between the payment server and KTL-4 Keep-The-Lights-On system
 */

import { Ktl4Event } from '../types/ktl4';

// Mock implementation - in production, this would connect to the actual KTL-4 system
class Ktl4Integration {
  private static instance: Ktl4Integration;
  private events: Ktl4Event[] = [];

  static getInstance(): Ktl4Integration {
    if (!Ktl4Integration.instance) {
      Ktl4Integration.instance = new Ktl4Integration();
    }
    return Ktl4Integration.instance;
  }

  async logEvent(event: Omit<Ktl4Event, 'id' | 'timestamp' | 'trustSignature'>): Promise<Ktl4Event> {
    const id = `ktl4_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const ktl4Event: Ktl4Event = {
      ...event,
      id,
      timestamp,
      trustSignature: this.createTrustSignature(event)
    };

    this.events.push(ktl4Event);
    
    // Log to console for debugging
    console.log(`[KTL-4] 🔒 ${event.flowName}.${event.eventType}: ${event.status}`);
    
    // In production, this would send to the actual KTL-4 system
    // await fetch('http://localhost:3000/api/ktl4/ghost-log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(kt4Event)
    // });

    return ktl4Event;
  }

  private createTrustSignature(event: any): string {
    const crypto = require('crypto');
    const dataString = JSON.stringify(event, Object.keys(event).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  async runHealthCheck(flowName: string, checkType: string): Promise<any> {
    // Mock health check - in production, this would call the actual KTL-4 health checker
    const mockHealthCheck = {
      flowName,
      checkType,
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      issues: [],
      metrics: {
        totalEvents: this.events.length,
        recentEvents: this.events.filter(e => 
          new Date(e.timestamp).getTime() > Date.now() - 60000
        ).length
      }
    };

    console.log(`[KTL-4 Health] ${flowName}.${checkType}: ${mockHealthCheck.status}`);
    
    return mockHealthCheck;
  }

  createRepairRunId(): string {
    return `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getEvents(limit: number = 100): Ktl4Event[] {
    return this.events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getCriticalEvents(): Ktl4Event[] {
    return this.events.filter(e => e.status === 'error' || e.status === 'critical');
  }
}

// Export singleton instance
export const ktl4GhostLog = Ktl4Integration.getInstance();

// Export convenience functions
export const logKtl4Event = (event: Omit<Ktl4Event, 'id' | 'timestamp' | 'trustSignature'>) => 
  ktl4GhostLog.logEvent(event);

export const runKtl4HealthCheck = (flowName: string, checkType: string) =>
  ktl4GhostLog.runHealthCheck(flowName, checkType);

export const createKtl4RepairRun = () => ktl4GhostLog.createRepairRunId();

export const getKtl4Events = (limit?: number) => ktl4GhostLog.getEvents(limit);

export const getKtl4CriticalEvents = () => ktl4GhostLog.getCriticalEvents();
