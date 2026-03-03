import { NextRequest, NextResponse } from 'next/server';
import { saveProgress } from '../../../../lib/launchpad/session-manager';
import { LaunchPadProgress } from '../../../../types/launchpad';

/**
 * POST /api/launchpad/progress
 * Save progress for a setup session
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, step, data } = body;

    if (!token || !step || !data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token, step, and data are required',
        },
        { status: 400 }
      );
    }

    await saveProgress(token, step, data);

    return NextResponse.json({
      success: true,
      message: 'Progress saved',
    });
  } catch (error: any) {
    console.error('[LaunchPad Progress] Error saving progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save progress',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

