// app/api/analytics/floor-health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions } from '@/lib/sessionState';

interface FloorHealthMetrics {
  activeSessions: number;
  averageRemainingTime: number;
  refillRequestsPending: number;
  revenueRunRate: number;
  tableUtilization: number;
  staffEfficiency: number;
  customerSatisfaction: number;
  alerts: string[];
}

export async function GET(request: NextRequest) {
  try {
    const allSessions = getAllSessions();
    const now = Date.now();
    
    // Calculate active sessions
    const activeSessions = allSessions.filter(session => 
      ['ACTIVE', 'PREP_IN_PROGRESS', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(session.state)
    );

    // Calculate average remaining time
    const sessionsWithTime = activeSessions.filter(session => session.estimatedEndTime);
    const averageRemainingTime = sessionsWithTime.length > 0 
      ? sessionsWithTime.reduce((sum, session) => {
          const remaining = Math.max(0, session.estimatedEndTime - now);
          return sum + remaining;
        }, 0) / sessionsWithTime.length / (60 * 1000) // Convert to minutes
      : 0;

    // Calculate refill requests pending
    const refillRequestsPending = activeSessions.reduce((sum, session) => {
      return sum + (session.refillRequests?.filter(req => req.status === 'pending').length || 0);
    }, 0);

    // Calculate revenue run rate (last hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentSessions = allSessions.filter(session => 
      session.createdAt > oneHourAgo && session.amount
    );
    const revenueRunRate = recentSessions.reduce((sum, session) => sum + (session.amount || 0), 0) / 100; // Convert to dollars

    // Calculate table utilization
    const totalTables = 10; // Assuming 10 tables
    const tableUtilization = (activeSessions.length / totalTables) * 100;

    // Calculate staff efficiency (refill response time)
    const refillRequests = activeSessions.flatMap(session => 
      session.refillRequests?.map(req => ({
        ...req,
        responseTime: req.completedAt ? req.completedAt - req.requestedAt : null
      })) || []
    );
    
    const completedRefills = refillRequests.filter(req => req.responseTime !== null);
    const averageResponseTime = completedRefills.length > 0
      ? completedRefills.reduce((sum, req) => sum + req.responseTime, 0) / completedRefills.length / (60 * 1000) // Convert to minutes
      : 0;

    const staffEfficiency = Math.max(0, 100 - (averageResponseTime * 20)); // 5-minute target = 100% efficiency

    // Calculate customer satisfaction (based on extensions and refill success)
    const sessionsWithExtensions = activeSessions.filter(session => session.extensions > 0);
    const extensionRate = activeSessions.length > 0 ? (sessionsWithExtensions.length / activeSessions.length) * 100 : 0;
    
    const successfulRefills = completedRefills.filter(req => req.responseTime < (5 * 60 * 1000)); // 5-minute SLA
    const refillSuccessRate = completedRefills.length > 0 ? (successfulRefills.length / completedRefills.length) * 100 : 100;
    
    const customerSatisfaction = (extensionRate + refillSuccessRate) / 2;

    // Generate alerts
    const alerts: string[] = [];
    
    if (refillRequestsPending > 3) {
      alerts.push(`High refill queue: ${refillRequestsPending} pending requests`);
    }
    
    if (averageResponseTime > 7) {
      alerts.push(`Slow refill response: ${averageResponseTime.toFixed(1)} minutes average`);
    }
    
    if (tableUtilization > 90) {
      alerts.push(`High table utilization: ${tableUtilization.toFixed(1)}%`);
    }
    
    if (customerSatisfaction < 70) {
      alerts.push(`Low customer satisfaction: ${customerSatisfaction.toFixed(1)}%`);
    }

    const floorHealth: FloorHealthMetrics = {
      activeSessions: activeSessions.length,
      averageRemainingTime: Math.round(averageRemainingTime),
      refillRequestsPending,
      revenueRunRate: Math.round(revenueRunRate * 100) / 100,
      tableUtilization: Math.round(tableUtilization * 10) / 10,
      staffEfficiency: Math.round(staffEfficiency * 10) / 10,
      customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
      alerts
    };

    return NextResponse.json({
      success: true,
      floorHealth,
      timestamp: new Date().toISOString(),
      generatedAt: now
    });

  } catch (error: any) {
    console.error('Floor health analytics error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate floor health metrics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
