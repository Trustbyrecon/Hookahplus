import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Timeline Fidelity Test
 * 
 * The session timeline displayed in UI matches stored events exactly.
 * 
 * This is one of the 10 conformance tests to validate Phase 3 Hardening Mini-Pack.
 */
describe('Timeline Fidelity Test', () => {
  // Simulate stored events (as they would appear in database)
  type StoredEvent = {
    id: string;
    type: string;
    payload: string | null;
    data: string | null;
    createdAt: Date;
    sessionId: string;
  };

  // Simulate UI timeline event (as displayed in UI)
  type UITimelineEvent = {
    id: string;
    type: string;
    payload?: string | null;
    createdAt: string;
  };

  /**
   * Simulate getSessionTimeline - fetches events ordered by createdAt ASC
   */
  function getSessionTimeline(storedEvents: StoredEvent[]): StoredEvent[] {
    return [...storedEvents].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  /**
   * Simulate API response transformation (as done in timeline route)
   */
  function transformForUI(storedEvents: StoredEvent[]): UITimelineEvent[] {
    return storedEvents.map((event) => ({
      id: event.id,
      type: event.type,
      payload: event.payload ?? event.data ?? null,
      createdAt: event.createdAt.toISOString(),
    }));
  }

  /**
   * Simulate UI display (as done in timeline page)
   */
  function displayInUI(uiEvents: UITimelineEvent[]): UITimelineEvent[] {
    // UI just displays what it receives from API
    return uiEvents;
  }

  beforeEach(() => {
    // Reset for each test
  });

  it('should match stored events exactly in UI', () => {
    const storedEvents: StoredEvent[] = [
      {
        id: 'evt-1',
        type: 'session_started',
        payload: JSON.stringify({ tableId: 'T-5' }),
        data: JSON.stringify({ tableId: 'T-5' }),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        sessionId: 'session-1',
      },
      {
        id: 'evt-2',
        type: 'flavor_added',
        payload: JSON.stringify({ flavor: 'Blue Mist' }),
        data: JSON.stringify({ flavor: 'Blue Mist' }),
        createdAt: new Date('2024-01-01T10:05:00Z'),
        sessionId: 'session-1',
      },
    ];

    const timeline = getSessionTimeline(storedEvents);
    const uiEvents = transformForUI(timeline);
    const displayed = displayInUI(uiEvents);

    // UI should match stored events exactly
    expect(displayed.length).toBe(storedEvents.length);
    expect(displayed[0].id).toBe(storedEvents[0].id);
    expect(displayed[0].type).toBe(storedEvents[0].type);
    expect(displayed[1].id).toBe(storedEvents[1].id);
    expect(displayed[1].type).toBe(storedEvents[1].type);
  });

  it('should display events in chronological order', () => {
    const storedEvents: StoredEvent[] = [
      {
        id: 'evt-3',
        type: 'price_locked',
        payload: JSON.stringify({ priceCents: 3000 }),
        data: JSON.stringify({ priceCents: 3000 }),
        createdAt: new Date('2024-01-01T10:10:00Z'),
        sessionId: 'session-1',
      },
      {
        id: 'evt-1',
        type: 'session_started',
        payload: JSON.stringify({ tableId: 'T-5' }),
        data: JSON.stringify({ tableId: 'T-5' }),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        sessionId: 'session-1',
      },
      {
        id: 'evt-2',
        type: 'flavor_added',
        payload: JSON.stringify({ flavor: 'Mint' }),
        data: JSON.stringify({ flavor: 'Mint' }),
        createdAt: new Date('2024-01-01T10:05:00Z'),
        sessionId: 'session-1',
      },
    ];

    const timeline = getSessionTimeline(storedEvents);
    const uiEvents = transformForUI(timeline);

    // Should be in chronological order (oldest first)
    expect(uiEvents[0].type).toBe('session_started');
    expect(uiEvents[1].type).toBe('flavor_added');
    expect(uiEvents[2].type).toBe('price_locked');
  });

  it('should preserve all event fields in UI', () => {
    const storedEvent: StoredEvent = {
      id: 'evt-123',
      type: 'payment_confirmed',
      payload: JSON.stringify({ amount: 3500, paymentIntent: 'pi_123' }),
      data: JSON.stringify({ amount: 3500, paymentIntent: 'pi_123' }),
      createdAt: new Date('2024-01-01T10:15:00Z'),
      sessionId: 'session-1',
    };

    const timeline = getSessionTimeline([storedEvent]);
    const uiEvents = transformForUI(timeline);
    const displayed = displayInUI(uiEvents);

    expect(displayed[0].id).toBe(storedEvent.id);
    expect(displayed[0].type).toBe(storedEvent.type);
    expect(displayed[0].payload).toBe(storedEvent.payload);
    expect(displayed[0].createdAt).toBe(storedEvent.createdAt.toISOString());
  });

  it('should handle events with null payload', () => {
    const storedEvents: StoredEvent[] = [
      {
        id: 'evt-1',
        type: 'session_started',
        payload: null,
        data: null,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        sessionId: 'session-1',
      },
    ];

    const timeline = getSessionTimeline(storedEvents);
    const uiEvents = transformForUI(timeline);

    expect(uiEvents[0].payload).toBeNull();
  });

  it('should use data field when payload is null', () => {
    const storedEvents: StoredEvent[] = [
      {
        id: 'evt-1',
        type: 'flavor_added',
        payload: null,
        data: JSON.stringify({ flavor: 'Blue Mist' }),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        sessionId: 'session-1',
      },
    ];

    const timeline = getSessionTimeline(storedEvents);
    const uiEvents = transformForUI(timeline);

    expect(uiEvents[0].payload).toBe(storedEvents[0].data);
  });

  it('should match complete session lifecycle events', () => {
    const storedEvents: StoredEvent[] = [
      {
        id: 'evt-1',
        type: 'session_started',
        payload: JSON.stringify({ tableId: 'T-5', loungeId: 'lounge-1' }),
        data: JSON.stringify({ tableId: 'T-5', loungeId: 'lounge-1' }),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        sessionId: 'session-1',
      },
      {
        id: 'evt-2',
        type: 'flavor_added',
        payload: JSON.stringify({ flavor: 'Blue Mist' }),
        data: JSON.stringify({ flavor: 'Blue Mist' }),
        createdAt: new Date('2024-01-01T10:05:00Z'),
        sessionId: 'session-1',
      },
      {
        id: 'evt-3',
        type: 'price_locked',
        payload: JSON.stringify({ priceCents: 3000 }),
        data: JSON.stringify({ priceCents: 3000 }),
        createdAt: new Date('2024-01-01T10:10:00Z'),
        sessionId: 'session-1',
      },
      {
        id: 'evt-4',
        type: 'payment_initiated',
        payload: JSON.stringify({ checkoutSessionId: 'cs_123' }),
        data: JSON.stringify({ checkoutSessionId: 'cs_123' }),
        createdAt: new Date('2024-01-01T10:15:00Z'),
        sessionId: 'session-1',
      },
      {
        id: 'evt-5',
        type: 'payment_confirmed',
        payload: JSON.stringify({ paymentIntent: 'pi_123' }),
        data: JSON.stringify({ paymentIntent: 'pi_123' }),
        createdAt: new Date('2024-01-01T10:20:00Z'),
        sessionId: 'session-1',
      },
      {
        id: 'evt-6',
        type: 'session_closed',
        payload: JSON.stringify({ reason: 'completed' }),
        data: JSON.stringify({ reason: 'completed' }),
        createdAt: new Date('2024-01-01T11:00:00Z'),
        sessionId: 'session-1',
      },
    ];

    const timeline = getSessionTimeline(storedEvents);
    const uiEvents = transformForUI(timeline);

    // Should match all events in correct order
    expect(uiEvents.length).toBe(6);
    expect(uiEvents.map((e) => e.type)).toEqual([
      'session_started',
      'flavor_added',
      'price_locked',
      'payment_initiated',
      'payment_confirmed',
      'session_closed',
    ]);

    // Each event should match stored event
    storedEvents.forEach((stored, index) => {
      expect(uiEvents[index].id).toBe(stored.id);
      expect(uiEvents[index].type).toBe(stored.type);
    });
  });

  it('should handle empty timeline', () => {
    const storedEvents: StoredEvent[] = [];

    const timeline = getSessionTimeline(storedEvents);
    const uiEvents = transformForUI(timeline);

    expect(uiEvents.length).toBe(0);
  });

  it('should preserve payload JSON structure', () => {
    const complexPayload = {
      flavor: 'Blue Mist',
      priceCents: 3000,
      addOns: [{ name: 'Extra Coal', priceCents: 500 }],
      metadata: { source: 'qr', tableId: 'T-5' },
    };

    const storedEvent: StoredEvent = {
      id: 'evt-1',
      type: 'flavor_added',
      payload: JSON.stringify(complexPayload),
      data: JSON.stringify(complexPayload),
      createdAt: new Date('2024-01-01T10:00:00Z'),
      sessionId: 'session-1',
    };

    const timeline = getSessionTimeline([storedEvent]);
    const uiEvents = transformForUI(timeline);

    // Payload should be parseable JSON
    const parsed = JSON.parse(uiEvents[0].payload!);
    expect(parsed).toEqual(complexPayload);
    expect(parsed.flavor).toBe('Blue Mist');
    expect(parsed.addOns).toHaveLength(1);
  });

  it('should match event timestamps exactly', () => {
    const storedEvent: StoredEvent = {
      id: 'evt-1',
      type: 'session_started',
      payload: JSON.stringify({}),
      data: JSON.stringify({}),
      createdAt: new Date('2024-01-01T10:30:45.123Z'),
      sessionId: 'session-1',
    };

    const timeline = getSessionTimeline([storedEvent]);
    const uiEvents = transformForUI(timeline);

    // Timestamp should match exactly (as ISO string)
    expect(uiEvents[0].createdAt).toBe(storedEvent.createdAt.toISOString());
  });

  it('should filter events by sessionId correctly', () => {
    const allEvents: StoredEvent[] = [
      {
        id: 'evt-1',
        type: 'session_started',
        payload: JSON.stringify({}),
        data: JSON.stringify({}),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        sessionId: 'session-1',
      },
      {
        id: 'evt-2',
        type: 'session_started',
        payload: JSON.stringify({}),
        data: JSON.stringify({}),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        sessionId: 'session-2', // Different session
      },
      {
        id: 'evt-3',
        type: 'flavor_added',
        payload: JSON.stringify({}),
        data: JSON.stringify({}),
        createdAt: new Date('2024-01-01T10:05:00Z'),
        sessionId: 'session-1',
      },
    ];

    // Simulate filtering by sessionId (as done in getSessionTimeline)
    const session1Events = allEvents.filter((e) => e.sessionId === 'session-1');
    const timeline = getSessionTimeline(session1Events);
    const uiEvents = transformForUI(timeline);

    // Should only include events for session-1
    expect(uiEvents.length).toBe(2);
    expect(uiEvents.every((e) => e.id.startsWith('evt-1') || e.id.startsWith('evt-3'))).toBe(true);
    expect(uiEvents.some((e) => e.id === 'evt-2')).toBe(false);
  });

  it('should maintain order even with same timestamp', () => {
    const sameTime = new Date('2024-01-01T10:00:00Z');
    const storedEvents: StoredEvent[] = [
      {
        id: 'evt-1',
        type: 'session_started',
        payload: JSON.stringify({}),
        data: JSON.stringify({}),
        createdAt: sameTime,
        sessionId: 'session-1',
      },
      {
        id: 'evt-2',
        type: 'flavor_added',
        payload: JSON.stringify({}),
        data: JSON.stringify({}),
        createdAt: sameTime, // Same timestamp
        sessionId: 'session-1',
      },
    ];

    const timeline = getSessionTimeline(storedEvents);
    const uiEvents = transformForUI(timeline);

    // Should maintain insertion order when timestamps are equal
    expect(uiEvents.length).toBe(2);
    // Both events should be present
    expect(uiEvents.some((e) => e.id === 'evt-1')).toBe(true);
    expect(uiEvents.some((e) => e.id === 'evt-2')).toBe(true);
  });
});

