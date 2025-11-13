/**
 * GET /api/taxonomy/kpi
 * 
 * Returns KPI metrics for taxonomy coverage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUnknownRate } from '../../../../lib/taxonomy/unknown-tracker';
import { prisma } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const windowDays = parseInt(searchParams.get('window') || '7', 10);

    // Get unknown rates for each enum type
    const sessionStateUnknowns = await getUnknownRate('SessionState', windowDays);
    const trustEventUnknowns = await getUnknownRate('TrustEventType', windowDays);
    const driftReasonUnknowns = await getUnknownRate('DriftReason', windowDays);

    // Get actual event counts for better accuracy
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);

    // Count sessions with v1 state
    const sessionsWithV1 = await prisma.session.count({
      where: {
        sessionStateV1: { not: null },
        createdAt: { gte: cutoffDate }
      }
    });

    const totalSessions = await prisma.session.count({
      where: {
        createdAt: { gte: cutoffDate }
      }
    });

    // Count reflex events with v1 type
    const eventsWithV1 = await prisma.reflexEvent.count({
      where: {
        trustEventTypeV1: { not: null },
        createdAt: { gte: cutoffDate }
      }
    });

    const totalEvents = await prisma.reflexEvent.count({
      where: {
        createdAt: { gte: cutoffDate }
      }
    });

    // Calculate coverage
    const sessionStateCoverage = totalSessions > 0 
      ? (sessionsWithV1 / totalSessions) * 100 
      : 100;
    
    const trustEventCoverage = totalEvents > 0
      ? (eventsWithV1 / totalEvents) * 100
      : 100;

    // Overall coverage (weighted average)
    const totalItems = totalSessions + totalEvents;
    const totalWithV1 = sessionsWithV1 + eventsWithV1;
    const overallCoverage = totalItems > 0
      ? (totalWithV1 / totalItems) * 100
      : 100;

    // Check if unknown rate exceeds threshold
    const unknownRateThreshold = 5; // 5%
    const sessionStateUnknownRate = sessionStateUnknowns.unknownRate;
    const trustEventUnknownRate = trustEventUnknowns.unknownRate;
    
    const alertThreshold = unknownRateThreshold;
    const sessionStateAlert = sessionStateUnknownRate > alertThreshold;
    const trustEventAlert = trustEventUnknownRate > alertThreshold;

    return NextResponse.json({
      success: true,
      windowDays,
      metrics: {
        sessionState: {
          coverage: sessionStateCoverage,
          unknownRate: sessionStateUnknownRate,
          totalEvents: totalSessions,
          validatedEvents: sessionsWithV1,
          alert: sessionStateAlert
        },
        trustEventType: {
          coverage: trustEventCoverage,
          unknownRate: trustEventUnknownRate,
          totalEvents,
          validatedEvents: eventsWithV1,
          alert: trustEventAlert
        },
        overall: {
          coverage: overallCoverage,
          totalEvents: totalItems,
          validatedEvents: totalWithV1
        }
      },
      thresholds: {
        coverageTarget: 95, // ≥95% coverage target
        unknownRateMax: unknownRateThreshold // <5% unknown rate target
      }
    });
  } catch (error) {
    console.error('[Taxonomy API] Error fetching KPI:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

