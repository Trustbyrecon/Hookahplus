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
    const windowDays = parseInt(searchParams.get('windowDays') || '30', 10);
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

    // Get all sessions with customer info
    const sessions = await prisma.session.findMany({
      where: whereClause,
      select: {
        id: true,
        customerRef: true,
        customerPhone: true,
        priceCents: true,
        createdAt: true,
        state: true
      }
    });

    // Group sessions by customer (use customerRef or customerPhone as identifier)
    const customerMap = new Map<string, {
      sessions: typeof sessions;
      totalRevenue: number;
      sessionCount: number;
      firstSessionDate: Date;
      lastSessionDate: Date;
    }>();

    sessions.forEach(session => {
      // Use customerRef if available, otherwise customerPhone, otherwise 'anonymous'
      const customerId = session.customerRef || session.customerPhone || `anonymous_${session.id}`;
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          sessions: [],
          totalRevenue: 0,
          sessionCount: 0,
          firstSessionDate: new Date(session.createdAt),
          lastSessionDate: new Date(session.createdAt)
        });
      }

      const customer = customerMap.get(customerId)!;
      customer.sessions.push(session);
      customer.totalRevenue += session.priceCents || 0;
      customer.sessionCount += 1;
      
      const sessionDate = new Date(session.createdAt);
      if (sessionDate < customer.firstSessionDate) {
        customer.firstSessionDate = sessionDate;
      }
      if (sessionDate > customer.lastSessionDate) {
        customer.lastSessionDate = sessionDate;
      }
    });

    // Calculate metrics
    const totalCustomers = customerMap.size;
    const repeatCustomers = Array.from(customerMap.values()).filter(c => c.sessionCount > 1);
    const repeatCustomerRate = totalCustomers > 0 
      ? (repeatCustomers.length / totalCustomers) * 100 
      : 0;

    // Calculate Customer Lifetime Value (CLV)
    const totalRevenue = Array.from(customerMap.values())
      .reduce((sum, c) => sum + c.totalRevenue, 0);
    const avgCLV = totalCustomers > 0 
      ? (totalRevenue / totalCustomers) / 100 // Convert cents to dollars
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
    const recentCustomers = Array.from(customerMap.values()).filter(c => 
      c.lastSessionDate >= thirtyDaysAgo
    );

    // Customers with session 30-60 days ago who also had one in last 30 days
    const retained30Days = Array.from(customerMap.values()).filter(c => {
      const hadSession30to60DaysAgo = c.sessions.some(s => {
        const sessionDate = new Date(s.createdAt);
        return sessionDate >= sixtyDaysAgo && sessionDate < thirtyDaysAgo;
      });
      const hadRecentSession = c.lastSessionDate >= thirtyDaysAgo;
      return hadSession30to60DaysAgo && hadRecentSession;
    });

    const retentionRate30Days = recentCustomers.length > 0
      ? (retained30Days.length / recentCustomers.length) * 100
      : 0;

    // Identify VIP customers (top 10% by revenue)
    const customersByRevenue = Array.from(customerMap.entries())
      .map(([id, data]) => ({
        customerId: id,
        revenue: data.totalRevenue / 100, // Convert to dollars
        sessionCount: data.sessionCount,
        firstSession: data.firstSessionDate,
        lastSession: data.lastSessionDate
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const vipThreshold = Math.ceil(customersByRevenue.length * 0.1);
    const vipCustomers = customersByRevenue.slice(0, vipThreshold);

    // Calculate average sessions per customer
    const avgSessionsPerCustomer = totalCustomers > 0
      ? sessions.length / totalCustomers
      : 0;

    // Calculate average days between sessions for repeat customers
    let avgDaysBetweenSessions = 0;
    if (repeatCustomers.length > 0) {
      const daysBetweenSessions: number[] = [];
      repeatCustomers.forEach(customer => {
        const sortedSessions = customer.sessions
          .map(s => new Date(s.createdAt))
          .sort((a, b) => a.getTime() - b.getTime());
        
        for (let i = 1; i < sortedSessions.length; i++) {
          const days = (sortedSessions[i].getTime() - sortedSessions[i - 1].getTime()) / (1000 * 60 * 60 * 24);
          daysBetweenSessions.push(days);
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
          single: Array.from(customerMap.values()).filter(c => c.sessionCount === 1).length,
          repeat: repeatCustomers.length,
          frequent: Array.from(customerMap.values()).filter(c => c.sessionCount >= 5).length
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

