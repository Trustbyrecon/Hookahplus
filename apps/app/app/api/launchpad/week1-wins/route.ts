import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { MultiLocationService } from '../../../../lib/services/MultiLocationService';

/**
 * GET /api/launchpad/week1-wins?organizationId=... OR ?loungeIds=a,b,c
 * Org-level onboarding rollup endpoint.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const loungeIdsParam = searchParams.get('loungeIds');

    let loungeIds: string[] = [];
    if (organizationId) {
      const locations = await MultiLocationService.getOrganizationLocationIds(organizationId, prisma as any);
      if (!locations.success) {
        return NextResponse.json({ error: locations.error || 'Failed to resolve organization locations' }, { status: 500 });
      }
      loungeIds = locations.loungeIds || [];
    } else if (loungeIdsParam) {
      loungeIds = loungeIdsParam.split(',').map((id) => id.trim()).filter(Boolean);
    } else {
      return NextResponse.json({ error: 'Provide organizationId or loungeIds' }, { status: 400 });
    }

    const rollup = await MultiLocationService.getOnboardingRollupMetrics(loungeIds);
    if (!rollup.success) {
      return NextResponse.json({ error: rollup.error || 'Failed to compute rollup' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      organizationId,
      loungeIds,
      metrics: rollup.rollup,
    });
  } catch (error) {
    console.error('[Week-1 Wins Rollup API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch week-1 wins rollup' }, { status: 500 });
  }
}
