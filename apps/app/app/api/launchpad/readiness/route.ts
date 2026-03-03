import { NextRequest, NextResponse } from 'next/server';
import { computeReadiness } from '../../../../lib/launchpad/readiness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/launchpad/readiness?loungeId=...&token=...
 *
 * GMV-readiness checkpoints for operators after Go Live.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = (searchParams.get('loungeId') || '').trim();
    const token = (searchParams.get('token') || '').trim();

    if (!loungeId) {
      return NextResponse.json({ success: false, error: 'loungeId is required' }, { status: 400 });
    }

    const readiness = await computeReadiness({ loungeId, token: token || undefined });
    return NextResponse.json(readiness);
  } catch (error: any) {
    console.error('[LaunchPad Readiness] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute readiness', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

