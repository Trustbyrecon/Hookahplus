import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/analytics/sessions
 * 
 * Get session analytics and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const windowDays = parseInt(searchParams.get('windowDays') || '7', 10);
    const loungeId = searchParams.get('loungeId');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: cutoffDate
      }
    };

    if (loungeId) {
      whereClause.loungeId = loungeId;
    }

    // Get session counts by state
    const sessionsByState = await prisma.session.groupBy({
      by: ['state'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    // Get total sessions
    const totalSessions = await prisma.session.count({
      where: whereClause
    });

    // Get active sessions
    const activeSessions = await prisma.session.count({
      where: {
        ...whereClause,
        state: {
          in: ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'DELIVERED']
        }
      }
    });

    // Get completed sessions
    const completedSessions = await prisma.session.count({
      where: {
        ...whereClause,
        state: 'CLOSED'
      }
    });

    // Get revenue (sum of priceCents)
    const revenueResult = await prisma.session.aggregate({
      where: {
        ...whereClause,
        paymentStatus: 'succeeded'
      },
      _sum: {
        priceCents: true
      }
    });

    const revenue = (revenueResult._sum.priceCents || 0) / 100; // Convert cents to dollars

    // Get extension events
    const extensionEvents = await prisma.reflexEvent.count({
      where: {
        type: 'session.extended',
        createdAt: {
          gte: cutoffDate
        }
      }
    });

    // Get refill events
    const refillEvents = await prisma.reflexEvent.count({
      where: {
        type: {
          in: ['session.refill_requested', 'session.refill_completed']
        },
        createdAt: {
          gte: cutoffDate
        }
      }
    });

    // Calculate average session duration
    const avgDurationResult = await prisma.session.aggregate({
      where: {
        ...whereClause,
        state: 'CLOSED',
        durationSecs: {
          not: null
        }
      },
      _avg: {
        durationSecs: true
      }
    });

    const avgDurationMinutes = avgDurationResult._avg.durationSecs 
      ? Math.round((avgDurationResult._avg.durationSecs / 60) * 10) / 10 
      : 0;

    // Get sessions by source
    const sessionsBySource = await prisma.session.groupBy({
      by: ['source'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalSessions,
        activeSessions,
        completedSessions,
        revenue,
        extensionCount: extensionEvents,
        refillCount: refillEvents,
        avgDurationMinutes,
        windowDays
      },
      breakdown: {
        byState: sessionsByState.map(s => ({
          state: s.state,
          count: s._count.id
        })),
        bySource: sessionsBySource.map(s => ({
          source: s.source,
          count: s._count.id
        }))
      }
    });

  } catch (error: any) {
    console.error('[Analytics API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get analytics',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

