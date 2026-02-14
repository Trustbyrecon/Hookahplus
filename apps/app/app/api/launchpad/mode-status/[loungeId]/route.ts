import { NextRequest, NextResponse } from 'next/server';
import { getLoungeModeStatus } from '../../../../../lib/launchpad/preview-mode';

/**
 * GET /api/launchpad/mode-status/[loungeId]
 * Get lounge mode status (preview vs live)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;

    const status = await getLoungeModeStatus(loungeId);

    if (!status) {
      return NextResponse.json(
        { error: 'Lounge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error: any) {
    console.error('[Mode Status API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get mode status' },
      { status: 500 }
    );
  }
}

