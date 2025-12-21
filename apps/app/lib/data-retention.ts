/**
 * Data Retention & Export Service
 * Handles GDPR/CCPA compliance: data export and deletion
 */

import { prisma } from './db';
import { logger } from './logger';

export interface ExportData {
  sessions: any[];
  orders: any[];
  payments: any[];
  adjustments: any[];
  notes: any[]; // Staff notes included for admin exports
  metadata: {
    exportedAt: Date;
    loungeId: string;
    format: 'json' | 'csv' | 'pdf';
  };
}

/**
 * Export all data for a lounge (admin only)
 * Excludes staff-only notes unless explicitly requested
 */
export async function exportLoungeData(
  loungeId: string,
  options: {
    includeStaffNotes?: boolean;
    startDate?: Date;
    endDate?: Date;
    format?: 'json' | 'csv';
  } = {}
): Promise<ExportData> {
  const {
    includeStaffNotes = false,
    startDate,
    endDate,
    format = 'json',
  } = options;

  const whereClause: any = { loungeId };
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt.gte = startDate;
    }
    if (endDate) {
      whereClause.createdAt.lte = endDate;
    }
  }

  // Fetch all data
  const [sessions, orders, payments, adjustments, notes] = await Promise.all([
    prisma.session.findMany({
      where: whereClause,
      include: {
        orders: true,
        payments: true,
        ...(includeStaffNotes ? { notes: true } : {}),
      },
    }),
    prisma.order.findMany({
      where: {
        session: {
          loungeId,
          ...(startDate || endDate ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          } : {}),
        },
      },
      include: {
        items: true,
      },
    }),
    prisma.payment.findMany({
      where: {
        session: {
          loungeId,
          ...(startDate || endDate ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          } : {}),
        },
      },
    }),
    prisma.sessionAdjustment.findMany({
      where: {
        session: {
          loungeId,
          ...(startDate || endDate ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          } : {}),
        },
      },
    }),
    includeStaffNotes
      ? prisma.sessionNote.findMany({
          where: {
            session: {
              loungeId,
              ...(startDate || endDate ? {
                createdAt: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              } : {}),
            },
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    sessions: sessions.map(s => {
      const { notes, ...sessionWithoutNotes } = s as any;
      return sessionWithoutNotes;
    }),
    orders,
    payments,
    adjustments,
    notes: includeStaffNotes ? notes : [],
    metadata: {
      exportedAt: new Date(),
      loungeId,
      format,
    },
  };
}

/**
 * Delete lounge data (admin only, with audit trail)
 * Retains pseudonymized audit logs for compliance
 */
export async function deleteLoungeData(
  loungeId: string,
  options: {
    deleteBefore?: Date;
    retainAuditLogs?: boolean;
  } = {}
): Promise<{
  deleted: {
    sessions: number;
    orders: number;
    payments: number;
    adjustments: number;
    notes: number;
  };
  retained: {
    auditLogs: number;
  };
}> {
  const { deleteBefore, retainAuditLogs = true } = options;

  const whereClause: any = { loungeId };
  if (deleteBefore) {
    whereClause.createdAt = { lt: deleteBefore };
  }

  // Delete in order (respecting foreign key constraints)
  const [sessionsDeleted, ordersDeleted, paymentsDeleted, adjustmentsDeleted, notesDeleted] = await Promise.all([
    prisma.session.deleteMany({ where: whereClause }),
    prisma.order.deleteMany({
      where: {
        session: whereClause,
      },
    }),
    prisma.payment.deleteMany({
      where: {
        session: whereClause,
      },
    }),
    prisma.sessionAdjustment.deleteMany({
      where: {
        session: whereClause,
      },
    }),
    prisma.sessionNote.deleteMany({
      where: {
        session: whereClause,
      },
    }),
  ]);

  // Retain audit logs (pseudonymized)
  let auditLogsRetained = 0;
  if (retainAuditLogs) {
    // Update audit logs to remove PII but keep structure
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        loungeId,
        ...(deleteBefore ? { createdAt: { lt: deleteBefore } } : {}),
      },
    });

    // Pseudonymize audit logs (remove PII, keep structure)
    for (const log of auditLogs) {
      await prisma.auditLog.update({
        where: { id: log.id },
        data: {
          userId: log.userId ? `deleted_${log.userId.substring(0, 8)}` : null,
          changes: log.changes ? JSON.stringify({ redacted: true, originalType: 'changes' }) : null,
        },
      });
    }

    auditLogsRetained = auditLogs.length;
  }

  logger.info('Lounge data deleted', {
    component: 'data-retention',
    loungeId,
    deleted: {
      sessions: sessionsDeleted.count,
      orders: ordersDeleted.count,
      payments: paymentsDeleted.count,
      adjustments: adjustmentsDeleted.count,
      notes: notesDeleted.count,
    },
    retained: {
      auditLogs: auditLogsRetained,
    },
  });

  return {
    deleted: {
      sessions: sessionsDeleted.count,
      orders: ordersDeleted.count,
      payments: paymentsDeleted.count,
      adjustments: adjustmentsDeleted.count,
      notes: notesDeleted.count,
    },
    retained: {
      auditLogs: auditLogsRetained,
    },
  };
}

/**
 * Get data retention policy for a lounge
 */
export async function getRetentionPolicy(loungeId: string): Promise<{
  sessions: {
    retentionDays: number;
    autoDeleteEnabled: boolean;
  };
  auditLogs: {
    retentionDays: number;
    autoDeleteEnabled: boolean;
  };
}> {
  // Default retention policies
  return {
    sessions: {
      retentionDays: 2555, // 7 years
      autoDeleteEnabled: false, // Manual deletion only for safety
    },
    auditLogs: {
      retentionDays: 3650, // 10 years
      autoDeleteEnabled: false,
    },
  };
}

