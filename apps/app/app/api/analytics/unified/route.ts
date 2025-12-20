import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UnifiedAnalyticsService } from '../../../../lib/services/UnifiedAnalyticsService';
import { TableLayoutService } from '../../../../lib/services/TableLayoutService';
import { ZoneRoutingService } from '../../../../lib/services/ZoneRoutingService';

const prisma = new PrismaClient();

/**
 * GET /api/analytics/unified
 * Get unified analytics combining all systems
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d';
    
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

    // Get sessions
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
        state: true,
        durationSecs: true,
        createdAt: true,
        startedAt: true,
        assignedBOHId: true,
        assignedFOHId: true
      }
    });

    // Filter out sessions with null tableId
    const sessions = allSessions
      .filter((s): s is typeof s & { tableId: string } => s.tableId !== null)
      .map(s => ({
        id: s.id,
        tableId: s.tableId,
        priceCents: s.priceCents ?? undefined,
        status: s.state,
        durationSecs: s.durationSecs ?? undefined,
        createdAt: s.createdAt,
        startedAt: s.startedAt ?? undefined,
        assignedStaff: {
          boh: s.assignedBOHId || undefined,
          foh: s.assignedFOHId || undefined
        }
      }));

    // Get active sessions
    const activeSessions = await prisma.session.findMany({
      where: {
        state: { notIn: ['CLOSED', 'CANCELED'] as any }
      },
      select: {
        id: true,
        tableId: true,
        state: true
      }
    });

    // Get tables from layout
    const tables = await TableLayoutService.loadTables();

    // Get staff assignments (simplified - extract from sessions)
    const staffMap = new Map<string, { zone: string; sessions: number }>();
    sessions.forEach(session => {
      if (session.tableId) {
        const table = tables.find(t => t.id === session.tableId || t.name === session.tableId);
        const zone = table?.zone || 'Main';
        
        if (session.assignedStaff?.foh) {
          const existing = staffMap.get(session.assignedStaff.foh) || { zone, sessions: 0 };
          existing.sessions += 1;
          staffMap.set(session.assignedStaff.foh, existing);
        }
      }
    });

    const staffAssignments = Array.from(staffMap.entries()).map(([staffId, data]) => ({
      staffId,
      zone: data.zone,
      sessions: data.sessions
    }));

    // Calculate unified metrics
    const metrics = UnifiedAnalyticsService.calculateUnifiedMetrics(
      sessions.map(s => ({
        priceCents: s.priceCents,
        status: s.status,
        durationSecs: s.durationSecs,
        createdAt: s.createdAt,
        startedAt: s.startedAt
      })),
      tables,
      activeSessions.map(s => ({
        tableId: s.tableId || '',
        status: s.state
      })),
      staffAssignments.length,
      staffAssignments.length // Simplified - would need actual staff count
    );

    // Generate insights
    const insights = UnifiedAnalyticsService.generateCrossSystemInsights(
      sessions.map(s => ({
        tableId: s.tableId,
        priceCents: s.priceCents,
        createdAt: s.createdAt,
        startedAt: s.startedAt
      })),
      tables,
      staffAssignments
    );

    // Generate forecasts
    const forecasts = UnifiedAnalyticsService.generateForecasts(
      sessions.map(s => ({
        createdAt: s.createdAt,
        priceCents: s.priceCents,
        startedAt: s.startedAt
      })),
      tables,
      metrics.tables.utilization
    );

    // Get top tables
    const topTables = UnifiedAnalyticsService.getTopTables(
      sessions.map(s => ({
        tableId: s.tableId,
        priceCents: s.priceCents,
        status: s.status
      })),
      tables,
      activeSessions.map(s => ({
        tableId: s.tableId || '',
        status: s.state
      }))
    );

    // Get top staff (simplified)
    const topStaff = staffAssignments
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10)
      .map(s => ({
        staffId: s.staffId,
        staffName: s.staffId, // Would resolve from staff table
        sessions: s.sessions,
        efficiency: s.sessions / 8, // Simplified
        rating: 4.5 // Would come from ratings
      }));

    // Get zone performance
    const zoneMap = new Map<string, { revenue: number; sessions: number; staffCount: number }>();
    sessions.forEach(session => {
      if (session.tableId) {
        const table = tables.find(t => t.id === session.tableId || t.name === session.tableId);
        const zone = table?.zone || 'Main';
        const existing = zoneMap.get(zone) || { revenue: 0, sessions: 0, staffCount: 0 };
        existing.revenue += (session.priceCents || 0) / 100;
        existing.sessions += 1;
        zoneMap.set(zone, existing);
      }
    });

    staffAssignments.forEach(staff => {
      const existing = zoneMap.get(staff.zone);
      if (existing) {
        existing.staffCount += 1;
      }
    });

    const zonePerformance = Array.from(zoneMap.entries()).map(([zone, data]) => {
      const zoneTables = tables.filter(t => (t.zone || 'Main') === zone);
      const zoneActive = activeSessions.filter(s => {
        const table = tables.find(t => t.id === s.tableId || t.name === s.tableId);
        return table && (table.zone || 'Main') === zone;
      }).length;
      const utilization = zoneTables.length > 0 ? (zoneActive / zoneTables.length) * 100 : 0;

      return {
        zone,
        revenue: Math.round(data.revenue * 100) / 100,
        utilization: Math.round(utilization * 10) / 10,
        staffCount: data.staffCount
      };
    });

    // Get peak hours
    const hourCounts: Record<number, { sessions: number; revenue: number }> = {};
    sessions.forEach(session => {
      if (session.startedAt) {
        const hour = new Date(session.startedAt).getHours();
        const existing = hourCounts[hour] || { sessions: 0, revenue: 0 };
        existing.sessions += 1;
        existing.revenue += (session.priceCents || 0) / 100;
        hourCounts[hour] = existing;
      }
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hourStr, data]) => {
        const hour = parseInt(hourStr);
        const hourLabel = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
        const zoneTables = tables.length;
        const utilization = zoneTables > 0 ? (data.sessions / zoneTables) * 100 : 0;

        return {
          hour: hourLabel,
          sessions: data.sessions,
          revenue: Math.round(data.revenue * 100) / 100,
          utilization: Math.round(utilization * 10) / 10
        };
      })
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      timeRange,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      metrics,
      insights,
      forecasts,
      topTables,
      topStaff,
      zonePerformance,
      peakHours
    });

  } catch (error) {
    console.error('[Unified Analytics API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch unified analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

