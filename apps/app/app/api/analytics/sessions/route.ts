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
    // P0: Cap windowDays to max 31 days to prevent slow queries
    const windowDays = Math.min(parseInt(searchParams.get('windowDays') || '7', 10), 31);
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

    // Run all queries in parallel for better performance
    const [
      sessionsByState,
      totalSessions,
      activeSessions,
      completedSessions,
      revenueResult,
      extensionEvents,
      refillEvents,
      avgDurationResult,
      sessionsBySource
    ] = await Promise.all([
      // Get session counts by state
      prisma.session.groupBy({
        by: ['state'],
        where: whereClause,
        _count: {
          id: true
        }
      }),

      // Get total sessions
      prisma.session.count({
        where: whereClause
      }),

      // Get active sessions
      prisma.session.count({
        where: {
          ...whereClause,
          state: {
            in: ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'DELIVERED']
          }
        }
      }),

      // Get completed sessions
      prisma.session.count({
        where: {
          ...whereClause,
          state: 'CLOSED'
        }
      }),

      // Get revenue (sum of priceCents)
      prisma.session.aggregate({
        where: {
          ...whereClause,
          paymentStatus: 'succeeded'
        },
        _sum: {
          priceCents: true
        }
      }),

      // Get extension events
      prisma.reflexEvent.count({
        where: {
          type: 'session.extended',
          createdAt: {
            gte: cutoffDate
          }
        }
      }),

      // Get refill events
      prisma.reflexEvent.count({
        where: {
          type: {
            in: ['session.refill_requested', 'session.refill_completed']
          },
          createdAt: {
            gte: cutoffDate
          }
        }
      }),

      // Calculate average session duration (only for closed sessions with duration)
      prisma.session.aggregate({
        where: {
          ...whereClause,
          state: 'CLOSED',
          durationSecs: {
            not: null
          }
        },
        _avg: {
          durationSecs: true
        },
        _count: {
          id: true
        }
      }),

      // Get sessions by source
      prisma.session.groupBy({
        by: ['source'],
        where: whereClause,
        _count: {
          id: true
        }
      })
    ]);

    const revenue = (revenueResult._sum.priceCents || 0) / 100; // Convert cents to dollars
    const avgDurationMinutes = avgDurationResult._avg.durationSecs 
      ? Math.round((avgDurationResult._avg.durationSecs / 60) * 10) / 10 
      : 0;

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

