/**
 * Event Workers
 * Phase 3: Night After Night Engine - Event System
 * 
 * Workers that consume events and perform background tasks
 */

import { PrismaClient } from '@prisma/client';
import { EventMessage, EventHandler } from './types';
import { eventQueue } from './queue';
import { logKtl4Event } from '../ktl4-ghostlog';

const prisma = new PrismaClient();

/**
 * Close stale sessions at 4am
 * Auto-closes sessions that are still ACTIVE but haven't been updated in 24+ hours
 */
export const closeStaleSessions: EventHandler = async (event: EventMessage) => {
  if (event.type !== 'TimerExpired' && event.type !== 'SessionClosed') {
    return; // Only process on timer expiration or manual close
  }

  try {
    const now = new Date();
    const fourAM = new Date(now);
    fourAM.setHours(4, 0, 0, 0);

    // Only run at 4am
    if (now.getHours() !== 4) {
      return;
    }

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
      await prisma.session.update({
        where: { id: session.id },
        data: {
          state: 'CLOSED',
          endedAt: now,
          edgeNote: 'Auto-closed: Stale session (24+ hours inactive)'
        }
      });

      // Publish SessionClosed event
      await eventQueue.publish({
        id: `evt_${Date.now()}_${session.id}`,
        type: 'SessionClosed',
        sessionId: session.id,
        loungeId: session.loungeId,
        payload: {
          reason: 'stale',
          autoClosed: true
        },
        timestamp: now
      });
    }

    console.log(`[closeStaleSessions] Closed ${staleSessions.length} stale sessions`);
  } catch (error) {
    console.error('[closeStaleSessions] Error:', error);
  }
};

/**
 * Handle post-close workflows after session settlement
 * Triggers high-value workflows like analytics, reporting, and cleanup
 */
export const handlePostCloseWorkflows: EventHandler = async (event: EventMessage) => {
  if (event.type !== 'SessionClosed') {
    return; // Only process SessionClosed events
  }

  try {
    const { sessionId, loungeId, payload } = event;
    
    if (!sessionId) {
      console.warn('[handlePostCloseWorkflows] No sessionId in event');
      return;
    }

    console.log(`[handlePostCloseWorkflows] Processing post-close workflows for session ${sessionId}`);

    // Fetch session details
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          include: {
            items: true
          }
        }
      }
    });

    if (!session) {
      console.warn(`[handlePostCloseWorkflows] Session ${sessionId} not found`);
      return;
    }

    // Only process if settlement was completed
    if (!payload?.settlementCompleted) {
      console.log(`[handlePostCloseWorkflows] Settlement not completed for session ${sessionId}, skipping workflows`);
      return;
    }

    // 1. Update analytics and reporting
    try {
      // Log session completion for analytics
      await logKtl4Event({
        flowName: 'session_completion',
        eventType: 'session_closed',
        sessionId: sessionId,
        loungeId: loungeId || session.loungeId,
        status: 'success',
        details: {
          finalAmount: payload.finalAmount || session.priceCents,
          duration: session.endedAt && session.startedAt 
            ? Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000 / 60)
            : null,
          tableId: session.tableId,
          source: session.source,
        }
      });
      console.log(`[handlePostCloseWorkflows] Analytics updated for session ${sessionId}`);
    } catch (analyticsError) {
      console.error(`[handlePostCloseWorkflows] Failed to update analytics:`, analyticsError);
      // Non-blocking
    }

    // 2. Trigger loyalty program updates (if applicable)
    try {
      if (session.customerPhone || session.customerRef) {
        // This would integrate with loyalty system
        // For now, just log that it should be triggered
        console.log(`[handlePostCloseWorkflows] Loyalty update triggered for session ${sessionId}`);
        // TODO: Integrate with loyalty system when available
      }
    } catch (loyaltyError) {
      console.error(`[handlePostCloseWorkflows] Failed to update loyalty:`, loyaltyError);
      // Non-blocking
    }

    // 3. Archive session data (move to historical storage if needed)
    try {
      // Mark session as archived/processed
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          tableNotes: `${session.tableNotes || ''}\n[${new Date().toISOString()}] Post-close workflows completed`.trim()
        }
      });
      console.log(`[handlePostCloseWorkflows] Session ${sessionId} archived`);
    } catch (archiveError) {
      console.error(`[handlePostCloseWorkflows] Failed to archive session:`, archiveError);
      // Non-blocking
    }

    // 4. Trigger any custom high-value workflows
    // This is where you can add custom business logic
    // Examples: email receipts, customer feedback requests, table availability updates, etc.
    try {
      // Example: Trigger table availability update
      if (session.tableId) {
        console.log(`[handlePostCloseWorkflows] Table ${session.tableId} is now available`);
        // TODO: Update table availability system
      }
    } catch (workflowError) {
      console.error(`[handlePostCloseWorkflows] Custom workflow failed:`, workflowError);
      // Non-blocking
    }

    console.log(`[handlePostCloseWorkflows] ✅ Post-close workflows completed for session ${sessionId}`);
  } catch (error) {
    console.error('[handlePostCloseWorkflows] Error:', error);
  }
};

