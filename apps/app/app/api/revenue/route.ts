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

    return NextResponse.json({
      success: true,
      data: {
        today: today / 100, // Convert cents to dollars
        week: week / 100,
        month: month / 100,
        trend: trendData,
        avgSessionValue: avgSessionValue / 100,
        sessionCount: sessions.length,
        breakdown: {
          byFlavor: flavorBreakdownArray,
          byTable: tableBreakdownArray,
          byTimeOfDay: timeBreakdownArray,
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

