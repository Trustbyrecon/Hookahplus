import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const dsnConfigured = !!dsn;
  
  // Check if Sentry is initialized
  const isInitialized = typeof Sentry !== 'undefined' && Sentry.getCurrentHub !== undefined;
  
  // Get Sentry client info
  let clientInfo = null;
  try {
    const hub = Sentry.getCurrentHub();
    const client = hub.getClient();
    clientInfo = {
      dsn: client?.getDsn()?.toString() || 'not set',
      environment: client?.getOptions()?.environment || 'not set',
      enabled: client?.getOptions()?.enabled !== false,
    };
  } catch (e) {
    clientInfo = { error: String(e) };
  }
  
  // Try to capture a test event with more explicit configuration
  let captureResult = null;
  if (dsnConfigured && isInitialized) {
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
    sentry_initialized: isInitialized,
    client_info: clientInfo,
    capture_result: captureResult,
    environment: process.env.NODE_ENV || 'development',
    node_version: process.version,
    timestamp: new Date().toISOString(),
  });
}

