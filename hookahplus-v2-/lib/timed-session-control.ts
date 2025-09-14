// hookahplus-v2-/lib/timed-session-control.ts
import { EventEmitter } from 'events';

export interface TimedSessionConfig {
  sessionId: string;
  tableId: string;
  customerId: string;
  duration: number; // in minutes
  gracePeriod: number; // in minutes
  autoExtend: boolean;
  maxExtensions: number;
  basePrice: number; // in cents
  extensionPrice: number; // in cents per 15 minutes
  warningThresholds: number[]; // minutes before expiry to warn
}

export interface SessionTimer {
  sessionId: string;
  startTime: number;
  endTime: number;
  remainingTime: number;
  extensions: number;
  status: 'active' | 'warning' | 'expired' | 'extended' | 'completed';
  lastWarning: number;
  totalRevenue: number;
}

export interface SessionEvent {
  type: 'started' | 'warning' | 'extended' | 'expired' | 'completed' | 'auto_extended';
  sessionId: string;
  tableId: string;
  timestamp: number;
  data?: any;
}

export class TimedSessionControl extends EventEmitter {
  private sessions: Map<string, SessionTimer> = new Map();
  private configs: Map<string, TimedSessionConfig> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  // Start timed session control system
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('⏰ Timed Session Control System Started');
    
