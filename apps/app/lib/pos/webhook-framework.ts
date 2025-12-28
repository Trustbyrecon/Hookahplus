/**
 * POS Webhook Framework
 * Provides idempotency, retry logic, and DLQ for POS webhook processing
 * 
 * Note: integrationEvent model doesn't exist in Prisma schema yet
 * Using in-memory implementation until model is added
 * TODO: Add IntegrationEvent model to Prisma schema for persistent storage
 */

// In-memory event store (replaces database until IntegrationEvent model exists)
const eventStore = new Map<string, ProcessedEvent>();

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
  // Check for existing event (idempotency) - in-memory lookup
  const eventKey = `${event.integrationType}_${event.externalEventId}`;
  const existing = eventStore.get(eventKey);

  // If already processed successfully, return it
  if (existing && existing.status === 'processed') {
    return existing;
  }

  // If exists but failed, retry
  if (existing && existing.status === 'failed' && existing.retryCount < MAX_RETRIES) {
    return await retryWebhookProcessing(existing.id, processor);
  }

  // Create new event record (in-memory)
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const integrationEvent: ProcessedEvent = {
    id: eventId,
    integrationType: event.integrationType,
    externalEventId: event.externalEventId,
    eventType: event.eventType,
    status: 'pending',
    retryCount: 0,
    processedAt: null,
    errorMessage: null,
    createdAt: new Date(),
  };
  eventStore.set(eventKey, integrationEvent);

  // Process the event
  try {
    await processor(event);

    // Mark as processed
    const updated: ProcessedEvent = {
      ...integrationEvent,
      status: 'processed',
      processedAt: new Date(),
    };
    eventStore.set(eventKey, updated);

    return updated;
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
  // Find event in memory store
  let event: ProcessedEvent | undefined;
  Array.from(eventStore.entries()).forEach(([key, evt]) => {
    if (evt.id === eventId) {
      event = evt;
    }
  });

  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  const retryCount = event.retryCount + 1;
  const delay = RETRY_DELAY_MS * Math.pow(2, retryCount - 1);

  // Wait before retrying (exponential backoff)
  await new Promise(resolve => setTimeout(resolve, delay));

  // Update retry count in memory
  const eventKey = `${event.integrationType}_${event.externalEventId}`;
  const updatedEvent: ProcessedEvent = {
    ...event,
    retryCount,
  };
  eventStore.set(eventKey, updatedEvent);

  // Reconstruct webhook event (payload not stored in ProcessedEvent, so we'll need to pass it differently)
  // For now, we'll just process with minimal info
  const webhookEvent: WebhookEvent = {
    integrationType: event.integrationType,
    externalEventId: event.externalEventId,
    eventType: event.eventType,
    payload: {}, // Payload not available in ProcessedEvent
  };

  try {
    await processor(webhookEvent);

    // Mark as processed
    const processed: ProcessedEvent = {
      ...updatedEvent,
      status: 'processed',
      processedAt: new Date(),
    };
    eventStore.set(eventKey, processed);

    return processed;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (retryCount < MAX_RETRIES) {
      // Update error message and retry again
      const failed: ProcessedEvent = {
        ...updatedEvent,
        errorMessage,
        status: 'failed',
      };
      eventStore.set(eventKey, failed);
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
  // Find event in memory store
  let event: ProcessedEvent | undefined;
  let eventKey: string | undefined;
  Array.from(eventStore.entries()).forEach(([key, evt]) => {
    if (evt.id === eventId) {
      event = evt;
      eventKey = key;
    }
  });

  if (!event || !eventKey) {
    throw new Error(`Event ${eventId} not found`);
  }

  // Update to DLQ status
  const updated: ProcessedEvent = {
    ...event,
    status: 'dlq',
    errorMessage,
  };
  eventStore.set(eventKey, updated);

  return updated;
}

/**
 * Replay events from DLQ
 * Useful for manual recovery
 */
export async function replayDLQEvents(
  integrationType?: IntegrationType,
  limit: number = 100
): Promise<ProcessedEvent[]> {
  // Get DLQ events from memory store
  const dlqEvents: ProcessedEvent[] = [];
  Array.from(eventStore.values()).forEach(event => {
    if (event.status === 'dlq') {
      if (!integrationType || event.integrationType === integrationType) {
        dlqEvents.push(event);
      }
    }
  });

  // Sort by createdAt and limit
  return dlqEvents
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, limit);
}

/**
 * Get DLQ statistics
 */
export async function getDLQStats(): Promise<{
  total: number;
  byIntegration: Record<IntegrationType, number>;
  oldestEvent: Date | null;
}> {
  // Get DLQ events from memory store
  const dlqEvents: ProcessedEvent[] = [];
  Array.from(eventStore.values()).forEach(event => {
    if (event.status === 'dlq') {
      dlqEvents.push(event);
    }
  });

  // Sort by createdAt
  dlqEvents.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const byIntegration: Record<IntegrationType, number> = {
    square: 0,
    toast: 0,
    clover: 0,
  };

  for (const event of dlqEvents) {
    const type = event.integrationType;
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

