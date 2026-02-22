import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { calculateWeekOneWins } from '../../../../../lib/launchpad/week1-wins-calculator';
import { MultiLocationService } from '../../../../../lib/services/MultiLocationService';

/**
 * GET /api/launchpad/week1-wins/[loungeId]
 * Get Week-1 Wins metrics for a lounge
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const organizationId = searchParams.get('organizationId');

    const startDate = startDateParam ? new Date(startDateParam) : undefined;

    if (organizationId) {
      const locationResult = await MultiLocationService.getOrganizationLocationIds(organizationId, prisma as any);
      if (!locationResult.success) {
        return NextResponse.json({ error: locationResult.error || 'Failed to resolve organization locations' }, { status: 500 });
      }
      const loungeIds = locationResult.loungeIds || [];
      const rollup = await MultiLocationService.getOnboardingRollupMetrics(loungeIds);
      if (!rollup.success) {
        return NextResponse.json({ error: rollup.error || 'Failed to build organization week-1 rollup' }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        organizationId,
        loungeIds,
        metrics: rollup.rollup,
      });
    }

    // Calculate metrics
    const metrics = await calculateWeekOneWins(loungeId, startDate);

    if (!metrics) {
      return NextResponse.json(
        { error: 'Week-1 Wins metrics not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    console.error('[Week-1 Wins API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate Week-1 Wins metrics' },
      { status: 500 }
    );
  }
}

