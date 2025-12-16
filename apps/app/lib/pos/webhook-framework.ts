/**
 * POS Webhook Framework
 * Provides idempotency, retry logic, and DLQ for POS webhook processing
 */

import { prisma } from '../db';

export type IntegrationType = 'square' | 'toast' | 'clover';
export type EventStatus = 'pending' | 'processed' | 'failed' | 'dlq';

export interface WebhookEvent {
  integrationType: IntegrationType;
  externalEventId: string;
  eventType: string;
  payload: any;
}

export interface ProcessedEvent {
  id: string;
  integrationType: IntegrationType;
  externalEventId: string;
  eventType: string;
  status: EventStatus;
  retryCount: number;
  processedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second base delay

/**
 * Process webhook with idempotency check
 * Returns existing event if already processed, or creates new one
 */
export async function processWebhookWithIdempotency(
  event: WebhookEvent,
  processor: (event: WebhookEvent) => Promise<void>
): Promise<ProcessedEvent> {
  // Check for existing event (idempotency)
  const existing = await prisma.integrationEvent.findUnique({
    where: {
      integrationType_externalEventId: {
        integrationType: event.integrationType,
        externalEventId: event.externalEventId,
      },
    },
  });

  // If already processed successfully, return it
  if (existing && existing.status === 'processed') {
    return {
      id: existing.id,
      integrationType: existing.integrationType as IntegrationType,
      externalEventId: existing.externalEventId,
      eventType: existing.eventType,
      status: existing.status as EventStatus,
      retryCount: existing.retryCount,
      processedAt: existing.processedAt,
      errorMessage: existing.errorMessage,
      createdAt: existing.createdAt,
    };
  }

  // If exists but failed, retry
  if (existing && existing.status === 'failed' && existing.retryCount < MAX_RETRIES) {
    return await retryWebhookProcessing(existing.id, processor);
  }

  // Create new event record
  const integrationEvent = await prisma.integrationEvent.create({
    data: {
      integrationType: event.integrationType,
      externalEventId: event.externalEventId,
      eventType: event.eventType,
      payload: event.payload as any,
      status: 'pending',
      retryCount: 0,
    },
  });

  // Process the event
  try {
    await processor(event);

    // Mark as processed
    const updated = await prisma.integrationEvent.update({
      where: { id: integrationEvent.id },
      data: {
        status: 'processed',
        processedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      integrationType: updated.integrationType as IntegrationType,
      externalEventId: updated.externalEventId,
      eventType: updated.eventType,
      status: updated.status as EventStatus,
      retryCount: updated.retryCount,
      processedAt: updated.processedAt,
      errorMessage: updated.errorMessage,
      createdAt: updated.createdAt,
    };
  } catch (error) {
    // Mark as failed and retry if possible
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (integrationEvent.retryCount < MAX_RETRIES) {
      return await retryWebhookProcessing(integrationEvent.id, processor);
    } else {
      // Move to DLQ after max retries
      return await moveToDLQ(integrationEvent.id, errorMessage);
    }
  }
}

/**
 * Retry webhook processing with exponential backoff
 */
async function retryWebhookProcessing(
  eventId: string,
  processor: (event: WebhookEvent) => Promise<void>
): Promise<ProcessedEvent> {
  const event = await prisma.integrationEvent.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  const retryCount = event.retryCount + 1;
  const delay = RETRY_DELAY_MS * Math.pow(2, retryCount - 1);

  // Wait before retrying (exponential backoff)
  await new Promise(resolve => setTimeout(resolve, delay));

  // Update retry count
  await prisma.integrationEvent.update({
    where: { id: eventId },
    data: { retryCount },
  });

  // Reconstruct event
  const webhookEvent: WebhookEvent = {
    integrationType: event.integrationType as IntegrationType,
    externalEventId: event.externalEventId,
    eventType: event.eventType,
    payload: event.payload as any,
  };

  try {
    await processor(webhookEvent);

    // Mark as processed
    const updated = await prisma.integrationEvent.update({
      where: { id: eventId },
      data: {
        status: 'processed',
        processedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      integrationType: updated.integrationType as IntegrationType,
      externalEventId: updated.externalEventId,
      eventType: updated.eventType,
      status: updated.status as EventStatus,
      retryCount: updated.retryCount,
      processedAt: updated.processedAt,
      errorMessage: updated.errorMessage,
      createdAt: updated.createdAt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (retryCount < MAX_RETRIES) {
      // Update error message and retry again
      await prisma.integrationEvent.update({
        where: { id: eventId },
        data: { errorMessage },
      });
      return await retryWebhookProcessing(eventId, processor);
    } else {
      // Move to DLQ
      return await moveToDLQ(eventId, errorMessage);
    }
  }
}

/**
 * Move event to dead letter queue
 */
async function moveToDLQ(eventId: string, errorMessage: string): Promise<ProcessedEvent> {
  const updated = await prisma.integrationEvent.update({
    where: { id: eventId },
    data: {
      status: 'dlq',
      errorMessage,
    },
  });

  return {
    id: updated.id,
    integrationType: updated.integrationType as IntegrationType,
    externalEventId: updated.externalEventId,
    eventType: updated.eventType,
    status: updated.status as EventStatus,
    retryCount: updated.retryCount,
    processedAt: updated.processedAt,
    errorMessage: updated.errorMessage,
    createdAt: updated.createdAt,
  };
}

/**
 * Replay events from DLQ
 * Useful for manual recovery
 */
export async function replayDLQEvents(
  integrationType?: IntegrationType,
  limit: number = 100
): Promise<ProcessedEvent[]> {
  const where: any = { status: 'dlq' };
  if (integrationType) {
    where.integrationType = integrationType;
  }

  const events = await prisma.integrationEvent.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  return events.map(event => ({
    id: event.id,
    integrationType: event.integrationType as IntegrationType,
    externalEventId: event.externalEventId,
    eventType: event.eventType,
    status: event.status as EventStatus,
    retryCount: event.retryCount,
    processedAt: event.processedAt,
    errorMessage: event.errorMessage,
    createdAt: event.createdAt,
  }));
}

/**
 * Get DLQ statistics
 */
export async function getDLQStats(): Promise<{
  total: number;
  byIntegration: Record<IntegrationType, number>;
  oldestEvent: Date | null;
}> {
  const dlqEvents = await prisma.integrationEvent.findMany({
    where: { status: 'dlq' },
    orderBy: { createdAt: 'asc' },
  });

  const byIntegration: Record<IntegrationType, number> = {
    square: 0,
    toast: 0,
    clover: 0,
  };

  for (const event of dlqEvents) {
    const type = event.integrationType as IntegrationType;
    if (byIntegration[type] !== undefined) {
      byIntegration[type]++;
    }
  }

  return {
    total: dlqEvents.length,
    byIntegration,
    oldestEvent: dlqEvents.length > 0 ? dlqEvents[0].createdAt : null,
  };
}

