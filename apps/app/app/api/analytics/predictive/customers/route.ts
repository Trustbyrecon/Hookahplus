import { NextRequest, NextResponse } from 'next/server';
import { predictiveEngine } from '../../../../../lib/analytics/predictive';
import { getCurrentTenant } from '../../../../../lib/auth';

/**
 * GET /api/analytics/predictive/customers
 * Get customer behavior predictions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loungeId = searchParams.get('loungeId');
    const limit = parseInt(searchParams.get('limit') || '50');
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

    const predictions = await predictiveEngine.getCustomerBehaviorPredictions(loungeId, tenantId);

    // Group by churn risk
    const byChurnRisk = {
      high: predictions.filter(p => p.churnRisk === 'high'),
      medium: predictions.filter(p => p.churnRisk === 'medium'),
      low: predictions.filter(p => p.churnRisk === 'low')
    };

    return NextResponse.json({
      success: true,
      predictions: predictions.slice(0, limit),
      summary: {
        total: predictions.length,
        highRisk: byChurnRisk.high.length,
        mediumRisk: byChurnRisk.medium.length,
        lowRisk: byChurnRisk.low.length
      }
    });
  } catch (error) {
    console.error('Error getting customer predictions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get customer predictions' },
      { status: 500 }
    );
  }
}

