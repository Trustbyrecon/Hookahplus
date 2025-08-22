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

// Helper for session-specific topics
export function publishSessionEvent(sessionId: string, payload: any) {
  publish(`sessions.${sessionId}`, payload);
  publish(`sessions.floor`, payload); // FOH board could subscribe
  publish(`sessions.prep`, payload);  // BOH board could subscribe
}
