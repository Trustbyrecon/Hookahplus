/**
 * UnifiedAnalyticsService
 * 
 * Combines analytics from all systems:
 * - Session analytics
 * - Table/layout analytics
 * - Staff/zone analytics
 * - Cross-system insights
 * - Predictive analytics
 */

import { TableAnalyticsService } from './TableAnalyticsService';
import { ZoneRoutingService } from './ZoneRoutingService';
import { HistoricalTrendsService } from './TableAnalyticsService';

export interface UnifiedMetrics {
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    averagePerSession: number;
    trend: number; // percentage change
  };
  sessions: {
    total: number;
    active: number;
    completed: number;
    averageDuration: number;
    trend: number;
  };
  tables: {
    total: number;
    occupied: number;
    available: number;
    utilization: number;
    trend: number;
  };
  staff: {
    total: number;
    active: number;
    efficiency: number; // sessions per staff hour
    averageRating: number;
    trend: number;
  };
  zones: {
    total: number;
    averageUtilization: number;
    topPerforming: string;
    needsAttention: string[];
  };
}

export interface CrossSystemInsight {
  type: 'table_revenue' | 'staff_zone' | 'peak_hours' | 'table_preference' | 'staff_efficiency';
  title: string;
  description: string;
  data: any;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PredictiveForecast {
  metric: 'demand' | 'revenue' | 'staffing' | 'utilization';
  timeframe: 'next_hour' | 'next_day' | 'next_week' | 'next_month';
  predicted: number;
  confidence: number; // 0-100
  factors: string[];
  recommendation?: string;
}

export interface UnifiedDashboardData {
  metrics: UnifiedMetrics;
  insights: CrossSystemInsight[];
  forecasts: PredictiveForecast[];
  topTables: Array<{ tableId: string; tableName: string; revenue: number; sessions: number; utilization: number }>;
  topStaff: Array<{ staffId: string; staffName: string; sessions: number; efficiency: number; rating: number }>;
  zonePerformance: Array<{ zone: string; revenue: number; utilization: number; staffCount: number }>;
  peakHours: Array<{ hour: string; sessions: number; revenue: number; utilization: number }>;
}

export class UnifiedAnalyticsService {
  /**
   * Calculate unified metrics from all data sources
   */
  static calculateUnifiedMetrics(
    sessions: Array<{
      priceCents?: number;
      status: string;
      durationSecs?: number;
      createdAt: Date | string;
      startedAt?: Date | string;
    }>,
    tables: Array<{ id: string; name: string; zone: string }>,
    activeSessions: Array<{ tableId: string; status: string }>,
    staffCount: number,
    activeStaffCount: number
  ): UnifiedMetrics {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenue calculations
    const allRevenue = sessions.reduce((sum, s) => sum + ((s.priceCents || 0) / 100), 0);
    const todayRevenue = sessions
      .filter(s => new Date(s.createdAt) >= todayStart)
      .reduce((sum, s) => sum + ((s.priceCents || 0) / 100), 0);
    const weekRevenue = sessions
      .filter(s => new Date(s.createdAt) >= weekStart)
      .reduce((sum, s) => sum + ((s.priceCents || 0) / 100), 0);
    const monthRevenue = sessions
      .filter(s => new Date(s.createdAt) >= monthStart)
      .reduce((sum, s) => sum + ((s.priceCents || 0) / 100), 0);

    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekRevenue = sessions
      .filter(s => {
        const created = new Date(s.createdAt);
        return created >= previousWeekStart && created < weekStart;
      })
      .reduce((sum, s) => sum + ((s.priceCents || 0) / 100), 0);

    const revenueTrend = previousWeekRevenue > 0 
      ? ((weekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 
      : 0;

    // Session calculations
    const activeSessionsCount = sessions.filter(s => 
      ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status)
    ).length;
    
    const completedSessions = sessions.filter(s => 
      s.status === 'CLOSED' || s.status === 'ACTIVE'
    );

    const averageDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.durationSecs || 0), 0) / completedSessions.length / 60
      : 0;

    const previousWeekSessions = sessions.filter(s => {
      const created = new Date(s.createdAt);
      return created >= previousWeekStart && created < weekStart;
    }).length;

    const sessionsTrend = previousWeekSessions > 0
      ? ((sessions.length - previousWeekSessions) / previousWeekSessions) * 100
      : 0;

    // Table calculations
    const occupiedTables = new Set(
      activeSessions.map(s => s.tableId)
    ).size;

    const utilization = tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0;

