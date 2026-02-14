import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const dsnConfigured = !!dsn;
  
  try {
    // Intentionally throw an error to test Sentry
    throw new Error('Sentry test error from app build - this is intentional');
  } catch (error) {
    // Capture the error in Sentry
    if (dsnConfigured) {
      Sentry.captureException(error, {
        tags: {
          component: 'test',
          action: 'sentry_test',
          environment: process.env.NODE_ENV || 'development',
        },
        extra: {
          test: true,
          timestamp: new Date().toISOString(),
          app: 'app-build',
        },
      });
      
      // Flush to ensure event is sent immediately
      await Sentry.flush(2000);
    }
    
    return NextResponse.json({ 
      message: '✅ Test error sent to Sentry! Check your Sentry dashboard.',
      error: error instanceof Error ? error.message : 'Unknown error',
      sentry: dsnConfigured ? 'Error captured successfully' : 'DSN not configured',
      project: 'javascript-nextjs-app',
      dsn_configured: dsnConfigured,
      dsn_preview: dsn ? `${dsn.substring(0, 20)}...` : 'not set',
    });
  }
}

