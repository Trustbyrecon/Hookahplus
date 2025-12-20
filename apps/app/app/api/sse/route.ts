/**
 * Server-Sent Events (SSE) API Route
 * 
 * Provides real-time updates via SSE as a WebSocket alternative
 * Works with standard Next.js API routes
 */

import { NextRequest } from 'next/server';

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel') || 'default';

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const connectionId = `${channel}-${Date.now()}-${Math.random()}`;
      connections.set(connectionId, controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', channel })}\n\n`)
      );

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        connections.delete(connectionId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx
    },
  });
}

/**
 * Broadcast message to all connections on a channel
 */
export function broadcast(channel: string, data: any) {
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

