import { NextRequest, NextResponse } from 'next/server';
import { getRequestId } from '../../lib/requestContext';

/**
 * Centralized Error Handler
 * Wraps API route handlers to automatically capture errors to Sentry
 * and return user-friendly error messages
 */

export interface ErrorHandlerOptions {
  captureToSentry?: boolean;
  includeStack?: boolean;
  logError?: boolean;
}

const defaultOptions: ErrorHandlerOptions = {
  captureToSentry: true,
  includeStack: process.env.NODE_ENV === 'development',
  logError: true,
};

/**
 * Wrap an API route handler with error handling
 */
export function withErrorHandler<T>(
  handler: (req: NextRequest, context?: { params?: any }) => Promise<NextResponse<T>>,
  options: ErrorHandlerOptions = {}
) {
  const opts = { ...defaultOptions, ...options };

  return async (req: NextRequest, context?: { params?: any }): Promise<NextResponse<T>> => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      const requestId = getRequestId() || 'unknown';
      
      if (opts.logError) {
        console.error(`[ErrorHandler] [${requestId}] Error in ${req.method} ${req.nextUrl.pathname}:`, error);
      }

      // Capture to Sentry if enabled
      if (opts.captureToSentry) {
        try {
          const Sentry = require('@sentry/nextjs');
          if (Sentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
            Sentry.captureException(error, {
              tags: {
                method: req.method,
                path: req.nextUrl.pathname,
              },
              extra: {
                requestId,
                url: req.url,
              },
            });
          }
        } catch (sentryError) {
          console.warn('[ErrorHandler] Failed to capture to Sentry:', sentryError);
        }
      }

      // Return user-friendly error response
      const errorMessage = error?.message || 'An unexpected error occurred';
      const statusCode = error?.statusCode || error?.status || 500;

      return NextResponse.json(
        {
          error: errorMessage,
          requestId,
          ...(opts.includeStack && error?.stack && { stack: error.stack }),
          ...(process.env.NODE_ENV === 'development' && {
            details: error?.details,
            code: error?.code,
          }),
        },
        { status: statusCode }
      );
    }
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: any
): NextResponse {
  const requestId = getRequestId() || 'unknown';
  
  return NextResponse.json(
    {
      error: message,
      requestId,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        timestamp: new Date().toISOString(),
      }),
    },
    { status: statusCode }
  );
}

