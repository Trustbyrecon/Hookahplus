import { NextRequest, NextResponse } from 'next/server';
import { runNightlyReconciliation, getReconciliationHistory } from '../../../../lib/jobs/reconciliation';
import { hasRole, getCurrentTenant } from '../../../../lib/auth';

/**
 * POST /api/admin/reconciliation
 * Trigger manual reconciliation run
 */
export async function POST(req: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const tenantId = await getCurrentTenant(req);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    // Run reconciliation
    const result = await runNightlyReconciliation(tenantId);

    return NextResponse.json({
      success: true,
      reconciliation: result,
    });

  } catch (error) {
    console.error('Error running reconciliation:', error);
    return NextResponse.json(
      {
        error: 'Failed to run reconciliation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/reconciliation
 * Get reconciliation history
 */
export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const tenantId = await getCurrentTenant(req);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30');

    const history = await getReconciliationHistory(tenantId, limit);

    return NextResponse.json({
      success: true,
      history,
    });

  } catch (error) {
    console.error('Error getting reconciliation history:', error);
    return NextResponse.json(
      {
        error: 'Failed to get reconciliation history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

