import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '../../../../lib/monitoring/performanceMonitor';

/**
 * GET /api/monitoring/performance
 * Get performance monitoring statistics
 */
export async function GET(request: NextRequest) {
  try {
    const timeWindowParam = request.nextUrl.searchParams.get('timeWindow');
    const timeWindowMinutes = timeWindowParam ? parseInt(timeWindowParam, 10) : 5;

    if (isNaN(timeWindowMinutes) || timeWindowMinutes < 1 || timeWindowMinutes > 60) {
      return NextResponse.json(
        { error: 'timeWindow must be between 1 and 60 minutes' },
        { status: 400 }
      );
    }

    const apiStats = performanceMonitor.getApiStats(timeWindowMinutes);
    const dbStats = performanceMonitor.getDatabaseStats(timeWindowMinutes);

    return NextResponse.json({
      success: true,
      timeWindowMinutes,
      timestamp: new Date().toISOString(),
      api: apiStats,
      database: dbStats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get performance statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

