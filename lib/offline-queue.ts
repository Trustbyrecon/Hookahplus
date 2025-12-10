/**
 * Offline Queue Utilities
 * 
 * Local queue for staff actions when network drops, with auto-sync when back.
 */

export type QueuedEvent = {
  id: string;
  type: string;
  payload: Record<string, any>;
  timestamp: number;
  sessionId?: string;
  idempotencyKey?: string;
};

class OfflineQueue {
  private queue: QueuedEvent[] = [];
  private isOnline: boolean = true;
  private syncedIds: Set<string> = new Set();

  /**
   * Check if currently online
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Set online/offline status
   */
  setOnlineStatus(online: boolean): void {
    this.isOnline = online;
  }

  /**
   * Queue an event when offline
   */
  queueEvent(event: Omit<QueuedEvent, 'id' | 'timestamp'>): QueuedEvent {
    const queuedEvent: QueuedEvent = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      ...event,
    };

    this.queue.push(queuedEvent);
    return queuedEvent;
  }

  /**
   * Get all queued events in order
   */
  getQueuedEvents(): QueuedEvent[] {
    return [...this.queue].sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Replay queued events in order
   */
  async replayEvents(
    handler: (event: QueuedEvent) => Promise<void>
  ): Promise<{ replayed: number; duplicates: number }> {
    const events = this.getQueuedEvents();
    let replayed = 0;
    let duplicates = 0;

    for (const event of events) {
      // Check if already synced (prevent duplicates)
      if (this.syncedIds.has(event.id)) {
        duplicates++;
        continue;
      }

      try {
        await handler(event);
        this.syncedIds.add(event.id);
        replayed++;
      } catch (error) {
        // If handler fails, keep event in queue for retry
        console.error('Failed to replay event:', event.id, error);
      }
    }

    // Remove synced events from queue
    this.queue = this.queue.filter((e) => !this.syncedIds.has(e.id));

    return { replayed, duplicates };
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.queue = [];
    this.syncedIds.clear();
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

// Singleton instance
let queueInstance: OfflineQueue | null = null;

export function getOfflineQueue(): OfflineQueue {
  if (!queueInstance) {
    queueInstance = new OfflineQueue();
  }
  return queueInstance;
}

/**
 * Process an action (queue if offline, execute if online)
 */
export async function processAction<T>(
  action: () => Promise<T>,
  eventType: string,
  payload: Record<string, any>,
  sessionId?: string,
  idempotencyKey?: string
): Promise<{ result: T | null; queued: boolean }> {
  const queue = getOfflineQueue();

  if (queue.isConnected()) {
    // Online: execute immediately
    const result = await action();
    return { result, queued: false };
  } else {
    // Offline: queue for later
    queue.queueEvent({
      type: eventType,
      payload,
      sessionId,
      idempotencyKey,
    });
    return { result: null, queued: true };
  }
}

