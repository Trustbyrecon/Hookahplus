/**
 * Auto-Cleanup Jobs
 * Phase 4: Night After Night Engine - Reliability & Config Versioning
 * 
 * Scheduled jobs for maintaining data integrity and cleaning up stale data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** CODIGO Week 1: Max hours a session can stay ACTIVE before flagged as dangling (soft-launch lounges only). */
const DANGLING_SESSION_THRESHOLD_HOURS = 4;

/**
 * Close dangling sessions for soft-launch lounges (CODIGO Week 1 data quality).
 * Sessions ACTIVE for > threshold hours in lounges with softLaunchEnabled are auto-closed
 * with edgeCase=DANGLING_SESSION and edgeNote for reporting.
 */
export async function closeDanglingSessionsForSoftLaunch(): Promise<{
  closed: number;
  errors: number;
}> {
  let closed = 0;
  let errors = 0;

  try {
    const softLaunchLoungeIds = await prisma.loungeConfig.findMany({
      where: { softLaunchEnabled: true },
      select: { loungeId: true },
    });

    const loungeIds = softLaunchLoungeIds.map((c) => c.loungeId);
    if (loungeIds.length === 0) {
      return { closed: 0, errors: 0 };
    }

    const now = new Date();
    const threshold = new Date(now.getTime() - DANGLING_SESSION_THRESHOLD_HOURS * 60 * 60 * 1000);

    const danglingSessions = await prisma.session.findMany({
      where: {
        state: 'ACTIVE',
        loungeId: { in: loungeIds },
        startedAt: { not: null, lt: threshold },
      },
    });

    for (const session of danglingSessions) {
      try {
        await prisma.session.update({
          where: { id: session.id },
          data: {
            state: 'CLOSED',
            endedAt: now,
            edgeCase: 'DANGLING_SESSION',
            edgeNote: `Auto-closed: Session active >${DANGLING_SESSION_THRESHOLD_HOURS}h (CODIGO Week 1 data quality)`,
          },
        });
        closed++;
      } catch (error) {
        console.error(`[cleanup] Error closing dangling session ${session.id}:`, error);
        errors++;
      }
    }

    if (closed > 0) {
      console.log(`[cleanup] Closed ${closed} dangling sessions (soft-launch lounges), ${errors} errors`);
    }
  } catch (error) {
    console.error('[cleanup] Error in closeDanglingSessionsForSoftLaunch:', error);
    errors++;
  }

  return { closed, errors };
}

/**
 * Auto-close abandoned sessions
 * Closes sessions that are still ACTIVE but haven't been updated in 24+ hours
 */
export async function closeAbandonedSessions(): Promise<{
  closed: number;
  errors: number;
}> {
  let closed = 0;
  let errors = 0;

  try {
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const staleSessions = await prisma.session.findMany({
      where: {
        state: 'ACTIVE',
        updatedAt: {
          lt: staleThreshold
        }
      }
    });

    for (const session of staleSessions) {
      try {
        await prisma.session.update({
          where: { id: session.id },
          data: {
            state: 'CLOSED',
            endedAt: now,
            edgeNote: `Auto-closed: Abandoned session (inactive for 24+ hours)`
          }
        });
        closed++;
      } catch (error) {
        console.error(`[cleanup] Error closing session ${session.id}:`, error);
        errors++;
      }
    }

    console.log(`[cleanup] Closed ${closed} abandoned sessions, ${errors} errors`);
  } catch (error) {
    console.error('[cleanup] Error in closeAbandonedSessions:', error);
    errors++;
  }

  return { closed, errors };
}

/**
 * Mark stale orders as EXPIRED
 * Orders that have been PENDING for more than 2 hours
 */
export async function expireStaleOrders(): Promise<{
  expired: number;
  errors: number;
}> {
  let expired = 0;
  let errors = 0;

  try {
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

    const staleOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: staleThreshold
        }
      }
    });

    for (const order of staleOrders) {
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            specialInstructions: `Auto-expired: Order pending for 2+ hours`
          }
        });
        expired++;
      } catch (error) {
        console.error(`[cleanup] Error expiring order ${order.id}:`, error);
        errors++;
      }
    }

    console.log(`[cleanup] Expired ${expired} stale orders, ${errors} errors`);
  } catch (error) {
    console.error('[cleanup] Error in expireStaleOrders:', error);
    errors++;
  }

  return { expired, errors };
}

/**
 * Re-sync stuck payment sessions
 * Sessions with PAYMENT_PENDING status for more than 30 minutes
 */
export async function resyncStuckPayments(): Promise<{
  resynced: number;
  errors: number;
}> {
  let resynced = 0;
  let errors = 0;

  try {
    const now = new Date();
    const stuckThreshold = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

    const stuckSessions = await prisma.session.findMany({
      where: {
        paymentStatus: 'pending',
        updatedAt: {
          lt: stuckThreshold
        }
      }
    });

    for (const session of stuckSessions) {
      try {
        // TODO: Check payment provider status
        // For now, just log and mark for manual review
        await prisma.session.update({
          where: { id: session.id },
          data: {
            edgeCase: 'PAYMENT_STUCK',
            edgeNote: `Payment pending for 30+ minutes - requires manual review`
          }
        });
        resynced++;
      } catch (error) {
        console.error(`[cleanup] Error resyncing payment for session ${session.id}:`, error);
        errors++;
      }
    }

    console.log(`[cleanup] Resynced ${resynced} stuck payments, ${errors} errors`);
  } catch (error) {
    console.error('[cleanup] Error in resyncStuckPayments:', error);
    errors++;
  }

  return { resynced, errors };
}

/**
 * Expire old pre-orders
 * Pre-orders that haven't been converted and are past their scheduled time
 */
export async function expireOldPreOrders(): Promise<{
  expired: number;
  errors: number;
}> {
  let expired = 0;
  let errors = 0;

  try {
    const now = new Date();

    const oldPreOrders = await prisma.preOrder.findMany({
      where: {
        status: 'PENDING',
        OR: [
          {
            expiresAt: {
              lt: now
            }
          },
          {
            scheduledTime: {
              lt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours past scheduled time
            }
          }
        ]
      }
    });

    for (const preorder of oldPreOrders) {
      try {
        await prisma.preOrder.update({
          where: { id: preorder.id },
          data: {
            status: 'EXPIRED'
          }
        });
        expired++;
      } catch (error) {
        console.error(`[cleanup] Error expiring pre-order ${preorder.id}:`, error);
        errors++;
      }
    }

    console.log(`[cleanup] Expired ${expired} old pre-orders, ${errors} errors`);
  } catch (error) {
    console.error('[cleanup] Error in expireOldPreOrders:', error);
    errors++;
  }

  return { expired, errors };
}

/**
 * Run all cleanup jobs
 */
export async function runAllCleanupJobs(): Promise<{
  abandonedSessions: { closed: number; errors: number };
  danglingSessionsSoftLaunch: { closed: number; errors: number };
  staleOrders: { expired: number; errors: number };
  stuckPayments: { resynced: number; errors: number };
  oldPreOrders: { expired: number; errors: number };
}> {
  console.log('[cleanup] Starting all cleanup jobs...');

  const results = {
    abandonedSessions: await closeAbandonedSessions(),
    danglingSessionsSoftLaunch: await closeDanglingSessionsForSoftLaunch(),
    staleOrders: await expireStaleOrders(),
    stuckPayments: await resyncStuckPayments(),
    oldPreOrders: await expireOldPreOrders(),
  };

  console.log('[cleanup] All cleanup jobs completed:', results);
  return results;
}

