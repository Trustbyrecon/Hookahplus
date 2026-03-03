/**
 * Server-Sent Events (SSE) Service
 * 
 * Manages SSE connections and broadcasting
 */

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

/**
 * Register a new SSE connection
 */
export function registerConnection(connectionId: string, controller: ReadableStreamDefaultController): void {
  connections.set(connectionId, controller);
}

/**
 * Unregister an SSE connection
 */
export function unregisterConnection(connectionId: string): void {
  connections.delete(connectionId);
}

/**
 * Broadcast message to all connections on a channel
 */
export function broadcast(channel: string, data: any): void {
  const message = `data: ${JSON.stringify({ type: 'data', channel, data })}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  connections.forEach((controller, connectionId) => {
    if (connectionId.startsWith(channel)) {
      try {
        controller.enqueue(encoded);
      } catch (error) {
        console.error('[SSE] Error broadcasting:', error);
        connections.delete(connectionId);
      }
    }
  });
}

/**
 * Get active connection count for a channel
 */
export function getConnectionCount(channel?: string): number {
  if (channel) {
    return Array.from(connections.keys()).filter(id => id.startsWith(channel)).length;
  }
  return connections.size;
}

