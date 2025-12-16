import { NextRequest, NextResponse } from 'next/server';
import { runWithContextAsync, createRequestContext, getRequestId } from './requestContext';
import { randomUUID } from 'crypto';

/**
 * API Route Helper Utilities
 * Provides utilities for wrapping API routes with request context
 */

/**
 * Initialize request context from headers
 * Call this at the start of each API route handler
 */
export function initRequestContext(req: NextRequest): void {
  // Get request ID from headers (set by middleware) or generate new one
  const requestId = req.headers.get('X-Request-ID') || randomUUID();
  
  // Create and set request context
  const requestContext = createRequestContext(requestId, req.headers);
  
  // Store in AsyncLocalStorage - Note: This needs to be called within the route handler
  // For Next.js, we'll use a different approach - set context at the start of each handler
  runWithContextAsync(requestContext, async () => {
    // Context is now available for this async operation
  });
}

/**
 * Wrap an API route handler with request context
 * Automatically extracts request ID and sets up context for telemetry
 */
export function withRequestContext<T>(
  handler: (req: NextRequest, context?: { params?: any }) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest, context?: { params?: any }): Promise<NextResponse<T>> => {
    // Get or generate request ID from headers
    const requestId = req.headers.get('X-Request-ID') || randomUUID();
    
    // Create request context
    const requestContext = createRequestContext(requestId, req.headers);
    
    // Run handler with context
    return runWithContextAsync(requestContext, async () => {
      return handler(req, context);
    });
  };
}

/**
 * Get request ID for logging in API routes
 */
export function getRequestIdForLogging(): string {
  return getRequestId() || 'unknown';
}

/**
 * Log with request ID prefix
 */
export function logWithRequestId(message: string, ...args: any[]): void {
  const requestId = getRequestIdForLogging();
  console.log(`[${requestId}] ${message}`, ...args);
}

