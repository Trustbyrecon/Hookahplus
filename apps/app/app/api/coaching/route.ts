import { NextRequest, NextResponse } from 'next/server';
import { generateCoachingTips } from '../../../lib/coaching-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') as 'prep' | 'foh' | 'runner') || 'foh';
    const staffId = searchParams.get('staffId') || undefined;
    const loungeId = searchParams.get('loungeId') || undefined;

    // Validate role
    if (!['prep', 'foh', 'runner'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid role. Must be one of: prep, foh, runner',
        },
        { status: 400 }
      );
    }

    // Generate coaching data
    const coachingData = await generateCoachingTips(role, staffId, loungeId);

    return NextResponse.json({
      success: true,
      coaching: coachingData,
    });
  } catch (error) {
    console.error('[Coaching API] Error generating coaching:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate coaching tips',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

