import { NextRequest, NextResponse } from 'next/server';
import { activateLounge } from '../../../../../lib/launchpad/preview-mode';

/**
 * POST /api/launchpad/activate/[loungeId]
 * Activate lounge (switch from preview to live)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId } = await params;
    const body = await req.json();
    const { subscriptionId } = body;

    const result = await activateLounge(loungeId, subscriptionId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[Activate Lounge API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to activate lounge',
      },
      { status: 500 }
    );
  }
}

