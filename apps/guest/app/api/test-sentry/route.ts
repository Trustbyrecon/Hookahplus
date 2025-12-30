import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Intentionally throw an error to test Sentry
    throw new Error('Sentry test error from guest app - this is intentional');
  } catch (error) {
    // Capture the error in Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'test',
        action: 'sentry_test',
        environment: process.env.NODE_ENV || 'development',
      },
      extra: {
        test: true,
        timestamp: new Date().toISOString(),
        app: 'guest-app',
      },
    });
    
    return NextResponse.json({ 
      message: '✅ Test error sent to Sentry! Check your Sentry dashboard.',
      error: error instanceof Error ? error.message : 'Unknown error',
      sentry: 'Error captured successfully',
      project: 'javascript-nextjs-guest',
      dsn_configured: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    });
  }
}

