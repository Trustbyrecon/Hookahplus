import { NextRequest, NextResponse } from 'next/server';

// Simplified approach - use fallback data for now
// This avoids webpack module issues in production
const useFallbackData = true;

export async function GET(request: NextRequest) {
  try {
    // Check for demo mode or Alpha Stability mode
    const { searchParams } = new URL(request.url);
    const isDemoMode = searchParams.get('mode') === 'demo' || searchParams.get('isDemo') === 'true';
    const alphaStabilityMode = process.env.ALPHA_STABILITY_MODE === 'true' || 
                                searchParams.get('alphaStability') === 'true' ||
                                searchParams.get('metricsEnabled') === 'true';
    const firstLightMode = process.env.FIRST_LIGHT_MODE === 'true';
    
    // In Alpha Stability mode, use real metrics from database
    // In First Light mode, use fallback data (metrics not required)
    const useRealMetrics = alphaStabilityMode && !firstLightMode;
    
    if (isDemoMode) {
      console.log('[metrics/live] Demo mode: Bypassing auth, returning demo metrics');
    } else if (useRealMetrics) {
      console.log('[metrics/live] Alpha Stability mode: Using real metrics from database');
    } else {
      console.log('[metrics/live] First Light mode: Using fallback data (metrics not required)');
    }
    
    // Get current timestamp for calculations
    const now = new Date();
    
    let activeSessions: any[] = [];
    let alerts = 0;
    let staffAssigned = 0;
    let totalSessionsToday = 0;
    
    // In Alpha Stability mode, calculate real metrics from database
    if (useRealMetrics) {
      try {
        const { prisma } = await import('../../../../lib/db');
        
        // Get active sessions from database
        const dbSessions = await prisma.session.findMany({
          where: {
            state: {
              in: ['PENDING', 'ACTIVE', 'PAUSED']
            }
          },
          select: {
            id: true,
            priceCents: true,
            startedAt: true,
            assignedBOHId: true,
            assignedFOHId: true,
            edgeCase: true,
            createdAt: true,
          }
        });
        
        activeSessions = dbSessions.map(s => ({
          priceCents: s.priceCents || 0,
          startedAt: s.startedAt,
          assignedBOHId: s.assignedBOHId,
          assignedFOHId: s.assignedFOHId
        }));
        
        // Count alerts (sessions with edge cases)
        alerts = dbSessions.filter(s => s.edgeCase !== null).length;
        
        // Count unique staff assigned
        const staffIds = new Set([
          ...dbSessions.map(s => s.assignedBOHId).filter(Boolean),
          ...dbSessions.map(s => s.assignedFOHId).filter(Boolean)
        ]);
        staffAssigned = staffIds.size;
        
        // Count sessions created today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        totalSessionsToday = await prisma.session.count({
          where: {
            createdAt: {
              gte: todayStart
            }
          }
        });
        
        console.log('[metrics/live] ✅ Calculated real metrics from database:', {
          activeSessions: activeSessions.length,
          alerts,
          staffAssigned,
          totalSessionsToday
        });
      } catch (dbError: any) {
        console.error('[metrics/live] Failed to calculate real metrics, using fallback:', dbError?.message);
        // Fall back to default values if database query fails
        activeSessions = [];
        alerts = 0;
        staffAssigned = 0;
        totalSessionsToday = 0;
      }
    } else {
      // First Light mode: Use fallback data
      activeSessions = [
        {
          priceCents: 3500,
          startedAt: new Date(Date.now() - 30 * 60 * 1000),
          assignedBOHId: 'staff-1',
          assignedFOHId: 'staff-2'
        }
      ];
      alerts = 0;
      staffAssigned = 2;
      totalSessionsToday = 1;
    }

    // Calculate metrics
    const activeSessionCount = activeSessions.length;
    
    // Calculate revenue from active sessions
    const revenue = activeSessions.reduce((sum, session) => {
      return sum + (session.priceCents || 0);
    }, 0);

    // Calculate average duration for active sessions
    const sessionsWithDuration = activeSessions.filter(s => s.startedAt);
    const avgDuration = sessionsWithDuration.length > 0 
      ? sessionsWithDuration.reduce((sum, session) => {
          const duration = Math.floor((now.getTime() - session.startedAt!.getTime()) / (1000 * 60)); // minutes
          return sum + duration;
        }, 0) / sessionsWithDuration.length
      : 0;

    // Calculate percentage changes (mock for now - would need historical data)
    const metrics = {
      activeSessions: activeSessionCount,
      revenue: Math.round(revenue / 100), // Convert cents to dollars
      avgDuration: Math.round(avgDuration),
      alerts,
      staffAssigned,
      totalSessions: totalSessionsToday,
      // Percentage changes (would need historical data for real calculations)
      changes: {
        activeSessions: activeSessionCount > 0 ? '+12%' : '0%',
        revenue: revenue > 0 ? '+8%' : '0%',
        avgDuration: avgDuration > 0 ? '-5%' : '0%',
        alerts: alerts > 0 ? '+2%' : '0%',
        staffAssigned: staffAssigned > 0 ? '+2%' : '0%',
        totalSessions: totalSessionsToday > 0 ? '+15%' : '0%'
      }
    };

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching live metrics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch metrics',
      metrics: {
        activeSessions: 0,
        revenue: 0,
        avgDuration: 0,
        alerts: 0,
        staffAssigned: 0,
        totalSessions: 0,
        changes: {
          activeSessions: '0%',
          revenue: '0%',
          avgDuration: '0%',
          alerts: '0%',
          staffAssigned: '0%',
          totalSessions: '0%'
        }
      }
    }, { status: 500 });
  }
}
