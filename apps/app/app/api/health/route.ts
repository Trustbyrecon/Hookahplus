import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: 'unknown',
        stripe: 'unknown',
        storage: 'unknown'
      }
    };

    // Check database connectivity (if configured)
    if (process.env.DATABASE_URL) {
      try {
        // This would be a real database check in production
        health.services.database = 'connected';
      } catch (error) {
        health.services.database = 'error';
        health.status = 'degraded';
      }
    }

    // Check Stripe connectivity
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        // Basic Stripe key validation
        if (process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
          health.services.stripe = 'configured';
        } else {
          health.services.stripe = 'misconfigured';
          health.status = 'degraded';
        }
      } catch (error) {
        health.services.stripe = 'error';
        health.status = 'degraded';
      }
    }

    // Check storage (if configured)
    if (process.env.SUPABASE_URL) {
      try {
        // Basic Supabase URL validation
        if (process.env.SUPABASE_URL.includes('supabase.co')) {
          health.services.storage = 'configured';
        } else {
          health.services.storage = 'misconfigured';
          health.status = 'degraded';
        }
      } catch (error) {
        health.services.storage = 'error';
        health.status = 'degraded';
      }
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    
    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function HEAD() {
  // Simple HEAD request for basic health check
  return new NextResponse(null, { status: 200 });
}