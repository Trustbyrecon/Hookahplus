import { NextRequest, NextResponse } from 'next/server';
import { retentionEngine } from '../../../../lib/retention/automation';
import { getCurrentTenant } from '../../../../lib/auth';

/**
 * POST /api/retention/check
 * Manually trigger retention check for a lounge
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loungeId } = body;
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!loungeId) {
      return NextResponse.json(
        { success: false, error: 'Missing loungeId parameter' },
        { status: 400 }
      );
    }

    let tenantId: string | undefined;
    if (!isDevelopment) {
      const tenant = await getCurrentTenant();
      tenantId = tenant?.id;
    }

    // Check for retention triggers
    const triggers = await retentionEngine.checkRetentionTriggers(loungeId, tenantId);

    // Process triggers (send emails, apply campaigns, etc.)
    await retentionEngine.processTriggers(triggers);

    return NextResponse.json({
      success: true,
      triggersFound: triggers.length,
      triggers: triggers.map(t => ({
        type: t.type,
        customerPhone: t.customerPhone ? t.customerPhone.substring(0, 3) + '***' : undefined,
        metadata: t.metadata
      }))
    });
  } catch (error) {
    console.error('Error checking retention triggers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check retention triggers' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/retention/check
 * Get retention statistics for a lounge
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
      const tenant = await getCurrentTenant();
      tenantId = tenant?.id;
    }

    // Check for retention triggers (without processing)
    const triggers = await retentionEngine.checkRetentionTriggers(loungeId, tenantId);

    // Group by type
    const byType = triggers.reduce((acc, trigger) => {
      acc[trigger.type] = (acc[trigger.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      totalTriggers: triggers.length,
      byType,
      summary: {
        churnRisk: byType.churn_risk || 0,
        winBack: byType.win_back || 0,
        reEngagement: byType.re_engagement || 0,
        loyaltyMilestones: byType.loyalty_milestone || 0,
        abandonedCarts: byType.abandoned_cart || 0
      }
    });
  } catch (error) {
    console.error('Error getting retention stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get retention stats' },
      { status: 500 }
    );
  }
}

