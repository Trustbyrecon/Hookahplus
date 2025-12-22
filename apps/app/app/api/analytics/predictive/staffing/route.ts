import { NextRequest, NextResponse } from 'next/server';
import { predictiveEngine } from '../../../../../lib/analytics/predictive';
import { getCurrentTenant } from '../../../../../lib/auth';

/**
 * GET /api/analytics/predictive/staffing
 * Get predictive staffing recommendations
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

    const recommendations = await predictiveEngine.getStaffingRecommendations(loungeId, tenantId);

    return NextResponse.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting staffing recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get staffing recommendations' },
      { status: 500 }
    );
  }
}

