import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { calculateWeekOneWins } from '../../../../../lib/launchpad/week1-wins-calculator';

/**
 * GET /api/launchpad/week1-wins/[loungeId]
 * Get Week-1 Wins metrics for a lounge
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const searchParams = req.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');

    const startDate = startDateParam ? new Date(startDateParam) : undefined;

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

