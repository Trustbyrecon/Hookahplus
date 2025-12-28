/**
 * Session Events Service
 * Manages append-only session lifecycle event ledger
 */

import { prisma } from './db';
import { randomUUID } from 'crypto';
import crypto from 'crypto';

export type SessionEventType =
  | 'started'
  | 'paused'
  | 'resumed'
  | 'ended'
  | 'transferred'
  | 'adjusted'
  | 'claimed'
  | 'delivered'
  | 'payment_initiated'
  | 'payment_completed'
  | 'canceled';

export interface SessionEventData {
  eventType: SessionEventType;
  sessionId: string;
  eventData?: Record<string, any>;
  actorId?: string;
  actorRole?: string;
}

export interface SessionEventRecord {
  id: string;
  sessionId: string;
  eventType: SessionEventType;
  eventData: Record<string, any> | null;
  actorId: string | null;
  actorRole: string | null;
  timestamp: Date;
}

/**
 * Log a session event (append-only)
 * This creates an immutable record of session state changes
 */
export async function logSessionEvent(
  event: SessionEventData
): Promise<SessionEventRecord> {
  // Generate unique ID for the event
  const eventId = `evt_${event.sessionId}_${Date.now()}_${randomUUID().substring(0, 8)}`;
  
  // Prepare event data with actor information
  const eventData = {
    ...(event.eventData || {}),
    ...(event.actorId && { actorId: event.actorId }),
    ...(event.actorRole && { actorRole: event.actorRole }),
  };
  
  // Generate payload seal (SHA256 hash of event data for integrity)
  const payloadSeal = crypto
    .createHash('sha256')
    .update(JSON.stringify({
      sessionId: event.sessionId,
      type: event.eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
    }))
    .digest('hex');

  const sessionEvent = await prisma.sessionEvent.create({
    data: {
      id: eventId,
      sessionId: event.sessionId,
      type: event.eventType, // Schema uses 'type' not 'eventType'
      payloadSeal: payloadSeal,
      data: eventData, // Store actor info in data JSON field
    },
  });

  return {
    id: sessionEvent.id,
    sessionId: sessionEvent.sessionId,
    eventType: sessionEvent.type as SessionEventType, // Map 'type' back to 'eventType' for interface
    eventData: sessionEvent.data as Record<string, any> | null,
    actorId: (sessionEvent.data as any)?.actorId || null,
    actorRole: (sessionEvent.data as any)?.actorRole || null,
    timestamp: sessionEvent.createdAt, // Schema uses 'createdAt' not 'timestamp'
  };
}

/**
 * Get event history for a session
 * Returns events in chronological order
 */
export async function getSessionEventHistory(
  sessionId: string,
  limit: number = 100
): Promise<SessionEventRecord[]> {
  const events = await prisma.sessionEvent.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' }, // Schema uses 'createdAt' not 'timestamp'
    take: limit,
  });

  return events.map(event => ({
    id: event.id,
    sessionId: event.sessionId,
    eventType: event.type as SessionEventType, // Map 'type' to 'eventType'
    eventData: event.data as Record<string, any> | null, // Map 'data' to 'eventData'
    actorId: (event.data as any)?.actorId || null, // Extract from data JSON
    actorRole: (event.data as any)?.actorRole || null, // Extract from data JSON
    timestamp: event.createdAt, // Map 'createdAt' to 'timestamp'
  }));
}

/**
 * Reconstruct session state from events
 * Useful for debugging and audit purposes
 */
export async function replaySessionEvents(
  sessionId: string
): Promise<{
  initialState: Record<string, any>;
  finalState: Record<string, any>;
  events: SessionEventRecord[];
  transitions: Array<{
    from: string;
    to: string;
    event: SessionEventRecord;
  }>;
}> {
  const events = await getSessionEventHistory(sessionId, 1000);

  // Get current session state
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  // Reconstruct state transitions
  const transitions: Array<{
    from: string;
    to: string;
    event: SessionEventRecord;
  }> = [];

  let currentState = session.state || 'PENDING';

  for (const event of events) {
    const previousState = currentState;
    
    // Map event types to state transitions
    switch (event.eventType) {
      case 'started':
        currentState = 'ACTIVE';
        break;
      case 'paused':
        currentState = 'PAUSED';
        break;
      case 'resumed':
        currentState = 'ACTIVE';
        break;
      case 'ended':
        currentState = 'CLOSED';
        break;
      case 'canceled':
        currentState = 'CANCELED';
        break;
    }

    if (previousState !== currentState) {
      transitions.push({
        from: previousState,
        to: currentState,
        event,
      });
    }
  }

  return {
    initialState: {
      state: 'PENDING',
      createdAt: session.createdAt,
    },
    finalState: {
      state: currentState,
      updatedAt: session.updatedAt,
    },
    events,
    transitions,
  };
}

/**
 * Get events by type within a time range
 * Useful for analytics and reporting
 */
export async function getEventsByType(
  eventType: SessionEventType,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
): Promise<SessionEventRecord[]> {
  const where: any = {
    type: eventType, // Schema uses 'type' not 'eventType'
  };

  if (startDate || endDate) {
    where.createdAt = {}; // Schema uses 'createdAt' not 'timestamp'
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const events = await prisma.sessionEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' }, // Schema uses 'createdAt' not 'timestamp'
    take: limit,
  });

  return events.map(event => ({
    id: event.id,
    sessionId: event.sessionId,
    eventType: event.type as SessionEventType, // Map 'type' to 'eventType'
    eventData: event.data as Record<string, any> | null, // Map 'data' to 'eventData'
    actorId: (event.data as any)?.actorId || null, // Extract from data JSON
    actorRole: (event.data as any)?.actorRole || null, // Extract from data JSON
    timestamp: event.createdAt, // Map 'createdAt' to 'timestamp'
  }));
}