    // Check all sessions every 30 seconds
    setInterval(() => {
      this.checkAllSessions();
    }, 30000);
  }

  // Stop timed session control system
  stop() {
    this.isRunning = false;
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    console.log('⏹️ Timed Session Control System Stopped');
  }

  // Create a new timed session
  createSession(config: TimedSessionConfig): SessionTimer {
    const now = Date.now();
    const endTime = now + (config.duration * 60000);
    
    const session: SessionTimer = {
      sessionId: config.sessionId,
      startTime: now,
      endTime,
      remainingTime: config.duration * 60, // in seconds
      extensions: 0,
      status: 'active',
      lastWarning: 0,
      totalRevenue: config.basePrice
    };

    this.sessions.set(config.sessionId, session);
    this.configs.set(config.sessionId, config);
    
    // Start individual session timer
    this.startSessionTimer(config.sessionId);
    
    this.emit('session_started', {
      type: 'started',
      sessionId: config.sessionId,
      tableId: config.tableId,
      timestamp: now,
      data: { duration: config.duration, basePrice: config.basePrice }
    });

    console.log(`⏰ Timed session created: ${config.sessionId} (${config.duration}min, $${(config.basePrice/100).toFixed(2)})`);
    return session;
  }

  // Start individual session timer
  private startSessionTimer(sessionId: string) {
    const interval = setInterval(() => {
      this.updateSession(sessionId);
    }, 1000); // Update every second
    
    this.intervals.set(sessionId, interval);
  }

  // Update session timer
  private updateSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    const config = this.configs.get(sessionId);
    
    if (!session || !config) return;

    const now = Date.now();
    const remainingMs = session.endTime - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    session.remainingTime = remainingSeconds;

    // Check for warnings
    if (remainingMinutes > 0 && remainingMinutes <= Math.max(...config.warningThresholds)) {
      const warningThreshold = config.warningThresholds.find(t => remainingMinutes <= t);
      if (warningThreshold && session.lastWarning !== warningThreshold) {
        session.lastWarning = warningThreshold;
        session.status = 'warning';
        
        this.emit('session_warning', {
          type: 'warning',
          sessionId,
          tableId: config.tableId,
          timestamp: now,
          data: { 
            remainingMinutes, 
            warningThreshold,
            canExtend: session.extensions < config.maxExtensions
          }
        });
        
        console.log(`⚠️ Session ${sessionId} warning: ${remainingMinutes} minutes remaining`);
      }
    }

    // Check for expiry
    if (remainingMs <= 0) {
      this.handleSessionExpiry(sessionId);
    }
  }

  // Handle session expiry
  private handleSessionExpiry(sessionId: string) {
    const session = this.sessions.get(sessionId);
    const config = this.configs.get(sessionId);
    
    if (!session || !config) return;

    // Check for auto-extend
    if (config.autoExtend && session.extensions < config.maxExtensions) {
      this.extendSession(sessionId, 15); // Auto-extend by 15 minutes
      return;
    }

    // Session expired
    session.status = 'expired';
    session.remainingTime = 0;
    
    this.emit('session_expired', {
      type: 'expired',
      sessionId,
      tableId: config.tableId,
      timestamp: Date.now(),
      data: { 
        totalRevenue: session.totalRevenue,
        extensions: session.extensions,
        duration: Math.round((Date.now() - session.startTime) / 60000)
      }
    });

    console.log(`⏰ Session ${sessionId} expired after ${session.extensions} extensions`);
    
    // Clean up
    this.cleanupSession(sessionId);
  }

  // Extend session
  extendSession(sessionId: string, minutes: number = 15): boolean {
    const session = this.sessions.get(sessionId);
    const config = this.configs.get(sessionId);
    
    if (!session || !config) return false;
    if (session.extensions >= config.maxExtensions) return false;

    const extensionCost = Math.ceil(minutes / 15) * config.extensionPrice;
    session.endTime += minutes * 60000;
    session.extensions++;
    session.totalRevenue += extensionCost;
    session.status = 'extended';
    session.lastWarning = 0; // Reset warning

    this.emit('session_extended', {
      type: 'extended',
      sessionId,
      tableId: config.tableId,
      timestamp: Date.now(),
      data: { 
        extensionMinutes: minutes,
        extensionCost,
        totalExtensions: session.extensions,
        newEndTime: new Date(session.endTime).toISOString()
      }
    });

    console.log(`⏰ Session ${sessionId} extended by ${minutes}min (+$${(extensionCost/100).toFixed(2)})`);
    return true;
  }

  // Complete session
  completeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    const config = this.configs.get(sessionId);
    
    if (!session || !config) return false;

    session.status = 'completed';
    
    this.emit('session_completed', {
      type: 'completed',
      sessionId,
      tableId: config.tableId,
      timestamp: Date.now(),
      data: { 
        totalRevenue: session.totalRevenue,
        extensions: session.extensions,
        duration: Math.round((Date.now() - session.startTime) / 60000)
      }
    });

    console.log(`✅ Session ${sessionId} completed - Revenue: $${(session.totalRevenue/100).toFixed(2)}`);
    
    this.cleanupSession(sessionId);
    return true;
  }

  // Get session status
  getSession(sessionId: string): SessionTimer | null {
    return this.sessions.get(sessionId) || null;
  }

  // Get all active sessions
  getActiveSessions(): SessionTimer[] {
    return Array.from(this.sessions.values()).filter(s => 
      s.status === 'active' || s.status === 'warning' || s.status === 'extended'
    );
  }

  // Get sessions by table
  getSessionsByTable(tableId: string): SessionTimer[] {
    return Array.from(this.sessions.values()).filter(s => {
      const config = this.configs.get(s.sessionId);
      return config?.tableId === tableId;
    });
  }

  // Check all sessions for warnings/expiry
  private checkAllSessions() {
    this.sessions.forEach((session, sessionId) => {
      this.updateSession(sessionId);
    });
  }

  // Cleanup expired session
  private cleanupSession(sessionId: string) {
    const interval = this.intervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(sessionId);
    }
    this.sessions.delete(sessionId);
    this.configs.delete(sessionId);
  }

  // Get revenue analytics
  getRevenueAnalytics(): {
    totalRevenue: number;
    averageSessionValue: number;
    totalSessions: number;
    averageExtensions: number;
    peakHours: { hour: number; sessions: number }[];
  } {
    const sessions = Array.from(this.sessions.values());
    const totalRevenue = sessions.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalSessions = sessions.length;
    const averageSessionValue = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    const averageExtensions = totalSessions > 0 ? 
      sessions.reduce((sum, s) => sum + s.extensions, 0) / totalSessions : 0;

    // Calculate peak hours (simplified)
    const peakHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sessions: sessions.filter(s => {
        const sessionHour = new Date(s.startTime).getHours();
        return sessionHour === hour;
      }).length
    }));

    return {
      totalRevenue,
      averageSessionValue,
      totalSessions,
      averageExtensions,
      peakHours
    };
  }
}

// Export singleton instance
export const timedSessionControl = new TimedSessionControl();
