import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/analytics/retention
 * 
 * Get customer retention metrics: repeat customers, CLV, retention rates, VIP customers
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // P0: Cap windowDays to max 31 days to prevent slow queries
    const windowDays = Math.min(parseInt(searchParams.get('windowDays') || '30', 10), 31);
    const loungeId = searchParams.get('loungeId');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: cutoffDate
      },
      paymentStatus: 'succeeded' // Only count successful payments
    };

    if (loungeId) {
      whereClause.loungeId = loungeId;
    }

    // P0: Use database aggregations instead of fetching all sessions
    // This is MUCH faster for large datasets
    const [
      totalSessions,
      totalRevenue,
      sessionsByCustomerRaw
    ] = await Promise.all([
      // Total session count
      prisma.session.count({
        where: whereClause
      }),
      
      // Total revenue
      prisma.session.aggregate({
        where: whereClause,
        _sum: { priceCents: true }
      }),
      
      // Group by customer (using raw SQL for better performance)
      loungeId 
        ? prisma.$queryRaw`
            SELECT 
              COALESCE("customerRef", "customerPhone", CONCAT('anonymous_', id)) as customer_id,
              COUNT(*) as session_count,
              SUM("priceCents") as total_revenue,
              MIN("createdAt") as first_session,
              MAX("createdAt") as last_session
            FROM "Session"
            WHERE "createdAt" >= ${cutoffDate}
              AND "paymentStatus" = 'succeeded'
              AND "loungeId" = ${loungeId}
            GROUP BY customer_id
            LIMIT 5000
          `
        : prisma.$queryRaw`
            SELECT 
              COALESCE("customerRef", "customerPhone", CONCAT('anonymous_', id)) as customer_id,
              COUNT(*) as session_count,
              SUM("priceCents") as total_revenue,
              MIN("createdAt") as first_session,
              MAX("createdAt") as last_session
            FROM "Session"
            WHERE "createdAt" >= ${cutoffDate}
              AND "paymentStatus" = 'succeeded'
            GROUP BY customer_id
            LIMIT 5000
          `
    ]);

    // Cast the raw query result to any[] after awaiting
    const sessionsByCustomer = (sessionsByCustomerRaw as unknown) as any[];

    // Process aggregated customer data
    const customers = (sessionsByCustomer || []).map((row: any) => ({
      customerId: String(row.customer_id),
      sessionCount: parseInt(String(row.session_count), 10),
      totalRevenue: parseInt(String(row.total_revenue || 0), 10),
      firstSessionDate: new Date(row.first_session),
      lastSessionDate: new Date(row.last_session)
    }));

    // Calculate metrics from aggregated data
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.sessionCount > 1);
    const repeatCustomerRate = totalCustomers > 0 
      ? (repeatCustomers.length / totalCustomers) * 100 
      : 0;

    // Calculate Customer Lifetime Value (CLV)
    const totalRevenueCents = totalRevenue._sum.priceCents || 0;
    const avgCLV = totalCustomers > 0 
      ? (totalRevenueCents / totalCustomers) / 100 // Convert cents to dollars
      : 0;

    // Calculate retention rates (customers who returned within different time periods)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Customers with session in last 30 days
    const recentCustomers = customers.filter(c => 
      c.lastSessionDate >= thirtyDaysAgo
    );

    // For retention calculation, we need to check if customers had sessions in both periods
    // Since we only have aggregated data, we'll use a simplified approach:
    // Customers who had their first session 30-60 days ago and last session in last 30 days
    const retained30Days = customers.filter(c => {
      const firstSessionInWindow = c.firstSessionDate >= sixtyDaysAgo && c.firstSessionDate < thirtyDaysAgo;
      const hadRecentSession = c.lastSessionDate >= thirtyDaysAgo;
      return firstSessionInWindow && hadRecentSession && c.sessionCount > 1;
    });

    const retentionRate30Days = recentCustomers.length > 0
      ? (retained30Days.length / recentCustomers.length) * 100
      : 0;

    // Identify VIP customers (top 10% by revenue)
    const customersByRevenue = customers
      .map(c => ({
        customerId: c.customerId,
        revenue: c.totalRevenue / 100, // Convert to dollars
        sessionCount: c.sessionCount,
        firstSession: c.firstSessionDate,
        lastSession: c.lastSessionDate
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const vipThreshold = Math.ceil(customersByRevenue.length * 0.1);
    const vipCustomers = customersByRevenue.slice(0, vipThreshold);

    // Calculate average sessions per customer
    const avgSessionsPerCustomer = totalCustomers > 0
      ? totalSessions / totalCustomers
      : 0;

    // Calculate average days between sessions for repeat customers
    // Simplified: use first and last session dates for customers with multiple sessions
    let avgDaysBetweenSessions = 0;
    if (repeatCustomers.length > 0) {
      const daysBetweenSessions: number[] = [];
      repeatCustomers.forEach(customer => {
        if (customer.sessionCount > 1) {
          const days = (customer.lastSessionDate.getTime() - customer.firstSessionDate.getTime()) / (1000 * 60 * 60 * 24);
          // Average days between sessions = total days / (session count - 1)
          const avgDays = days / (customer.sessionCount - 1);
          daysBetweenSessions.push(avgDays);
        }
      });

      avgDaysBetweenSessions = daysBetweenSessions.length > 0
        ? daysBetweenSessions.reduce((sum, d) => sum + d, 0) / daysBetweenSessions.length
        : 0;
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalCustomers,
        repeatCustomers: repeatCustomers.length,
        repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10,
        avgCLV: Math.round(avgCLV * 100) / 100,
        avgSessionsPerCustomer: Math.round(avgSessionsPerCustomer * 10) / 10,
        avgDaysBetweenSessions: Math.round(avgDaysBetweenSessions * 10) / 10,
        retentionRate30Days: Math.round(retentionRate30Days * 10) / 10
      },
      vipCustomers: vipCustomers.map(c => ({
        customerId: c.customerId.substring(0, 8) + '...', // Mask for privacy
        revenue: Math.round(c.revenue * 100) / 100,
        sessionCount: c.sessionCount,
        firstSession: c.firstSession.toISOString().split('T')[0],
        lastSession: c.lastSession.toISOString().split('T')[0]
      })),
      breakdown: {
        bySessionCount: {
          single: customers.filter(c => c.sessionCount === 1).length,
          repeat: repeatCustomers.length,
          frequent: customers.filter(c => c.sessionCount >= 5).length
        }
      },
      windowDays
    });

  } catch (error: any) {
    console.error('[Retention Analytics API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get retention analytics',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