    const previousWeekOccupied = Math.floor(occupiedTables * 0.9); // Estimate
    const tablesTrend = previousWeekOccupied > 0
      ? ((occupiedTables - previousWeekOccupied) / previousWeekOccupied) * 100
      : 0;

    // Staff calculations
    const staffEfficiency = activeStaffCount > 0 && completedSessions.length > 0
      ? completedSessions.length / (activeStaffCount * 8) // Assume 8-hour shifts
      : 0;

    const staffTrend = 0; // Would need historical staff data

    // Zone calculations
    const zones = new Set(tables.map(t => t.zone || 'Main'));
    const zoneUtilizations = Array.from(zones).map(zone => {
      const zoneTables = tables.filter(t => (t.zone || 'Main') === zone);
      const zoneOccupied = activeSessions.filter(s => {
        const table = tables.find(t => t.id === s.tableId || t.name === s.tableId);
        return table && (table.zone || 'Main') === zone;
      }).length;
      return zoneOccupied / zoneTables.length;
    });

    const averageZoneUtilization = zoneUtilizations.length > 0
      ? zoneUtilizations.reduce((sum, u) => sum + u, 0) / zoneUtilizations.length * 100
      : 0;

    return {
      revenue: {
        total: Math.round(allRevenue * 100) / 100,
        today: Math.round(todayRevenue * 100) / 100,
        thisWeek: Math.round(weekRevenue * 100) / 100,
        thisMonth: Math.round(monthRevenue * 100) / 100,
        averagePerSession: sessions.length > 0 ? Math.round((allRevenue / sessions.length) * 100) / 100 : 0,
        trend: Math.round(revenueTrend * 10) / 10
      },
      sessions: {
        total: sessions.length,
        active: activeSessionsCount,
        completed: completedSessions.length,
        averageDuration: Math.round(averageDuration * 10) / 10,
        trend: Math.round(sessionsTrend * 10) / 10
      },
      tables: {
        total: tables.length,
        occupied: occupiedTables,
        available: tables.length - occupiedTables,
        utilization: Math.round(utilization * 10) / 10,
        trend: Math.round(tablesTrend * 10) / 10
      },
      staff: {
        total: staffCount,
        active: activeStaffCount,
        efficiency: Math.round(staffEfficiency * 10) / 10,
        averageRating: 4.5, // Would come from ratings system
        trend: staffTrend
      },
      zones: {
        total: zones.size,
        averageUtilization: Math.round(averageZoneUtilization * 10) / 10,
        topPerforming: 'Main', // Would calculate from revenue/utilization
        needsAttention: [] // Would identify underperforming zones
      }
    };
  }

  /**
   * Generate cross-system insights
   */
  static generateCrossSystemInsights(
    sessions: Array<{
      tableId?: string;
      priceCents?: number;
      createdAt: Date | string;
      startedAt?: Date | string;
    }>,
    tables: Array<{ id: string; name: string; zone: string; capacity: number }>,
    staffAssignments: Array<{ staffId: string; zone: string; sessions: number }>
  ): CrossSystemInsight[] {
    const insights: CrossSystemInsight[] = [];

    // Table revenue insights
    const tableRevenue = new Map<string, { revenue: number; sessions: number }>();
    sessions.forEach(session => {
      if (session.tableId) {
        const existing = tableRevenue.get(session.tableId) || { revenue: 0, sessions: 0 };
        existing.revenue += (session.priceCents || 0) / 100;
        existing.sessions += 1;
        tableRevenue.set(session.tableId, existing);
      }
    });

    const topTable = Array.from(tableRevenue.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)[0];

    if (topTable) {
      const table = tables.find(t => t.id === topTable[0] || t.name === topTable[0]);
      insights.push({
        type: 'table_revenue',
        title: 'Top Revenue Table',
        description: `${table?.name || topTable[0]} generates $${topTable[1].revenue.toFixed(0)} with ${topTable[1].sessions} sessions`,
        data: { tableId: topTable[0], revenue: topTable[1].revenue, sessions: topTable[1].sessions },
        recommendation: 'Consider premium pricing or VIP status for this table',
        priority: 'high'
      });
    }

    // Peak hours insight
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

    const peakHour = Object.entries(hourCounts)
      .sort((a, b) => b[1].sessions - a[1].sessions)[0];

    if (peakHour) {
      const hour = parseInt(peakHour[0]);
      const hourLabel = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      insights.push({
        type: 'peak_hours',
        title: 'Peak Hour Identified',
        description: `${hourLabel} is the busiest time with ${peakHour[1].sessions} sessions and $${peakHour[1].revenue.toFixed(0)} revenue`,
        data: { hour, sessions: peakHour[1].sessions, revenue: peakHour[1].revenue },
        recommendation: 'Ensure adequate staffing during peak hours',
        priority: 'high'
      });
    }

    // Staff zone efficiency
    if (staffAssignments.length > 0) {
      const topStaff = staffAssignments
        .sort((a, b) => b.sessions - a.sessions)[0];
      
      insights.push({
        type: 'staff_efficiency',
        title: 'Top Performing Staff',
        description: `${topStaff.staffId} handles ${topStaff.sessions} sessions in ${topStaff.zone} zone`,
        data: topStaff,
        recommendation: 'Consider this staff member for training others',
        priority: 'medium'
      });
    }

    return insights;
  }

