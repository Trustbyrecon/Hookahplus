import { prisma } from "./db";
import type { AuthContext } from "./auth";

export type AuditAction = 
  | 'badge_awarded'
  | 'badge_revoked'
  | 'event_created'
  | 'profile_accessed'
  | 'data_exported'
  | 'cross_venue_read'
  | 'cross_venue_write';

export interface AuditLog {
  id: string;
  timestamp: number;
  action: AuditAction;
  actorId?: string;
  actorRole: string;
  targetProfileId?: string;
  targetVenueId?: string;
  sourceVenueId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// In-memory audit store for demo mode
const auditLogs: AuditLog[] = [];

export async function logAuditEvent(
  action: AuditAction,
  authContext: AuthContext,
  details: Record<string, any> = {},
  request?: { ip?: string; userAgent?: string }
) {
  const auditLog: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    action,
    actorId: authContext.actorId,
    actorRole: authContext.role,
    targetProfileId: details.profileId,
    targetVenueId: details.venueId,
    sourceVenueId: authContext.venueId,
    details,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
  };

  // Store in memory for demo mode
  auditLogs.push(auditLog);

  // If using DB mode, also store in database
  if (process.env.BADGES_V1_USE_DB === "true") {
    try {
      await prisma.$executeRaw`
        INSERT INTO audit_logs (
          id, timestamp, action, actor_id, actor_role, 
          target_profile_id, target_venue_id, source_venue_id, 
          details, ip_address, user_agent
        ) VALUES (
          ${auditLog.id}, ${new Date(auditLog.timestamp)}, ${auditLog.action}, 
          ${auditLog.actorId}, ${auditLog.actorRole}, ${auditLog.targetProfileId}, 
          ${auditLog.targetVenueId}, ${auditLog.sourceVenueId}, 
          ${JSON.stringify(auditLog.details)}, ${auditLog.ipAddress}, ${auditLog.userAgent}
        )
      `;
    } catch (error) {
      console.error('Failed to log audit event to database:', error);
    }
  }

  // Log cross-venue operations
  if (authContext.venueId && details.venueId && authContext.venueId !== details.venueId) {
    console.warn(`🚨 Cross-venue operation detected:`, {
      action,
      sourceVenue: authContext.venueId,
      targetVenue: details.venueId,
      actor: authContext.actorId,
      role: authContext.role
    });
  }
}

export async function getAuditLogs(
  profileId?: string,
  venueId?: string,
  action?: AuditAction,
  limit: number = 100
): Promise<AuditLog[]> {
  let filtered = auditLogs;

  if (profileId) {
    filtered = filtered.filter(log => log.targetProfileId === profileId);
  }
  if (venueId) {
    filtered = filtered.filter(log => 
      log.targetVenueId === venueId || log.sourceVenueId === venueId
    );
  }
  if (action) {
    filtered = filtered.filter(log => log.action === action);
  }

  return filtered
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export function isCrossVenueOperation(
  authContext: AuthContext,
  targetVenueId?: string
): boolean {
  return Boolean(
    authContext.venueId && 
    targetVenueId && 
    authContext.venueId !== targetVenueId
  );
}
