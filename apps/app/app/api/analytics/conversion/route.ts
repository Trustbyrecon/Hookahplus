import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/analytics/conversion
 * 
 * Get conversion funnel metrics: QR Scan → Session Created → Payment → Completed
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

    // Run all count queries in parallel for better performance
    const [
      qrScans,
      sessionsCreated,
      paymentsCompleted,
      sessionsCompleted
    ] = await Promise.all([
      // Step 1: QR Scans (sessions with source = 'QR')
      prisma.session.count({
        where: {
          ...whereClause,
          source: 'QR'
        }
      }),

      // Step 2: Sessions Created (all sessions)
      prisma.session.count({
        where: whereClause
      }),

      // Step 3: Payments Completed (sessions with paymentStatus = 'succeeded')
      prisma.session.count({
        where: {
          ...whereClause,
          paymentStatus: 'succeeded'
        }
      }),

      // Step 4: Sessions Completed (sessions with state = 'CLOSED')
      prisma.session.count({
        where: {
          ...whereClause,
          state: 'CLOSED'
        }
      })
    ]);

    // Calculate conversion rates
    const conversionRates = {
      scanToCreate: qrScans > 0 ? (sessionsCreated / qrScans) * 100 : 0,
      createToPayment: sessionsCreated > 0 ? (paymentsCompleted / sessionsCreated) * 100 : 0,
      paymentToComplete: paymentsCompleted > 0 ? (sessionsCompleted / paymentsCompleted) * 100 : 0,
      overall: qrScans > 0 ? (sessionsCompleted / qrScans) * 100 : 0
    };

    // Calculate drop-off points
    const dropOffs = {
      scanToCreate: qrScans - sessionsCreated,
      createToPayment: sessionsCreated - paymentsCompleted,
      paymentToComplete: paymentsCompleted - sessionsCompleted
    };

    // Calculate time-to-conversion metrics
    // Get sessions that completed the full funnel (run in parallel with conversionBySource)
    const [completedSessions, conversionBySource] = await Promise.all([
      prisma.session.findMany({
        where: {
          ...whereClause,
          source: 'QR',
          paymentStatus: 'succeeded',
          state: 'CLOSED',
          createdAt: { not: null },
          startedAt: { not: null }
        },
        select: {
          createdAt: true,
          startedAt: true
        }
      }),
      // Get conversion by source
      prisma.session.groupBy({
        by: ['source'],
        where: {
          ...whereClause,
          paymentStatus: 'succeeded',
          state: 'CLOSED'
        },
        _count: {
          id: true
        }
      })
    ]);

    let avgTimeToPayment = 0;
    let avgTimeToComplete = 0;

    if (completedSessions.length > 0) {
      const timeToPayment = completedSessions
        .filter(s => s.createdAt && s.startedAt)
        .map(s => {
          // Time from creation to payment (approximate: use startedAt as payment time)
          const created = new Date(s.createdAt!).getTime();
          const started = new Date(s.startedAt!).getTime();
          return Math.max(0, started - created);
        })
        .filter(t => t > 0);

      const timeToComplete = completedSessions
        .filter(s => s.createdAt && s.startedAt)
        .map(s => {
          // Time from payment to completion (approximate: use startedAt + 45min as completion)
          const started = new Date(s.startedAt!).getTime();
          const completed = started + (45 * 60 * 1000); // 45 minutes default
          return completed - started;
        })
        .filter(t => t > 0);

      avgTimeToPayment = timeToPayment.length > 0
        ? timeToPayment.reduce((sum, t) => sum + t, 0) / timeToPayment.length / 1000 / 60 // Convert to minutes
        : 0;

      avgTimeToComplete = timeToComplete.length > 0
        ? timeToComplete.reduce((sum, t) => sum + t, 0) / timeToComplete.length / 1000 / 60 // Convert to minutes
        : 0;
    }


    const sourceBreakdown = conversionBySource.map(source => ({
      source: source.source || 'UNKNOWN',
      completed: source._count.id,
      // Calculate conversion rate for this source
      conversionRate: sessionsCreated > 0 
        ? (source._count.id / sessionsCreated) * 100 
        : 0
    }));

    return NextResponse.json({
      success: true,
      funnel: {
        qrScans,
        sessionsCreated,
        paymentsCompleted,
        sessionsCompleted
      },
      conversionRates,
      dropOffs,
      timeToConversion: {
        avgTimeToPayment: Math.round(avgTimeToPayment * 10) / 10, // Round to 1 decimal
        avgTimeToComplete: Math.round(avgTimeToComplete * 10) / 10,
        unit: 'minutes'
      },
      breakdown: {
        bySource: sourceBreakdown
      },
      windowDays
    });

  } catch (error: any) {
    console.error('[Conversion Analytics API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get conversion analytics',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

