import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const loungeId = searchParams.get('loungeId') || 'default-lounge';

    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Use database aggregations instead of fetching all sessions and processing in memory
    // This is MUCH faster for large datasets
    const baseWhere = {
      loungeId: loungeId,
      paymentStatus: 'succeeded' as const,
      // Exclude voided/canceled sessions - they are not viable transactions
      state: { notIn: ['CANCELED'] as any }
    };

    // Calculate date ranges
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Run all aggregations in parallel for maximum performance
    const [
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalRevenue,
      sessionCount,
      avgSessionValue,
      sessionsForBreakdown // Only fetch minimal data needed for breakdowns
    ] = await Promise.all([
      // Today's revenue
      prisma.session.aggregate({
        where: {
          ...baseWhere,
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        _sum: { priceCents: true },
        _count: { id: true },
      }),

      // Week revenue
      prisma.session.aggregate({
        where: {
          ...baseWhere,
          createdAt: { gte: weekStart },
        },
        _sum: { priceCents: true },
      }),

      // Month revenue
      prisma.session.aggregate({
        where: {
          ...baseWhere,
          createdAt: { gte: monthStart },
        },
        _sum: { priceCents: true },
      }),

      // Total revenue for date range
      prisma.session.aggregate({
        where: {
          ...baseWhere,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        _sum: { priceCents: true },
        _count: { id: true },
      }),

      // Session count
      prisma.session.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),

      // Average session value
      prisma.session.aggregate({
        where: {
          ...baseWhere,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        _avg: { priceCents: true },
      }),

      // Minimal data for breakdowns (only fetch what we need)
      prisma.session.findMany({
        where: {
          ...baseWhere,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          priceCents: true,
          flavorMix: true,
          tableId: true,
          createdAt: true,
        },
        take: 2000, // P0: Reduced from 10000 to 2000 for faster queries (sample is sufficient for breakdowns)
        orderBy: {
          createdAt: 'desc' // Get most recent sessions first
        }
      }),
    ]);

    const today = todayRevenue._sum.priceCents || 0;
    const week = weekRevenue._sum.priceCents || 0;
    const month = monthRevenue._sum.priceCents || 0;
    const sessions = sessionsForBreakdown;

    // Generate trend data (last 7 days) using database queries for better performance
    const trendDataPromises = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      
      trendDataPromises.push(
        prisma.session.aggregate({
          where: {
            ...baseWhere,
            createdAt: {
              gte: date,
              lte: dateEnd,
            },
          },
          _sum: { priceCents: true },
          _count: { id: true },
        }).then(result => ({
          date: date.toISOString().split('T')[0],
          revenue: (result._sum.priceCents || 0) / 100,
          sessions: result._count.id,
        }))
      );
    }
    const trendData = await Promise.all(trendDataPromises);

    // Revenue breakdown by flavor mix
    const flavorBreakdown: Record<string, { revenue: number; count: number }> = {};
    sessions.forEach((session) => {
      // Convert Json type to string for indexing
      const flavorMix = session.flavorMix 
        ? (typeof session.flavorMix === 'string' 
            ? session.flavorMix 
            : Array.isArray(session.flavorMix)
              ? session.flavorMix.join(', ')
              : JSON.stringify(session.flavorMix))
        : 'Unknown';
      if (!flavorBreakdown[flavorMix]) {
        flavorBreakdown[flavorMix] = { revenue: 0, count: 0 };
      }
      flavorBreakdown[flavorMix].revenue += session.priceCents || 0;
      flavorBreakdown[flavorMix].count += 1;
    });

    const flavorBreakdownArray = Object.entries(flavorBreakdown).map(
      ([flavor, data]) => ({
        flavor,
        revenue: data.revenue / 100, // Convert to dollars
        count: data.count,
      })
    );

    // Revenue breakdown by table
    const tableBreakdown: Record<string, { revenue: number; count: number }> = {};
    sessions.forEach((session) => {
      const tableId = session.tableId || 'Unknown';
      if (!tableBreakdown[tableId]) {
        tableBreakdown[tableId] = { revenue: 0, count: 0 };
      }
      tableBreakdown[tableId].revenue += session.priceCents || 0;
      tableBreakdown[tableId].count += 1;
    });

    const tableBreakdownArray = Object.entries(tableBreakdown).map(
      ([table, data]) => ({
        table,
        revenue: data.revenue / 100, // Convert to dollars
        count: data.count,
      })
    );

    // Revenue breakdown by time of day
    const timeBreakdown: Record<string, { revenue: number; count: number }> = {
      'Morning (6am-12pm)': { revenue: 0, count: 0 },
      'Afternoon (12pm-6pm)': { revenue: 0, count: 0 },
      'Evening (6pm-12am)': { revenue: 0, count: 0 },
      'Late Night (12am-6am)': { revenue: 0, count: 0 },
    };

    sessions.forEach((session) => {
      const hour = new Date(session.createdAt).getHours();
      let period: string;
      
      if (hour >= 6 && hour < 12) {
        period = 'Morning (6am-12pm)';
      } else if (hour >= 12 && hour < 18) {
        period = 'Afternoon (12pm-6pm)';
      } else if (hour >= 18 && hour < 24) {
        period = 'Evening (6pm-12am)';
      } else {
        period = 'Late Night (12am-6am)';
      }
      
      timeBreakdown[period].revenue += session.priceCents || 0;
      timeBreakdown[period].count += 1;
    });

    const timeBreakdownArray = Object.entries(timeBreakdown).map(
      ([period, data]) => ({
        period,
        revenue: data.revenue / 100, // Convert to dollars
        count: data.count,
      })
    );

    // Calculate extension revenue from ReflexEvent
    const extensionEvents = await prisma.reflexEvent.findMany({
      where: {
        type: 'session.extended',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        payload: true,
        createdAt: true,
      },
    });

    let extensionRevenue = 0;
    const extensionByDuration: Record<string, { revenue: number; count: number }> = {
      '15min': { revenue: 0, count: 0 },
      '30min': { revenue: 0, count: 0 },
      '45min': { revenue: 0, count: 0 },
      '60min': { revenue: 0, count: 0 },
    };

    extensionEvents.forEach((event) => {
      try {
        const payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
        const cost = payload?.extensionCost || 0;
        const minutes = payload?.extensionMinutes || 0;
        
        extensionRevenue += cost;
        
        // Categorize by duration
        if (minutes <= 15) {
          extensionByDuration['15min'].revenue += cost;
          extensionByDuration['15min'].count += 1;
        } else if (minutes <= 30) {
          extensionByDuration['30min'].revenue += cost;
          extensionByDuration['30min'].count += 1;
        } else if (minutes <= 45) {
          extensionByDuration['45min'].revenue += cost;
          extensionByDuration['45min'].count += 1;
        } else {
          extensionByDuration['60min'].revenue += cost;
          extensionByDuration['60min'].count += 1;
        }
      } catch (e) {
        console.warn('[Revenue API] Failed to parse extension event payload:', e);
      }
    });

    const extensionByDurationArray = Object.entries(extensionByDuration).map(
      ([duration, data]) => ({
        duration,
        revenue: data.revenue,
        count: data.count,
      })
    );

    // Calculate refill revenue from ReflexEvent
    const refillEvents = await prisma.reflexEvent.findMany({
      where: {
        type: {
          in: ['session.refill_requested', 'session.refill_completed'],
        },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        type: true,
        payload: true,
        createdAt: true,
      },
    });

    let refillRevenue = 0;
    const refillByType: Record<string, { revenue: number; count: number }> = {
      'coal': { revenue: 0, count: 0 },
      'flavor': { revenue: 0, count: 0 },
      'full': { revenue: 0, count: 0 },
    };

    refillEvents.forEach((event) => {
      if (event.type === 'session.refill_completed') {
        try {
          const payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
          const cost = payload?.refillCost || payload?.cost || 0;
          const refillType = payload?.refillType || payload?.type || 'full';
          
          refillRevenue += cost;
          
          // Categorize by type
          const typeKey = refillType.toLowerCase().includes('coal') ? 'coal' :
                         refillType.toLowerCase().includes('flavor') ? 'flavor' : 'full';
          refillByType[typeKey].revenue += cost;
          refillByType[typeKey].count += 1;
        } catch (e) {
          console.warn('[Revenue API] Failed to parse refill event payload:', e);
        }
      }
    });

    const refillByTypeArray = Object.entries(refillByType).map(
      ([type, data]) => ({
        type,
        revenue: data.revenue,
        count: data.count,
      })
    );

    // Calculate base session revenue (total session revenue - extensions - refills)
    // Note: Session priceCents already includes extension costs if updated via webhook
    // So we need to calculate base as: total session revenue - extension revenue - refill revenue
    const totalSessionRevenue = (totalRevenue._sum.priceCents || 0) / 100;
    const baseSessionRevenue = Math.max(0, totalSessionRevenue - extensionRevenue - refillRevenue);

    // Calculate percentages
    const totalWithExtensions = totalSessionRevenue + extensionRevenue + refillRevenue;
    const extensionPercentage = totalWithExtensions > 0 
      ? (extensionRevenue / totalWithExtensions) * 100 
      : 0;
    const refillPercentage = totalWithExtensions > 0 
      ? (refillRevenue / totalWithExtensions) * 100 
      : 0;
    const basePercentage = totalWithExtensions > 0 
      ? (baseSessionRevenue / totalWithExtensions) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        today: today / 100, // Convert cents to dollars
        week: week / 100,
        month: month / 100,
        trend: trendData,
        avgSessionValue: (avgSessionValue._avg.priceCents || 0) / 100,
        sessionCount: sessionCount,
        extensionRevenue,
        refillRevenue,
        baseSessionRevenue: Math.max(0, baseSessionRevenue),
        revenueComposition: {
          base: {
            revenue: Math.max(0, baseSessionRevenue),
            percentage: basePercentage,
          },
          extensions: {
            revenue: extensionRevenue,
            percentage: extensionPercentage,
          },
          refills: {
            revenue: refillRevenue,
            percentage: refillPercentage,
          },
        },
        breakdown: {
          byFlavor: flavorBreakdownArray,
          byTable: tableBreakdownArray,
          byTimeOfDay: timeBreakdownArray,
          byExtensionDuration: extensionByDurationArray,
          byRefillType: refillByTypeArray,
        },
      },
    });
  } catch (error) {
    console.error('[Revenue API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch revenue data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

