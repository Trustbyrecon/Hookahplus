/**
 * Server-Sent Events (SSE) API Route
 * 
 * Provides real-time updates via SSE as a WebSocket alternative
 * Works with standard Next.js API routes
 */

import { NextRequest } from 'next/server';
import { registerConnection, unregisterConnection } from '../../../lib/services/SSEService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel') || 'default';

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const connectionId = `${channel}-${Date.now()}-${Math.random()}`;
      registerConnection(connectionId, controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', channel })}\n\n`)
      );

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        unregisterConnection(connectionId);
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

