import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const dsnConfigured = !!dsn;
  
  // Check if Sentry is available (simplified check for v10+)
  const isAvailable = typeof Sentry !== 'undefined' && typeof Sentry.captureException === 'function';
  
  // Try to capture a test event
  let captureResult = null;
  if (dsnConfigured && isAvailable) {
    try {
      const eventId = Sentry.captureException(
        new Error('Sentry debug test - explicit capture'),
        {
          tags: {
            component: 'debug',
            action: 'explicit_test',
            environment: process.env.NODE_ENV || 'development',
            test_type: 'debug_endpoint',
          },
          extra: {
            test: true,
            timestamp: new Date().toISOString(),
            app: 'app-build',
            debug: true,
          },
          level: 'error',
        }
      );
      
      // Flush with longer timeout
      const flushed = await Sentry.flush(5000);
      
      captureResult = {
        eventId,
        flushed,
        success: true,
      };
    } catch (error) {
      captureResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  
  return NextResponse.json({
    diagnostic: 'Sentry Debug Information',
    dsn_configured: dsnConfigured,
    dsn_preview: dsn ? `${dsn.substring(0, 30)}...` : 'not set',
    sentry_available: isAvailable,
    capture_result: captureResult,
    environment: process.env.NODE_ENV || 'development',
    node_version: process.version,
    timestamp: new Date().toISOString(),
  });
}

