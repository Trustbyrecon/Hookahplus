import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TableAnalyticsService } from '../../../../lib/services/TableAnalyticsService';

const prisma = new PrismaClient();

/**
 * GET /api/lounges/analytics
 * Get table-level analytics including utilization, revenue, and zone metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d';
    const metric = searchParams.get('metric') || 'revenue'; // revenue | utilization | sessions

    // Calculate date range
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '24h':
        start.setHours(start.getHours() - 24);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Load layout
    const layoutSetting = await prisma.orgSetting.findUnique({
      where: { key: 'lounge_layout' }
    });

    if (!layoutSetting) {
      return NextResponse.json({
        tables: [],
        zones: [],
        heatMap: [],
        error: 'No lounge layout configured'
      });
    }

    const layoutData = JSON.parse(layoutSetting.value);
    const tables = layoutData.tables || [];

    // Load sessions in date range
    const sessions = await prisma.session.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        id: true,
        tableId: true,
        priceCents: true,
        startedAt: true,
        endedAt: true,
        durationSecs: true,
        state: true,
        createdAt: true
      }
    });

    // Calculate table metrics
    const tableMetrics = tables.map((table: any) => {
      return TableAnalyticsService.calculateTableMetrics(
        {
          id: table.id,
          name: table.name,
          zone: table.zone || 'Main',
          capacity: table.capacity || 4
        },
        sessions,
        { start, end }
      );
    });

    // Calculate zone metrics
    const zoneMetrics = TableAnalyticsService.calculateZoneMetrics(
      tables.map((t: any) => ({
        id: t.id,
        name: t.name,
        zone: t.zone || 'Main',
        capacity: t.capacity || 4
      })),
      tableMetrics
    );

    // Generate heat map data
    const heatMapData = TableAnalyticsService.generateHeatMapData(
      tables.map((t: any) => ({
        id: t.id,
        name: t.name,
        x: t.coordinates?.x || t.x || 50,
        y: t.coordinates?.y || t.y || 50,
        zone: t.zone || 'Main'
      })),
      tableMetrics,
      metric as 'revenue' | 'utilization' | 'sessions'
    );

    // Get time-based heat map (peak hours)
    const timeBasedHeatMap = TableAnalyticsService.getTimeBasedHeatMap(
      sessions,
      tables.map((t: any) => ({
        id: t.id,
        name: t.name,
        x: t.coordinates?.x || t.x || 50,
        y: t.coordinates?.y || t.y || 50
      }))
    );

    return NextResponse.json({
      success: true,
      timeRange,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      tables: tableMetrics,
      zones: zoneMetrics,
      heatMap: heatMapData,
      timeBasedHeatMap,
      summary: {
        totalTables: tables.length,
        totalRevenue: tableMetrics.reduce((sum, m) => sum + m.totalRevenue, 0),
        totalSessions: tableMetrics.reduce((sum, m) => sum + m.totalSessions, 0),
        averageUtilization: tableMetrics.length > 0
          ? tableMetrics.reduce((sum, m) => sum + m.utilizationPercent, 0) / tableMetrics.length
          : 0,
        averageSessionValue: tableMetrics.length > 0
          ? tableMetrics.reduce((sum, m) => sum + m.averageSessionValue, 0) / tableMetrics.length
          : 0
      }
    });

  } catch (error) {
    console.error('[Lounge Analytics API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}




