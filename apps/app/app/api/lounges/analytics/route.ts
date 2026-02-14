import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TableAnalyticsService } from '../../../../lib/services/TableAnalyticsService';
import { HistoricalTrendsService } from '../../../../lib/services/TableAnalyticsService';
import { cache, CacheService } from '../../../../lib/cache';

const prisma = new PrismaClient();

// Cache TTLs
const ANALYTICS_CACHE_TTL = 45; // 45 seconds - analytics can be slightly stale

/**
 * GET /api/lounges/analytics
 * Get table-level analytics including utilization, revenue, and zone metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d';
    const metric = searchParams.get('metric') || 'revenue'; // revenue | utilization | sessions

    // Generate cache key
    const cacheKey = CacheService.generateKey('lounge-analytics', {
      timeRange,
      metric
    });

    // Check cache
    const cached = cache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

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
    let layoutSetting;
    try {
      layoutSetting = await prisma.orgSetting.findUnique({
        where: { key: 'lounge_layout' }
      });
    } catch (error) {
      console.error('[Analytics API] Error loading layout:', error);
      // Return 200 with empty data for missing layout (not a server error)
      return NextResponse.json({
        success: true,
        tables: [],
        zones: [],
        heatMap: [],
        timeBasedHeatMap: [],
        summary: {
          totalTables: 0,
          totalRevenue: 0,
          totalSessions: 0,
          averageUtilization: 0,
          averageSessionValue: 0
        },
        trends: {
          peakHours: [],
          dayOfWeek: [],
          daily: [],
          weekOverWeek: null
        },
        error: 'No lounge layout configured'
      });
    }

    if (!layoutSetting) {
      return NextResponse.json({
        success: true,
        tables: [],
        zones: [],
        heatMap: [],
        timeBasedHeatMap: [],
        summary: {
          totalTables: 0,
          totalRevenue: 0,
          totalSessions: 0,
          averageUtilization: 0,
          averageSessionValue: 0
        },
        trends: {
          peakHours: [],
          dayOfWeek: [],
          daily: [],
          weekOverWeek: null
        }
      });
    }

    let layoutData;
    let tables: any[] = [];
    
    try {
      layoutData = JSON.parse(layoutSetting.value);
      tables = layoutData.tables || [];
    } catch (error) {
      console.error('[Analytics API] Error parsing layout data:', error);
      return NextResponse.json({
        success: false,
        tables: [],
        zones: [],
        heatMap: [],
        error: 'Invalid lounge layout data'
      }, { status: 500 });
    }

    // Load sessions in date range
    const allSessions = await prisma.session.findMany({
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

    // Filter out sessions with null tableId and transform null values to undefined
    // This matches the expected types for TableAnalyticsService methods
    const sessions = allSessions
      .filter((s): s is typeof s & { tableId: string } => s.tableId !== null)
      .map(s => ({
        id: s.id,
        tableId: s.tableId,
        priceCents: s.priceCents ?? undefined,
        startedAt: s.startedAt ?? undefined,
        endedAt: s.endedAt ?? undefined,
        durationSecs: s.durationSecs ?? undefined,
        state: s.state,
        createdAt: s.createdAt
      }));

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
    let heatMapData: any[] = [];
    let timeBasedHeatMap: any[] = [];
    let peakHours: any[] = [];
    let dayOfWeekTrends: any[] = [];
    let dailyTrends: any[] = [];
    let weekOverWeek: any = null;

    try {
      heatMapData = TableAnalyticsService.generateHeatMapData(
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
      timeBasedHeatMap = TableAnalyticsService.getTimeBasedHeatMap(
        sessions,
        tables.map((t: any) => ({
          id: t.id,
          name: t.name,
          x: t.coordinates?.x || t.x || 50,
          y: t.coordinates?.y || t.y || 50
        }))
      );

      // Calculate historical trends
      const operatingHoursPerDay = 12;
      const totalHoursAvailablePerDay = tables.length * operatingHoursPerDay;
      
      // Peak hours analysis
      peakHours = HistoricalTrendsService.identifyPeakHours(sessions, tables.length);
      
      // Day of week trends
      dayOfWeekTrends = HistoricalTrendsService.calculateDayOfWeekTrends(
        sessions,
        totalHoursAvailablePerDay
      );
      
      // Daily trends
      dailyTrends = HistoricalTrendsService.calculateDailyTrends(
        sessions,
        start,
        end,
        totalHoursAvailablePerDay
      );

      // Week-over-week comparison (if we have enough data)
      if (timeRange === '7d' || timeRange === '30d') {
        try {
          const previousStart = new Date(start);
          previousStart.setDate(previousStart.getDate() - (timeRange === '7d' ? 7 : 30));
          const previousEnd = new Date(start);

          const previousSessions = await prisma.session.findMany({
            where: {
              createdAt: {
                gte: previousStart,
                lte: previousEnd
              }
            },
            select: {
              priceCents: true,
              durationSecs: true,
              createdAt: true
            }
          });

          weekOverWeek = HistoricalTrendsService.calculateWeekOverWeek(
            sessions.map(s => ({
              createdAt: s.createdAt,
              priceCents: s.priceCents ?? undefined,
              durationSecs: s.durationSecs ?? undefined
            })),
            previousSessions.map(s => ({
              createdAt: s.createdAt,
              priceCents: s.priceCents ?? undefined,
              durationSecs: s.durationSecs ?? undefined
            })),
            tables.length * operatingHoursPerDay * Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          );
        } catch (error) {
          console.error('[Analytics API] Error calculating week-over-week:', error);
          // Continue without week-over-week data
          weekOverWeek = null;
        }
      }
    } catch (error) {
      console.error('[Analytics API] Error generating heat map or trends:', error);
      // Set defaults
      heatMapData = [];
      timeBasedHeatMap = [];
      peakHours = [];
      dayOfWeekTrends = [];
      dailyTrends = [];
      weekOverWeek = null;
    }

    try {
      const responseData = {
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
          totalRevenue: tableMetrics.reduce((sum: number, m: any) => sum + m.totalRevenue, 0),
          totalSessions: tableMetrics.reduce((sum: number, m: any) => sum + m.totalSessions, 0),
          averageUtilization: tableMetrics.length > 0
            ? tableMetrics.reduce((sum: number, m: any) => sum + m.utilizationPercent, 0) / tableMetrics.length
            : 0,
          averageSessionValue: tableMetrics.length > 0
            ? tableMetrics.reduce((sum: number, m: any) => sum + m.averageSessionValue, 0) / tableMetrics.length
            : 0
        },
        trends: {
          peakHours: peakHours.slice(0, 10), // Top 10 peak hours
          dayOfWeek: dayOfWeekTrends,
          daily: dailyTrends,
          weekOverWeek
        }
      };

      // Cache the response
      cache.set(cacheKey, responseData, ANALYTICS_CACHE_TTL);

      return NextResponse.json(responseData);
    } catch (error) {
      console.error('[Analytics API] Error generating response:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

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




