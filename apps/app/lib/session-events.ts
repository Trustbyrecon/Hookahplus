/**
 * Session Events Service
 * Manages append-only session lifecycle event ledger
 */

import { prisma } from './db';

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
  const sessionEvent = await prisma.sessionEvent.create({
    data: {
      sessionId: event.sessionId,
      eventType: event.eventType,
      eventData: event.eventData || {},
      actorId: event.actorId || null,
      actorRole: event.actorRole || null,
    },
  });

  return {
    id: sessionEvent.id,
    sessionId: sessionEvent.sessionId,
    eventType: sessionEvent.eventType as SessionEventType,
    eventData: sessionEvent.eventData as Record<string, any> | null,
    actorId: sessionEvent.actorId,
    actorRole: sessionEvent.actorRole,
    timestamp: sessionEvent.timestamp,
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
    orderBy: { timestamp: 'asc' },
    take: limit,
  });

  return events.map(event => ({
    id: event.id,
    sessionId: event.sessionId,
    eventType: event.eventType as SessionEventType,
    eventData: event.eventData as Record<string, any> | null,
    actorId: event.actorId,
    actorRole: event.actorRole,
    timestamp: event.timestamp,
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
    eventType,
  };

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) {
      where.timestamp.gte = startDate;
    }
    if (endDate) {
      where.timestamp.lte = endDate;
    }
  }

  const events = await prisma.sessionEvent.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return events.map(event => ({
    id: event.id,
    sessionId: event.sessionId,
    eventType: event.eventType as SessionEventType,
    eventData: event.eventData as Record<string, any> | null,
    actorId: event.actorId,
    actorRole: event.actorRole,
    timestamp: event.timestamp,
  }));
}

