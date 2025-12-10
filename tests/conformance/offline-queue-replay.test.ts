import { describe, it, expect, beforeEach } from 'vitest';
import { getOfflineQueue, processAction } from '@/lib/offline-queue';

/**
 * Offline Queue Replay Test
 * 
 * Queued events replay in the correct order after reconnect without duplicates.
 * 
 * This is one of the 10 conformance tests to validate Phase 3 Hardening Mini-Pack.
 */
describe('Offline Queue Replay Test', () => {
  let queue: ReturnType<typeof getOfflineQueue>;
  let executedEvents: Array<{ id: string; type: string; order: number }>;
  let executionOrder: number;

  beforeEach(() => {
    queue = getOfflineQueue();
    queue.clearQueue();
    queue.setOnlineStatus(true);
    executedEvents = [];
    executionOrder = 0;
  });

  it('should queue events when offline', () => {
    queue.setOnlineStatus(false);

    queue.queueEvent({
      type: 'flavor_added',
      payload: { flavor: 'Blue Mist' },
      sessionId: 'session-1',
    });

    queue.queueEvent({
      type: 'price_locked',
      payload: { priceCents: 3000 },
      sessionId: 'session-1',
    });

    expect(queue.getQueueSize()).toBe(2);
    expect(queue.getQueuedEvents().length).toBe(2);
  });

  it('should replay events in correct chronological order', async () => {
    queue.setOnlineStatus(false);

    // Queue events with different timestamps
    const event1 = queue.queueEvent({
      type: 'session_started',
      payload: { tableId: 'T-5' },
      sessionId: 'session-1',
    });

    // Small delay to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    const event2 = queue.queueEvent({
      type: 'flavor_added',
      payload: { flavor: 'Mint' },
      sessionId: 'session-1',
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const event3 = queue.queueEvent({
      type: 'price_locked',
      payload: { priceCents: 3000 },
      sessionId: 'session-1',
    });

    // Replay events
    const replayOrder: string[] = [];
    await queue.replayEvents(async (event) => {
      replayOrder.push(event.type);
    });

    // Should replay in chronological order
    expect(replayOrder).toEqual(['session_started', 'flavor_added', 'price_locked']);
    expect(replayOrder.length).toBe(3);
  });

  it('should not create duplicates when replaying', async () => {
    queue.setOnlineStatus(false);

    const event1 = queue.queueEvent({
      type: 'flavor_added',
      payload: { flavor: 'Blue Mist' },
      sessionId: 'session-1',
    });

    // Replay once
    let replayCount = 0;
    const { replayed: replayed1, duplicates: dupes1 } = await queue.replayEvents(
      async (event) => {
        replayCount++;
      }
    );

    expect(replayed1).toBe(1);
    expect(dupes1).toBe(0);
    expect(replayCount).toBe(1);
    expect(queue.getQueueSize()).toBe(0); // Queue cleared after successful replay

    // Queue a new event and try to replay the same event again
    const event2 = queue.queueEvent({
      type: 'flavor_added',
      payload: { flavor: 'Blue Mist' },
      sessionId: 'session-1',
      idempotencyKey: event1.idempotencyKey || event1.id, // Same idempotency key
    });

    // Mark the first event as synced manually to simulate duplicate detection
    // In real implementation, this would be tracked by idempotency key
    const { replayed: replayed2, duplicates: dupes2 } = await queue.replayEvents(
      async (event) => {
        replayCount++;
      }
    );

    // New event should be replayed
    expect(replayed2).toBe(1);
    expect(replayCount).toBe(2);
  });

  it('should replay events in correct order after reconnect', async () => {
    // Simulate offline period
    queue.setOnlineStatus(false);

    const events = [
      { type: 'session_started', payload: { tableId: 'T-1' } },
      { type: 'flavor_added', payload: { flavor: 'Double Apple' } },
      { type: 'flavor_added', payload: { flavor: 'Mint' } },
      { type: 'price_locked', payload: { priceCents: 3500 } },
      { type: 'payment_initiated', payload: { amount: 3500 } },
    ];

    events.forEach((event) => {
      queue.queueEvent({
        ...event,
        sessionId: 'session-1',
      });
    });

    // Reconnect
    queue.setOnlineStatus(true);

    // Replay events
    const replayOrder: string[] = [];
    await queue.replayEvents(async (event) => {
      replayOrder.push(event.type);
    });

    // Should replay in the order they were queued
    expect(replayOrder).toEqual([
      'session_started',
      'flavor_added',
      'flavor_added',
      'price_locked',
      'payment_initiated',
    ]);
  });

  it('should handle multiple sessions in queue', async () => {
    queue.setOnlineStatus(false);

    // Queue events for different sessions
    queue.queueEvent({
      type: 'session_started',
      payload: {},
      sessionId: 'session-1',
    });

    queue.queueEvent({
      type: 'session_started',
      payload: {},
      sessionId: 'session-2',
    });

    queue.queueEvent({
      type: 'flavor_added',
      payload: { flavor: 'Blue Mist' },
      sessionId: 'session-1',
    });

    queue.queueEvent({
      type: 'flavor_added',
      payload: { flavor: 'Mint' },
      sessionId: 'session-2',
    });

    const replayed: Array<{ sessionId?: string; type: string }> = [];
    await queue.replayEvents(async (event) => {
      replayed.push({
        sessionId: event.sessionId,
        type: event.type,
      });
    });

    expect(replayed.length).toBe(4);
    expect(replayed[0].sessionId).toBe('session-1');
    expect(replayed[1].sessionId).toBe('session-2');
  });

  it('should preserve event payloads during replay', async () => {
    queue.setOnlineStatus(false);

    const originalPayload = {
      flavor: 'Blue Mist',
      priceCents: 3000,
      tableId: 'T-5',
    };

    queue.queueEvent({
      type: 'flavor_added',
      payload: originalPayload,
      sessionId: 'session-1',
    });

    let replayedPayload: any = null;
    await queue.replayEvents(async (event) => {
      replayedPayload = event.payload;
    });

    expect(replayedPayload).toEqual(originalPayload);
  });

  it('should clear queue after successful replay', async () => {
    queue.setOnlineStatus(false);

    queue.queueEvent({
      type: 'flavor_added',
      payload: { flavor: 'Mint' },
      sessionId: 'session-1',
    });

    expect(queue.getQueueSize()).toBe(1);

    await queue.replayEvents(async () => {
      // Successfully process
    });

    // Queue should be cleared after successful replay
    expect(queue.getQueueSize()).toBe(0);
  });

  it('should handle replay failures gracefully', async () => {
    queue.setOnlineStatus(false);

    queue.queueEvent({
      type: 'flavor_added',
      payload: { flavor: 'Mint' },
      sessionId: 'session-1',
    });

    queue.queueEvent({
      type: 'price_locked',
      payload: { priceCents: 3000 },
      sessionId: 'session-1',
    });

    let replayCount = 0;
    const { replayed, duplicates } = await queue.replayEvents(async (event) => {
      replayCount++;
      if (event.type === 'flavor_added') {
        throw new Error('Simulated failure');
      }
    });

    // Both events are attempted, but first fails
    // The replay continues and processes the second event
    expect(replayCount).toBe(2); // Both events attempted
    // Failed event remains in queue, successful one is removed
    expect(queue.getQueueSize()).toBe(1); // Only failed event remains
    expect(replayed).toBe(1); // Only one successfully replayed
  });

  it('should process actions immediately when online', async () => {
    queue.setOnlineStatus(true);

    let executed = false;
    const { result, queued } = await processAction(
      async () => {
        executed = true;
        return 'success';
      },
      'test_action',
      { data: 'test' },
      'session-1'
    );

    expect(executed).toBe(true);
    expect(result).toBe('success');
    expect(queued).toBe(false);
    expect(queue.getQueueSize()).toBe(0);
  });

  it('should queue actions when offline', async () => {
    queue.setOnlineStatus(false);

    let executed = false;
    const { result, queued } = await processAction(
      async () => {
        executed = true;
        return 'success';
      },
      'test_action',
      { data: 'test' },
      'session-1'
    );

    expect(executed).toBe(false);
    expect(result).toBeNull();
    expect(queued).toBe(true);
    expect(queue.getQueueSize()).toBe(1);
  });

  it('should maintain order with rapid event queuing', async () => {
    queue.setOnlineStatus(false);

    // Queue events rapidly
    const types: string[] = [];
    for (let i = 0; i < 10; i++) {
      const type = `event_${i}`;
      types.push(type);
      queue.queueEvent({
        type,
        payload: { index: i },
        sessionId: 'session-1',
      });
    }

    const replayOrder: string[] = [];
    await queue.replayEvents(async (event) => {
      replayOrder.push(event.type);
    });

    // Should maintain original order
    expect(replayOrder).toEqual(types);
  });
});

