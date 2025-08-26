// app/lib/audit.ts
import type { Action, FireSession, User, TrustLevel } from "./workflow";

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  userRole: string;
  userTrustLevel: TrustLevel;
  action: Action;
  sessionId: string;
  sessionTable: string;
  previousState: string;
  newState: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuditStore {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getLogs: (filters?: AuditFilters) => AuditLog[];
  clearLogs: () => void;
  exportLogs: () => string;
}

export interface AuditFilters {
  userId?: string;
  sessionId?: string;
  actionType?: string;
  trustLevel?: TrustLevel;
  startTime?: number;
  endTime?: number;
}

// In-memory audit store (in production, this would be a database)
const globalAuditStore = globalThis as any;
if (!globalAuditStore.__AUDIT_STORE__) {
  globalAuditStore.__AUDIT_STORE__ = {
    logs: [],
    addLog: function(log: Omit<AuditLog, 'id' | 'timestamp'>) {
      const fullLog: AuditLog = {
        ...log,
        id: generateId(),
        timestamp: Date.now()
      };
      this.logs.push(fullLog);
      
      // Keep only last 1000 logs in memory
      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(-1000);
      }
    },
    getLogs: function(filters: AuditFilters = {}) {
      let filtered = this.logs;
      
      if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
      }
      if (filters.sessionId) {
        filtered = filtered.filter(log => log.sessionId === filters.sessionId);
      }
      if (filters.actionType) {
        filtered = filtered.filter(log => log.action.type === filters.actionType);
      }
      if (filters.trustLevel) {
        filtered = filtered.filter(log => log.userTrustLevel === filters.trustLevel);
      }
      if (filters.startTime) {
        filtered = filtered.filter(log => log.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        filtered = filtered.filter(log => log.timestamp <= filters.endTime!);
      }
      
      return filtered.sort((a, b) => b.timestamp - a.timestamp);
    },
    clearLogs: function() {
      this.logs = [];
    },
    exportLogs: function() {
      return JSON.stringify(this.logs, null, 2);
    }
  };
}

export const auditStore: AuditStore = globalAuditStore.__AUDIT_STORE__;

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Main audit logging function
export function logAction(
  user: User,
  action: Action,
  previousSession: FireSession,
  newSession: FireSession,
  metadata?: Record<string, any>
): void {
  const log: Omit<AuditLog, 'id' | 'timestamp'> = {
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    userTrustLevel: user.trustLevel,
    action,
    sessionId: previousSession.id,
    sessionTable: previousSession.table,
    previousState: previousSession.state,
    newState: newSession.state,
    ipAddress: getClientIP(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    metadata
  };
  
  auditStore.addLog(log);
  
  // In production, also send to external compliance system
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    sendToComplianceAPI(log);
  }
}

// Mock function to get client IP (in real app, this would come from request headers)
function getClientIP(): string | undefined {
  // This is a placeholder - in a real app, you'd get this from the request
  return undefined;
}

// Mock function to send to compliance API (in real app, this would be implemented)
async function sendToComplianceAPI(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  // Placeholder for production compliance API integration
  console.log('Sending to compliance API:', log);
}

// Utility functions for audit analysis
export function getTrustViolations(): AuditLog[] {
  return auditStore.getLogs().filter(log => 
    log.metadata?.trustViolation === true
  );
}

export function getUserActionHistory(userId: string): AuditLog[] {
  return auditStore.getLogs({ userId });
}

export function getSessionActionHistory(sessionId: string): AuditLog[] {
  return auditStore.getLogs({ sessionId });
}

export function getRecentActions(limit: number = 50): AuditLog[] {
  return auditStore.getLogs().slice(0, limit);
}
