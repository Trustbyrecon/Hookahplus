/**
 * Performance Tracking Middleware
 * 
 * Tracks API response times and records metrics
 * for monitoring and alerting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '../monitoring/performanceMonitor';

/**
 * Wrap an API route handler to track performance
 */
export function withPerformanceTracking<T>(
  handler: (req: NextRequest, context?: { params?: any }) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest, context?: { params?: any }): Promise<NextResponse<T>> => {
    const startTime = Date.now();
    const endpoint = req.nextUrl.pathname;
    const method = req.method;

    try {
      const response = await handler(req, context);
      const responseTime = Date.now() - startTime;
      const statusCode = response.status;

      // Record the metric
      performanceMonitor.recordApiCall(
        endpoint,
        method,
        responseTime,
        statusCode,
        {
          userAgent: req.headers.get('user-agent'),
          referer: req.headers.get('referer'),
        }
      );

      // Add performance header
      response.headers.set('X-Response-Time', `${responseTime}ms`);

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Record error metric
      performanceMonitor.recordApiCall(
        endpoint,
        method,
        responseTime,
        500,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      throw error;
    }
  };
}

