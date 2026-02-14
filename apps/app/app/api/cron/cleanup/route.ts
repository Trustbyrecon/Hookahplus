import { NextRequest, NextResponse } from 'next/server';
import { runAllCleanupJobs } from '../../../../lib/jobs/cleanup';

/**
 * POST /api/cron/cleanup
 * Run all cleanup jobs
 * 
 * This endpoint should be called by a cron job (e.g., Vercel Cron, external scheduler)
 * 
 * Security: Should be protected with a secret token or IP whitelist
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Verify cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = await runAllCleanupJobs();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('[Cron Cleanup] Error:', error);
    return NextResponse.json(
      {
        error: 'Cleanup job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/cleanup
 * Health check endpoint
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/cron/cleanup',
    description: 'Cleanup jobs endpoint',
    schedule: 'Recommended: Run every hour',
    jobs: [
      'closeAbandonedSessions',
      'expireStaleOrders',
      'resyncStuckPayments',
      'expireOldPreOrders'
    ]
  });
}

