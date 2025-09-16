import { NextResponse } from 'next/server';
import { getTrustLockStatus } from '../../../lib/trustlock';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const trustLockStatus = getTrustLockStatus();

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      trustLock: trustLockStatus,
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder',
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error: any) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check encountered an error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
