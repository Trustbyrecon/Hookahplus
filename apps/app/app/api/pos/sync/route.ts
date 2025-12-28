import { NextRequest, NextResponse } from 'next/server';
import { posSyncService } from '../../../../lib/pos/sync-service';
import { getCurrentTenant } from '../../../../lib/auth';

/**
 * POST /api/pos/sync
 * Manually trigger POS synchronization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loungeId, posSystem, startDate, endDate, autoReconcile = true } = body;
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!loungeId || !posSystem) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: loungeId, posSystem' },
        { status: 400 }
      );
    }

    if (!['square', 'toast', 'clover'].includes(posSystem)) {
      return NextResponse.json(
        { success: false, error: 'Invalid posSystem. Must be: square, toast, or clover' },
        { status: 400 }
      );
    }

    let tenantId: string | undefined;
    if (!isDevelopment) {
      tenantId = (await getCurrentTenant()) || undefined;
    }

    const result = await posSyncService.syncSessions({
      loungeId,
      tenantId: tenantId || null,
      posSystem: posSystem as 'square' | 'toast' | 'clover',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      autoReconcile
    });

    return NextResponse.json({
      success: result.success,
      ...result
    });
  } catch (error) {
    console.error('Error syncing POS:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync POS' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pos/sync/stats
 * Get POS reconciliation statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loungeId = searchParams.get('loungeId');
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!loungeId) {
      return NextResponse.json(
        { success: false, error: 'Missing loungeId parameter' },
        { status: 400 }
      );
    }

    let tenantId: string | undefined;
    if (!isDevelopment) {
      tenantId = (await getCurrentTenant()) || undefined;
    }

    const stats = await posSyncService.getReconciliationStats(loungeId, tenantId);

    return NextResponse.json({
      success: true,
      ...stats,
      isHealthy: stats.reconciliationRate >= 95
    });
  } catch (error) {
    console.error('Error getting POS stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get POS stats' },
      { status: 500 }
    );
  }
}