/**
 * Send timer reminders
 * Alerts staff when sessions are approaching time limits
 */
export const sendTimerReminders: EventHandler = async (event: EventMessage) => {
  if (event.type !== 'TimerStarted' && event.type !== 'TimerExtended') {
    return;
  }

  try {
    const sessionId = event.sessionId;
    if (!sessionId) return;

    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session || !session.timerStartedAt || !session.timerDuration) {
      return;
    }

    const now = new Date();
    const startedAt = session.timerStartedAt;
    const durationSeconds = session.timerDuration;
    const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
    const remainingSeconds = durationSeconds - elapsedSeconds;
    const remainingMinutes = Math.floor(remainingSeconds / 60);

    // Alert at 10 minutes remaining
    if (remainingMinutes <= 10 && remainingMinutes > 5) {
      // TODO: Send notification to staff dashboard
      console.log(`[sendTimerReminders] Session ${sessionId} has ${remainingMinutes} minutes remaining`);
      
      // Could integrate with notification service here
      // await notificationService.send({
      //   type: 'timer_warning',
      //   sessionId,
      //   message: `Session at table ${session.tableId} has ${remainingMinutes} minutes remaining`
      // });
    }

    // Alert at 5 minutes remaining
    if (remainingMinutes <= 5 && remainingMinutes > 0) {
      console.log(`[sendTimerReminders] Session ${sessionId} has ${remainingMinutes} minutes remaining - URGENT`);
    }

    // Alert when expired
    if (remainingSeconds <= 0) {
      await eventQueue.publish({
        id: `evt_${Date.now()}_${sessionId}`,
        type: 'TimerExpired',
        sessionId,
        loungeId: session.loungeId,
        payload: {
          elapsedMinutes: Math.floor(elapsedSeconds / 60),
          overageMinutes: Math.abs(remainingMinutes)
        },
        timestamp: now
      });
    }
  } catch (error) {
    console.error('[sendTimerReminders] Error:', error);
  }
};

/**
 * Trigger coal refill hints
 * Notifies prep bar when coal refills are overdue
 */
export const triggerCoalRefillHints: EventHandler = async (event: EventMessage) => {
  if (event.type !== 'CoalRefill' && event.type !== 'OrderServed') {
    return;
  }

  try {
    // Find active sessions that might need coal refills
    // Typically, coals need refilling every 30-45 minutes
    const activeSessions = await prisma.session.findMany({
      where: {
        state: 'ACTIVE',
        timerStatus: 'running'
      },
      include: {
        orders: {
          where: {
            status: 'SERVED'
          },
          orderBy: {
            servedAt: 'desc'
          },
          take: 1
        }
      }
    });

    const now = new Date();
    const refillThreshold = 30 * 60 * 1000; // 30 minutes in milliseconds

    for (const session of activeSessions) {
      const lastServed = session.orders[0]?.servedAt;
      if (!lastServed) continue;

      const timeSinceServed = now.getTime() - lastServed.getTime();

      if (timeSinceServed > refillThreshold) {
        // TODO: Send hint to prep bar
        console.log(`[triggerCoalRefillHints] Session ${session.id} may need coal refill (${Math.floor(timeSinceServed / 60000)} minutes since last served)`);
        
        // Could integrate with prep bar notification system
        // await prepBarService.sendHint({
        //   sessionId: session.id,
        //   tableId: session.tableId,
        //   message: 'Coal refill may be needed'
        // });
      }
    }
  } catch (error) {
    console.error('[triggerCoalRefillHints] Error:', error);
  }
};

/**
 * Aggregate nightly stats
 * Collects revenue, sessions, and performance metrics
 */
