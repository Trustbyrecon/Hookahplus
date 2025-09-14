// lib/eventBus.ts
type Handler = (payload: any) => void;

const channels = new Map<string, Set<Handler>>();

export function publish(topic: string, payload: any) {
  const subs = channels.get(topic);
  if (!subs) return;
  for (const h of subs) {
    try { h(payload); } catch { /* noop */ }
  }
}

export function subscribe(topic: string, handler: Handler) {
  if (!channels.has(topic)) channels.set(topic, new Set());
  channels.get(topic)!.add(handler);
  return () => channels.get(topic)!.delete(handler);
}

export function unsubscribe(topic: string, handler: Handler) {
  const subs = channels.get(topic);
  if (subs) {
    subs.delete(handler);
  }
}

export function getSubscriberCount(topic: string): number {
  return channels.get(topic)?.size || 0;
}

export function getActiveTopics(): string[] {
  return Array.from(channels.keys());
}

// Convenience methods for common session events
export function publishSessionEvent(sessionId: string, event: any) {
  publish(`sessions.${sessionId}`, event);
  publish(`sessions.all`, event);
}

export function publishFloorEvent(event: any) {
  publish(`sessions.floor`, event);
}

export function publishPrepEvent(event: any) {
  publish(`sessions.prep`, event);
}

export function publishSystemEvent(event: any) {
  publish(`system`, event);
}
