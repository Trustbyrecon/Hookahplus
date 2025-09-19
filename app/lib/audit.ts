// app/lib/audit.ts
export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export function logAction(action: string, actor: string, resource: string, details?: any): AuditLog {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    action,
    actor,
    resource,
    details
  };
  
  // In a real application, this would be stored in a database
  console.log('AUDIT:', log);
  
  return log;
}

export function logSecurityEvent(event: string, details: any): AuditLog {
  return logAction(`security.${event}`, 'system', 'security', details);
}

export function logUserAction(userId: string, action: string, resource: string, details?: any): AuditLog {
  return logAction(action, userId, resource, details);
}

export function logSystemEvent(event: string, details: any): AuditLog {
  return logAction(`system.${event}`, 'system', 'system', details);
}

// Alias for compatibility
export const logAuditEvent = logAction;

// Cross-venue operation checking
export function isCrossVenueOperation(venueId: string, targetVenueId: string): boolean {
  return venueId !== targetVenueId;
}