export const aggregateNightlyStats: EventHandler = async (event: EventMessage) => {
  // Run this on SessionClosed events or on a schedule
  if (event.type !== 'SessionClosed' && event.type !== 'PaymentConfirmed') {
    return;
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Aggregate stats for today
    const sessions = await prisma.session.findMany({
      where: {
        loungeId: event.loungeId,
        createdAt: {
          gte: startOfDay
        },
        state: 'CLOSED'
      },
      include: {
        orders: {
          include: {
            items: true
          }
        }
      }
    });

    const stats = {
      totalSessions: sessions.length,
      totalRevenue: sessions.reduce((sum, s) => sum + (s.priceCents || 0), 0),
      averageDuration: sessions.reduce((sum, s) => {
        if (s.durationSecs) {
          return sum + s.durationSecs;
        }
        return sum;
      }, 0) / sessions.length || 0,
      totalOrders: sessions.reduce((sum, s) => sum + s.orders.length, 0),
      byZone: {} as Record<string, number>
    };

    // Group by zone if available
    for (const session of sessions) {
      const zone = session.zone || 'unknown';
      stats.byZone[zone] = (stats.byZone[zone] || 0) + 1;
    }

    console.log(`[aggregateNightlyStats] Lounge ${event.loungeId} stats:`, stats);

    // TODO: Store in analytics table or send to analytics service
    // await analyticsService.record({
    //   loungeId: event.loungeId,
    //   date: startOfDay.toISOString(),
    //   stats
    // });
  } catch (error) {
    console.error('[aggregateNightlyStats] Error:', error);
  }
};

/**
 * Sync loyalty profiles
 * Updates loyalty profiles when sessions close
 */
export const syncLoyaltyProfiles: EventHandler = async (event: EventMessage) => {
  if (event.type !== 'SessionClosed' && event.type !== 'PaymentConfirmed') {
    return;
  }

  try {
    const sessionId = event.sessionId;
    if (!sessionId) return;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        notes: true
      }
    });

    if (!session || !session.customerRef) {
      return; // No customer to sync
    }

    // Find or create loyalty profile
    const guestKey = session.customerPhone || session.customerRef;
    const loyaltyProfile = await prisma.loyaltyProfile.upsert({
      where: {
        loungeId_guestKey: {
          loungeId: session.loungeId,
          guestKey
        }
      },
      update: {
        visitCount: { increment: 1 },
        cumulativeSpend: { increment: session.priceCents || 0 },
        lastVisitAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        loungeId: session.loungeId,
        guestKey,
        visitCount: 1,
        cumulativeSpend: session.priceCents || 0,
        lastVisitAt: new Date()
      }
    });

    // Bind session notes to loyalty profile
    for (const note of session.notes) {
      await prisma.loyaltyNoteBinding.upsert({
        where: {
          loyaltyProfileId_sessionNoteId: {
            loyaltyProfileId: loyaltyProfile.id,
            sessionNoteId: note.id
          }
        },
        update: {},
        create: {
          loyaltyProfileId: loyaltyProfile.id,
          sessionNoteId: note.id
        }
      });
    }

    console.log(`[syncLoyaltyProfiles] Synced profile for guest ${guestKey} in lounge ${session.loungeId}`);
  } catch (error) {
    console.error('[syncLoyaltyProfiles] Error:', error);
  }
};

/**
 * Initialize all event workers
 * Subscribes workers to their respective event types
 */
export function initializeWorkers() {
  // Subscribe workers to events
  eventQueue.subscribe('TimerExpired', closeStaleSessions);
  eventQueue.subscribe('SessionClosed', closeStaleSessions);
  
  eventQueue.subscribe('TimerStarted', sendTimerReminders);
  eventQueue.subscribe('TimerExtended', sendTimerReminders);
  
  eventQueue.subscribe('CoalRefill', triggerCoalRefillHints);
  eventQueue.subscribe('OrderServed', triggerCoalRefillHints);
  
  eventQueue.subscribe('SessionClosed', aggregateNightlyStats);
  eventQueue.subscribe('PaymentConfirmed', aggregateNightlyStats);
  
  eventQueue.subscribe('SessionClosed', syncLoyaltyProfiles);
  eventQueue.subscribe('PaymentConfirmed', syncLoyaltyProfiles);

  // Post-close workflows - runs after settlement is complete
  eventQueue.subscribe('SessionClosed', handlePostCloseWorkflows);

  console.log('[EventWorkers] All workers initialized');
}

