/**
 * Event Store Integration
 * Phase 3: Night After Night Engine - Event System
 * 
 * Integrates with SessionEvent table for event replay and audit
 */

import { PrismaClient } from '@prisma/client';
import { EventMessage, SessionEventType } from './types';

const prisma = new PrismaClient();

/**
 * Event Store
 * Provides methods to query and replay events
 */
export class EventStore {
  /**
   * Get events for a session
   */
  async getSessionEvents(sessionId: string): Promise<EventMessage[]> {
    const events = await prisma.reflexEvent.findMany({
      where: {
        sessionId,
        source: 'night_after_night_engine'
      },
      orderBy: { createdAt: 'asc' }
    });

    return events.map(e => {
      const payload = e.payload ? JSON.parse(e.payload) : {};
      const metadata = e.metadata ? JSON.parse(e.metadata) : {};
      
      return {
        id: metadata.eventId || e.id,
        type: e.type as SessionEventType,
        sessionId: e.sessionId || undefined,
        orderId: payload.orderId,
        preorderId: payload.preorderId,
        deliveryId: payload.deliveryId,
        loungeId: payload.loungeId || 'unknown',
        payload: {
          ...payload,
          orderId: undefined,
          preorderId: undefined,
          deliveryId: undefined,
          loungeId: undefined,
          idempotencyKey: undefined,
          retryCount: undefined
        },
        timestamp: e.createdAt,
        idempotencyKey: payload.idempotencyKey,
        processedAt: metadata.processedAt ? new Date(metadata.processedAt) : undefined
      };
    });
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    eventType: SessionEventType,
    limit: number = 100
  ): Promise<EventMessage[]> {
    const events = await prisma.reflexEvent.findMany({
      where: {
        type: eventType,
        source: 'night_after_night_engine'
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return events.map(e => {
      const payload = e.payload ? JSON.parse(e.payload) : {};
      const metadata = e.metadata ? JSON.parse(e.metadata) : {};
      
      return {
        id: metadata.eventId || e.id,
        type: e.type as SessionEventType,
        sessionId: e.sessionId || undefined,
        orderId: payload.orderId,
        preorderId: payload.preorderId,
        deliveryId: payload.deliveryId,
        loungeId: payload.loungeId || 'unknown',
        payload: {
          ...payload,
          orderId: undefined,
          preorderId: undefined,
          deliveryId: undefined,
          loungeId: undefined,
          idempotencyKey: undefined,
          retryCount: undefined
        },
        timestamp: e.createdAt,
        idempotencyKey: payload.idempotencyKey,
        processedAt: metadata.processedAt ? new Date(metadata.processedAt) : undefined
      };
    });
  }

  /**
   * Get events for a lounge within a time range
   */
  async getLoungeEvents(
    loungeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EventMessage[]> {
    const events = await prisma.reflexEvent.findMany({
      where: {
        source: 'night_after_night_engine',
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        payload: {
          contains: loungeId
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return events
      .filter(e => {
        try {
          const payload = e.payload ? JSON.parse(e.payload) : {};
          return payload.loungeId === loungeId;
        } catch {
          return false;
        }
      })
      .map(e => {
        const payload = e.payload ? JSON.parse(e.payload) : {};
        const metadata = e.metadata ? JSON.parse(e.metadata) : {};
        
        return {
          id: metadata.eventId || e.id,
          type: e.type as SessionEventType,
          sessionId: e.sessionId || undefined,
          orderId: payload.orderId,
          preorderId: payload.preorderId,
          deliveryId: payload.deliveryId,
          loungeId,
          payload: {
            ...payload,
            orderId: undefined,
            preorderId: undefined,
            deliveryId: undefined,
            loungeId: undefined,
            idempotencyKey: undefined,
            retryCount: undefined
          },
          timestamp: e.createdAt,
          idempotencyKey: payload.idempotencyKey,
          processedAt: metadata.processedAt ? new Date(metadata.processedAt) : undefined
        };
      });
  }

  /**
   * Replay events for a session
   * Useful for debugging or reconstructing session state
   */
  async replaySession(sessionId: string): Promise<EventMessage[]> {
    return this.getSessionEvents(sessionId);
  }

  /**
   * Get unprocessed events (for catch-up processing)
   */
  async getUnprocessedEvents(limit: number = 100): Promise<EventMessage[]> {
    const allEvents = await prisma.reflexEvent.findMany({
      where: {
        source: 'night_after_night_engine'
      },
      orderBy: { createdAt: 'asc' },
      take: limit * 2 // Get more to filter
    });

    const unprocessed = allEvents.filter(e => {
      if (!e.metadata) return true;
      try {
        const meta = JSON.parse(e.metadata);
        return !meta.processedAt;
      } catch {
        return true;
      }
    }).slice(0, limit);

    return unprocessed.map(e => {
      const payload = e.payload ? JSON.parse(e.payload) : {};
      const metadata = e.metadata ? JSON.parse(e.metadata) : {};
      
      return {
        id: metadata.eventId || e.id,
        type: e.type as SessionEventType,
        sessionId: e.sessionId || undefined,
        orderId: payload.orderId,
        preorderId: payload.preorderId,
        deliveryId: payload.deliveryId,
        loungeId: payload.loungeId || 'unknown',
        payload: {
          ...payload,
          orderId: undefined,
          preorderId: undefined,
          deliveryId: undefined,
          loungeId: undefined,
          idempotencyKey: undefined,
          retryCount: undefined
        },
        timestamp: e.createdAt,
        idempotencyKey: payload.idempotencyKey
      };
    });
  }

  /**
   * Mark event as processed
   */
  async markProcessed(eventId: string): Promise<void> {
    const event = await prisma.reflexEvent.findFirst({
      where: {
        OR: [
          { id: eventId },
          { metadata: { contains: eventId } }
        ]
      }
    });

    if (!event) return;

    const metadata = event.metadata ? JSON.parse(event.metadata) : {};
    await prisma.reflexEvent.update({
      where: { id: event.id },
      data: {
        metadata: JSON.stringify({
          ...metadata,
          processedAt: new Date().toISOString()
        })
      }
    });
  }
}

// Singleton instance
export const eventStore = new EventStore();

