import { NextResponse } from 'next/server';
import { query } from '../db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month';

    // Get all sessions
    const { rows: sessions } = await query('SELECT * FROM sessions ORDER BY start_time DESC');

    // Calculate date cutoff
    const now = new Date();
    const cutoff = new Date();
    
    if (range === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }

    // Filter completed sessions
    const completedSessions = sessions.filter(s => 
      s.end_time && new Date(s.start_time) >= cutoff
    );

    // Calculate revenue
    let totalRevenue = 0;
    const flavorRevenue: Record<string, number> = {};
    const tableRevenue: Record<string, number> = {};
    const timeRevenue: Record<string, number> = {};

    completedSessions.forEach(session => {
      const basePrice = 30;
      const flavorPrice = (session.flavors?.length || 0) * 5;
      const refillPrice = (session.refills || 0) * 5;
      const sessionRevenue = basePrice + flavorPrice + refillPrice;

      totalRevenue += sessionRevenue;

      // Breakdown by flavor
      if (session.flavors) {
        session.flavors.forEach((flavor: string) => {
          flavorRevenue[flavor] = (flavorRevenue[flavor] || 0) + sessionRevenue / session.flavors.length;
        });
      }

      // Breakdown by table
      if (session.table_name) {
        tableRevenue[session.table_name] = (tableRevenue[session.table_name] || 0) + sessionRevenue;
      }

      // Breakdown by time of day
      const hour = new Date(session.start_time).getHours();
      const timeSlot = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
      timeRevenue[timeSlot] = (timeRevenue[timeSlot] || 0) + sessionRevenue;
    });

    const avgSessionValue = completedSessions.length > 0 
      ? totalRevenue / completedSessions.length 
      : 0;

    // Generate trend data (last 7 days)
    const trend: Array<{ date: string; revenue: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRevenue = sessions
        .filter(s => {
          const sDate = new Date(s.start_time);
          return sDate >= date && sDate < nextDate && s.end_time;
        })
        .reduce((sum, s) => {
          const basePrice = 30;
          const flavorPrice = (s.flavors?.length || 0) * 5;
          const refillPrice = (s.refills || 0) * 5;
          return sum + basePrice + flavorPrice + refillPrice;
        }, 0);

      trend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue
      });
    }

    // Calculate today, week, month totals
    const todayCutoff = new Date();
    todayCutoff.setHours(0, 0, 0, 0);
    const weekCutoff = new Date();
    weekCutoff.setDate(weekCutoff.getDate() - 7);
    const monthCutoff = new Date();
    monthCutoff.setMonth(monthCutoff.getMonth() - 1);

    const todayRevenue = sessions
      .filter(s => new Date(s.start_time) >= todayCutoff && s.end_time)
      .reduce((sum, s) => {
        const basePrice = 30;
        const flavorPrice = (s.flavors?.length || 0) * 5;
        const refillPrice = (s.refills || 0) * 5;
        return sum + basePrice + flavorPrice + refillPrice;
      }, 0);

    const weekRevenue = sessions
      .filter(s => new Date(s.start_time) >= weekCutoff && s.end_time)
      .reduce((sum, s) => {
        const basePrice = 30;
        const flavorPrice = (s.flavors?.length || 0) * 5;
        const refillPrice = (s.refills || 0) * 5;
        return sum + basePrice + flavorPrice + refillPrice;
      }, 0);

    const monthRevenue = sessions
      .filter(s => new Date(s.start_time) >= monthCutoff && s.end_time)
      .reduce((sum, s) => {
        const basePrice = 30;
        const flavorPrice = (s.flavors?.length || 0) * 5;
        const refillPrice = (s.refills || 0) * 5;
        return sum + basePrice + flavorPrice + refillPrice;
      }, 0);

    return NextResponse.json({
      today: todayRevenue,
      week: weekRevenue,
      month: monthRevenue,
      averageSessionValue: avgSessionValue,
      sessionCount: completedSessions.length,
      trend,
      breakdown: {
        byFlavor: flavorRevenue,
        byTable: tableRevenue,
        byTimeOfDay: timeRevenue
      }
    });
  } catch (err: any) {
    console.error('Revenue API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch revenue' },
      { status: 500 }
    );
  }
}
