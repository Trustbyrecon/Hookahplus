import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Intentionally throw an error to test error handling
    throw new Error('Test error from guest app - this is intentional');
  } catch (error) {
    // Log error to console (Sentry not configured in guest app)
    console.error('Test error caught:', error);
    
    return NextResponse.json({ 
      message: '⚠️ Test endpoint executed. Sentry is not configured in the guest app.',
      error: error instanceof Error ? error.message : 'Unknown error',
      note: 'To enable Sentry, add @sentry/nextjs to guest app dependencies',
      app: 'guest-app',
      timestamp: new Date().toISOString(),
    });
  }
}

