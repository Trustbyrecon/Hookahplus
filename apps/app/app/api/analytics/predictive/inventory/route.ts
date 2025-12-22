import { NextRequest, NextResponse } from 'next/server';
import { predictiveEngine } from '../../../../../lib/analytics/predictive';
import { getCurrentTenant } from '../../../../../lib/auth';

/**
 * GET /api/analytics/predictive/inventory
 * Get inventory demand forecasts
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

    const forecasts = await predictiveEngine.getInventoryForecasts(loungeId, tenantId);

    return NextResponse.json({
      success: true,
      forecasts
    });
  } catch (error) {
    console.error('Error getting inventory forecasts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get inventory forecasts' },
      { status: 500 }
    );
  }
}

