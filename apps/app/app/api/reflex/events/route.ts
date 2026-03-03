import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/reflex/events
 *
 * Lightweight log of recent Reflex events for observability.
 * Used to verify that Reflex hooks (session start/end, refills, extensions, etc.)
 * are firing correctly during pilots.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10) || 50,
      200
    );
    const tenantId = searchParams.get('tenantId');

    const whereClause: any = {};
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const events = await prisma.reflexEvent.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error: any) {
    console.error('[Reflex Events API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load Reflex events',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}


