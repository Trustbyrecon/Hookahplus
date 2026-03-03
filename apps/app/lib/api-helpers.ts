import { NextRequest, NextResponse } from 'next/server';
import { runWithContextAsync, createRequestContext, getRequestId } from './requestContext';
import { randomUUID } from 'crypto';
import { logger } from './logger';

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
export type AppRouteContext = { params: Promise<any> };

export function withRequestContext<T>(
  handler: (req: NextRequest, context: AppRouteContext) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest, context: AppRouteContext): Promise<NextResponse<T>> => {
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
 * Log with request ID prefix (deprecated - use logger instead)
 */
export function logWithRequestId(message: string, ...args: any[]): void {
  const requestId = getRequestIdForLogging();
  logger.info(message, {
    requestId,
    ...(args.length > 0 && { args }),
  });
}

/**
 * Filter staff-only notes from response data
 * Use this in all customer-facing endpoints to ensure notes are never exposed
 */
export function filterStaffNotesFromResponse<T extends Record<string, any>>(
  data: T
): Omit<T, 'notes'> {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const { notes, ...rest } = data;
  
  // Recursively filter nested objects
  const filtered: any = {};
  for (const key in rest) {
    if (rest[key] && typeof rest[key] === 'object' && !Array.isArray(rest[key])) {
      filtered[key] = filterStaffNotesFromResponse(rest[key]);
    } else {
      filtered[key] = rest[key];
    }
  }
  
  return filtered as Omit<T, 'notes'>;
}

/**
 * Middleware wrapper to ensure staff notes are never returned
 * Use this to wrap customer-facing API route handlers
 */
export function withStaffNoteFilter<T>(
  handler: (req: NextRequest, context: AppRouteContext) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest, context: AppRouteContext): Promise<NextResponse<T>> => {
    const response = await handler(req, context);
    
    // Only filter if response is JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const data = await response.json();
        const filtered = filterStaffNotesFromResponse(data);
        return NextResponse.json(filtered, {
          status: response.status,
          headers: response.headers,
        });
      } catch (error) {
        // If JSON parsing fails, return original response
        return response;
      }
    }
    
    return response;
  };
}

