import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

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

    // Get sessions from database
    const sessions = await prisma.session.findMany({
      where: {
        loungeId: loungeId,
        createdAt: {
          gte: start,
          lte: end,
        },
        paymentStatus: 'succeeded', // Only include successful payments
      },
      select: {
        id: true,
        priceCents: true,
        paymentIntent: true,
        flavorMix: true,
        tableId: true,
        createdAt: true,
        startedAt: true,
      },
    });

    // Calculate today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todaySessions = sessions.filter(
      (s) => s.createdAt >= todayStart && s.createdAt <= todayEnd
    );
    const today = todaySessions.reduce((sum, s) => sum + s.priceCents, 0);

    // Calculate week revenue (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekSessions = sessions.filter((s) => s.createdAt >= weekStart);
    const week = weekSessions.reduce((sum, s) => sum + s.priceCents, 0);

    // Calculate month revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthSessions = sessions.filter((s) => s.createdAt >= monthStart);
    const month = monthSessions.reduce((sum, s) => sum + s.priceCents, 0);

    // Calculate average session value
    const avgSessionValue =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.priceCents, 0) / sessions.length
        : 0;

    // Generate trend data (last 7 days)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      
      const daySessions = sessions.filter(
        (s) => s.createdAt >= date && s.createdAt <= dateEnd
      );
      const dayRevenue = daySessions.reduce((sum, s) => sum + s.priceCents, 0);
      
      trendData.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue / 100, // Convert cents to dollars
        sessions: daySessions.length,
      });
    }

    // Revenue breakdown by flavor mix
    const flavorBreakdown: Record<string, { revenue: number; count: number }> = {};
    sessions.forEach((session) => {
      const flavorMix = session.flavorMix || 'Unknown';
      if (!flavorBreakdown[flavorMix]) {
        flavorBreakdown[flavorMix] = { revenue: 0, count: 0 };
      }
      flavorBreakdown[flavorMix].revenue += session.priceCents;
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
      tableBreakdown[tableId].revenue += session.priceCents;
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
      
      timeBreakdown[period].revenue += session.priceCents;
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
    const totalSessionRevenue = sessions.reduce((sum, s) => sum + s.priceCents, 0) / 100;
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
        avgSessionValue: avgSessionValue / 100,
        sessionCount: sessions.length,
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

