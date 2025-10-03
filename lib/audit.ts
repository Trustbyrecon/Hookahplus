export interface AuditLog {
  id: string;
  action: string;
  userId?: string;
  sessionId?: string;
  tableId?: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  trustLevel?: 'low' | 'medium' | 'high';
}

export interface ActionContext {
  userId?: string;
  sessionId?: string;
  tableId?: string;
  ipAddress?: string;
  userAgent?: string;
  trustLevel?: 'low' | 'medium' | 'high';
}

// Mock audit logs storage
const auditLogs: AuditLog[] = [];

export const logAction = async (
  action: string,
  details: Record<string, any> = {},
  context: ActionContext = {}
): Promise<void> => {
  const auditLog: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    userId: context.userId,
    sessionId: context.sessionId,
    tableId: context.tableId,
    details,
    timestamp: new Date(),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    trustLevel: context.trustLevel
  };

  auditLogs.push(auditLog);
  
  // In a real app, this would be stored in a database
  console.log(`[AUDIT] ${action}:`, {
    id: auditLog.id,
    timestamp: auditLog.timestamp.toISOString(),
    ...details
  });
};

export const getAuditLogs = (
  filters: {
    userId?: string;
    sessionId?: string;
    tableId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): AuditLog[] => {
  return auditLogs.filter(log => {
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.sessionId && log.sessionId !== filters.sessionId) return false;
    if (filters.tableId && log.tableId !== filters.tableId) return false;
    if (filters.action && log.action !== filters.action) return false;
    if (filters.startDate && log.timestamp < filters.startDate) return false;
    if (filters.endDate && log.timestamp > filters.endDate) return false;
    return true;
  });
};

export const getAuditLogById = (id: string): AuditLog | undefined => {
  return auditLogs.find(log => log.id === id);
};

export const getRecentAuditLogs = (limit: number = 50): AuditLog[] => {
  return auditLogs
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

// Audit action types
export const AUDIT_ACTIONS = {
  SESSION_CREATED: 'session.created',
  SESSION_UPDATED: 'session.updated',
  SESSION_CANCELLED: 'session.cancelled',
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  PAYMENT_PROCESSED: 'payment.processed',
  PAYMENT_FAILED: 'payment.failed',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_ACTION: 'user.action',
  SYSTEM_ERROR: 'system.error',
  TRUST_LOCK_VERIFIED: 'trust_lock.verified',
  TRUST_LOCK_FAILED: 'trust_lock.failed'
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
