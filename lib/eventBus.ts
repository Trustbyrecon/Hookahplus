export interface SessionEvent {
  session: any;
  cmd: string;
  data: any;
  actor?: string;
  timestamp?: number;
}

export interface FloorEvent {
  session: any;
  cmd: string;
  data: any;
  actor?: string;
  timestamp?: number;
}

export interface PrepEvent {
  session: any;
  cmd: string;
  data: any;
  actor?: string;
  timestamp?: number;
}

// Mock event bus implementation
const eventSubscribers: Map<string, Set<(event: any) => void>> = new Map();

export const publishSessionEvent = (sessionId: string, event: SessionEvent): void => {
  console.log(`[EventBus] Session ${sessionId}:`, event);
  
  const subscribers = eventSubscribers.get(`session:${sessionId}`) || new Set();
  subscribers.forEach(callback => {
    try {
      callback(event);
    } catch (error) {
      console.error('Error in session event subscriber:', error);
    }
  });
};

export const publishFloorEvent = (event: FloorEvent): void => {
  console.log('[EventBus] Floor Event:', event);
  
  const subscribers = eventSubscribers.get('floor') || new Set();
  subscribers.forEach(callback => {
    try {
      callback(event);
    } catch (error) {
      console.error('Error in floor event subscriber:', error);
    }
  });
};

export const publishPrepEvent = (event: PrepEvent): void => {
  console.log('[EventBus] Prep Event:', event);
  
  const subscribers = eventSubscribers.get('prep') || new Set();
  subscribers.forEach(callback => {
    try {
      callback(event);
    } catch (error) {
      console.error('Error in prep event subscriber:', error);
    }
  });
};

export const subscribeToSession = (sessionId: string, callback: (event: SessionEvent) => void): () => void => {
  const key = `session:${sessionId}`;
  if (!eventSubscribers.has(key)) {
    eventSubscribers.set(key, new Set());
  }
  
  const subscribers = eventSubscribers.get(key)!;
  subscribers.add(callback);
  
  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      eventSubscribers.delete(key);
    }
  };
};

export const subscribeToFloor = (callback: (event: FloorEvent) => void): () => void => {
  if (!eventSubscribers.has('floor')) {
    eventSubscribers.set('floor', new Set());
  }
  
  const subscribers = eventSubscribers.get('floor')!;
  subscribers.add(callback);
  
  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      eventSubscribers.delete('floor');
    }
  };
};

export const subscribeToPrep = (callback: (event: PrepEvent) => void): () => void => {
  if (!eventSubscribers.has('prep')) {
    eventSubscribers.set('prep', new Set());
  }
  
  const subscribers = eventSubscribers.get('prep')!;
  subscribers.add(callback);
  
  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      eventSubscribers.delete('prep');
    }
  };
};