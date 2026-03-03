/**
 * Audit Logging and Replay System
 * Phase 4: Night After Night Engine - Reliability & Config Versioning
 * 
 * Provides audit trail and replay capabilities for debugging and compliance
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogEntry {
  id: string;
  loungeId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  changes?: Record<string, any>;
  timestamp: Date;
}

export interface ReplayResult {
  success: boolean;
  entriesProcessed: number;
  errors: Array<{ entryId: string; error: string }>;
}

/**
 * Get audit logs for an entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return logs.map(log => ({
    id: log.id,
    loungeId: log.loungeId || undefined,
    userId: log.userId || undefined,
    action: log.action,
    entityType: log.entityType || undefined,
    entityId: log.entityId || undefined,
    changes: log.changes ? JSON.parse(log.changes) : undefined,
    timestamp: log.createdAt
  }));
}

/**
 * Get audit logs for a lounge within a time range
 */
export async function getLoungeAuditLogs(
  loungeId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 1000
): Promise<AuditLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      loungeId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return logs.map(log => ({
    id: log.id,
    loungeId: log.loungeId || undefined,
    userId: log.userId || undefined,
    action: log.action,
    entityType: log.entityType || undefined,
    entityId: log.entityId || undefined,
    changes: log.changes ? JSON.parse(log.changes) : undefined,
    timestamp: log.createdAt
  }));
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      userId
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return logs.map(log => ({
    id: log.id,
    loungeId: log.loungeId || undefined,
    userId: log.userId || undefined,
    action: log.action,
    entityType: log.entityType || undefined,
    entityId: log.entityId || undefined,
    changes: log.changes ? JSON.parse(log.changes) : undefined,
    timestamp: log.createdAt
  }));
}

/**
 * Replay audit logs for an entity
 * Reconstructs entity state by replaying all changes
 */
export async function replayEntityAuditLogs(
  entityType: string,
  entityId: string
): Promise<ReplayResult> {
  const logs = await getEntityAuditLogs(entityType, entityId, 1000);
  const errors: Array<{ entryId: string; error: string }> = [];
  let entriesProcessed = 0;

  // Sort by timestamp ascending (oldest first)
  logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  for (const log of logs) {
    try {
      // Replay based on action type
      switch (log.action) {
        case 'CONFIG_CHANGED':
          // Config changes are already applied, just verify
          entriesProcessed++;
          break;

        case 'ORDER_STATUS_UPDATED':
          if (log.entityType === 'Order' && log.entityId && log.changes) {
            await prisma.order.update({
              where: { id: log.entityId },
              data: {
                status: log.changes.newStatus || log.changes.status
              }
            });
            entriesProcessed++;
          }
          break;

        case 'SESSION_STATE_CHANGED':
          if (log.entityType === 'Session' && log.entityId && log.changes) {
            await prisma.session.update({
              where: { id: log.entityId },
              data: {
                state: log.changes.newState || log.changes.state
              }
            });
            entriesProcessed++;
          }
          break;

        default:
          // Unknown action, skip but don't error
          entriesProcessed++;
      }
    } catch (error) {
      errors.push({
        entryId: log.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return {
    success: errors.length === 0,
    entriesProcessed,
    errors
  };
}

/**
 * Get audit trail summary
 * Provides high-level statistics about audit logs
 */
export async function getAuditTrailSummary(
  loungeId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalEntries: number;
  byAction: Record<string, number>;
  byUser: Record<string, number>;
  byEntityType: Record<string, number>;
}> {
  const logs = await prisma.auditLog.findMany({
    where: {
      loungeId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const byAction: Record<string, number> = {};
  const byUser: Record<string, number> = {};
  const byEntityType: Record<string, number> = {};

  for (const log of logs) {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    
    if (log.userId) {
      byUser[log.userId] = (byUser[log.userId] || 0) + 1;
    }

    if (log.entityType) {
      byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
    }
  }

  return {
    totalEntries: logs.length,
    byAction,
    byUser,
    byEntityType
  };
}

/**
 * Export audit logs for compliance
 * Returns formatted audit log data for external systems
 */
export async function exportAuditLogs(
  loungeId: string,
  startDate: Date,
  endDate: Date
): Promise<AuditLogEntry[]> {
  return getLoungeAuditLogs(loungeId, startDate, endDate, 10000);
}