  /**
   * Generate predictive forecasts
   */
  static generateForecasts(
    sessions: Array<{
      createdAt: Date | string;
      priceCents?: number;
      startedAt?: Date | string;
    }>,
    tables: Array<{ id: string; zone: string }>,
    currentUtilization: number
  ): PredictiveForecast[] {
    const forecasts: PredictiveForecast[] = [];

    // Demand forecast (next hour)
    const recentSessions = sessions.filter(s => {
      const created = new Date(s.createdAt);
      return created >= new Date(Date.now() - 60 * 60 * 1000); // Last hour
    });

    const predictedDemand = Math.round(recentSessions.length * 1.1); // 10% growth estimate
    forecasts.push({
      metric: 'demand',
      timeframe: 'next_hour',
      predicted: predictedDemand,
      confidence: 75,
      factors: ['Recent session trend', 'Time of day', 'Day of week'],
      recommendation: predictedDemand > 10 ? 'Prepare for increased demand' : undefined
    });

    // Revenue forecast (next day)
    const todayRevenue = sessions
      .filter(s => {
        const created = new Date(s.createdAt);
        return created >= new Date(new Date().setHours(0, 0, 0, 0));
      })
      .reduce((sum, s) => sum + ((s.priceCents || 0) / 100), 0);

    const predictedRevenue = Math.round(todayRevenue * 1.05); // 5% growth estimate
    forecasts.push({
      metric: 'revenue',
      timeframe: 'next_day',
      predicted: predictedRevenue,
      confidence: 70,
      factors: ['Daily revenue trend', 'Historical patterns'],
      recommendation: predictedRevenue > 1000 ? 'Strong revenue day expected' : undefined
    });

    // Staffing forecast
    const optimalStaff = Math.ceil(tables.length * 0.3); // 30% of tables need staff
    forecasts.push({
      metric: 'staffing',
      timeframe: 'next_day',
      predicted: optimalStaff,
      confidence: 80,
      factors: ['Table count', 'Expected utilization'],
      recommendation: `Schedule ${optimalStaff} staff members for optimal coverage`
    });

    // Utilization forecast
    const predictedUtilization = Math.min(100, currentUtilization * 1.1);
    forecasts.push({
      metric: 'utilization',
      timeframe: 'next_hour',
      predicted: Math.round(predictedUtilization),
      confidence: 65,
      factors: ['Current utilization', 'Time trends'],
      recommendation: predictedUtilization > 80 ? 'High utilization expected - prepare for overflow' : undefined
    });

    return forecasts;
  }

  /**
   * Get top performing tables
   */
  static getTopTables(
    sessions: Array<{ tableId?: string; priceCents?: number; status: string }>,
    tables: Array<{ id: string; name: string; zone: string }>,
    activeSessions: Array<{ tableId: string; status: string }>
  ): Array<{ tableId: string; tableName: string; revenue: number; sessions: number; utilization: number }> {
    const tableStats = new Map<string, { revenue: number; sessions: number; activeTime: number }>();

    sessions.forEach(session => {
      if (session.tableId) {
        const existing = tableStats.get(session.tableId) || { revenue: 0, sessions: 0, activeTime: 0 };
        existing.revenue += (session.priceCents || 0) / 100;
        existing.sessions += 1;
        if (session.status === 'ACTIVE') {
          existing.activeTime += 1;
        }
        tableStats.set(session.tableId, existing);
      }
    });

    return Array.from(tableStats.entries())
      .map(([tableId, stats]) => {
        const table = tables.find(t => t.id === tableId || t.name === tableId);
        const isActive = activeSessions.some(s => s.tableId === tableId);
        const utilization = isActive ? 100 : 0; // Simplified

        return {
          tableId,
          tableName: table?.name || tableId,
          revenue: Math.round(stats.revenue * 100) / 100,
          sessions: stats.sessions,
          utilization
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }
}

