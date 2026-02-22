import { NextRequest, NextResponse } from 'next/server';
import { getAliethiaPolicy } from '../../../../../../lib/aliethia/policy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/lounges/[loungeId]/aliethia/policy
 *
 * Returns evaluated Aliethia policy for a lounge:
 * - stable venue identity (manually set in LoungeConfig.configData.venue_identity)
 * - bounded UI surfaces enablement
 * - prompt cadence + eligibility knobs
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId: loungeIdRaw } = await params;
    const loungeId = (loungeIdRaw || '').trim();
    if (!loungeId) {
      return NextResponse.json({ success: false, error: 'loungeId is required' }, { status: 400 });
    }

    const policy = await getAliethiaPolicy({ loungeId });
    return NextResponse.json({ success: true, loungeId, policy });
  } catch (error: any) {
    console.error('[Aliethia Policy] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to evaluate policy', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

