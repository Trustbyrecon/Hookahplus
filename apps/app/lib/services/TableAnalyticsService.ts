/**
 * TableAnalyticsService
 * 
 * Service for calculating table-level analytics including utilization,
 * revenue, turnover, and zone performance metrics.
 */

export interface TableMetrics {
  tableId: string;
  tableName: string;
  zone: string;
  capacity: number;
  
  // Utilization metrics
  utilizationPercent: number; // Hours occupied / hours available
  totalHoursOccupied: number;
  totalHoursAvailable: number;
  
  // Revenue metrics
  totalRevenue: number; // Total revenue from this table
  revenuePerHour: number; // Revenue per hour of operation
  averageSessionValue: number; // Average revenue per session
  
  // Session metrics
  totalSessions: number;
  averageSessionDuration: number; // In minutes
  turnoverRate: number; // Sessions per day
  peakHour?: string; // Hour with most sessions
  
  // Status
  isCurrentlyOccupied: boolean;
  currentSessionId?: string;
}

export interface ZoneMetrics {
  zone: string;
  totalTables: number;
  totalRevenue: number;
  totalSessions: number;
  averageUtilization: number;
  revenuePerTable: number;
  sessionsPerTable: number;
  averageSessionValue: number;
}

export interface HeatMapData {
  tableId: string;
  tableName: string;
  x: number;
  y: number;
  value: number; // Normalized value (0-1) for color intensity
  metric: 'revenue' | 'utilization' | 'sessions';
  rawValue: number; // Actual value for display
}

export class TableAnalyticsService {
  /**
   * Calculate table metrics from sessions
   */
  static calculateTableMetrics(
    table: { id: string; name: string; zone: string; capacity: number },
    sessions: Array<{
      id: string;
      tableId: string;
      priceCents?: number;
      startedAt?: string | Date;
      endedAt?: string | Date;
      durationSecs?: number;
      state: string;
    }>,
    dateRange: { start: Date; end: Date }
  ): TableMetrics {
    // Filter sessions for this table
    const tableSessions = sessions.filter(s => {
      const sessionTableId = s.tableId;
      return sessionTableId === table.id ||
             sessionTableId === table.name ||
             sessionTableId?.toLowerCase() === table.name.toLowerCase();
    });

    // Calculate total hours available (operating hours per day * days in range)
    const daysInRange = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const operatingHoursPerDay = 12; // Assume 12 hours per day (can be configurable)
    const totalHoursAvailable = daysInRange * operatingHoursPerDay;

    // Calculate total hours occupied
    let totalHoursOccupied = 0;
    const sessionDurations: number[] = [];
    const sessionRevenues: number[] = [];
    const hourCounts: Record<string, number> = {};

    tableSessions.forEach(session => {
      // Calculate session duration
      let durationMinutes = 0;
      
      if (session.durationSecs) {
        durationMinutes = session.durationSecs / 60;
      } else if (session.startedAt && session.endedAt) {
        const start = new Date(session.startedAt);
        const end = new Date(session.endedAt);
        durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      } else if (session.startedAt && session.state === 'ACTIVE') {
        // Active session - use current time
        const start = new Date(session.startedAt);
        const now = new Date();
        durationMinutes = (now.getTime() - start.getTime()) / (1000 * 60);
      } else {
        // Default duration if not available
        durationMinutes = 60; // 1 hour default
      }

      const durationHours = durationMinutes / 60;
      totalHoursOccupied += durationHours;
      sessionDurations.push(durationMinutes);

      // Calculate revenue
      const revenue = (session.priceCents || 0) / 100;
      sessionRevenues.push(revenue);

      // Track peak hour
      if (session.startedAt) {
        const start = new Date(session.startedAt);
        const hour = start.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    // Find peak hour
    const peakHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    // Calculate metrics
    const totalSessions = tableSessions.length;
    const totalRevenue = sessionRevenues.reduce((sum, r) => sum + r, 0);
    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
      : 0;
    const averageSessionValue = sessionRevenues.length > 0
      ? sessionRevenues.reduce((sum, r) => sum + r, 0) / sessionRevenues.length
      : 0;
    const utilizationPercent = totalHoursAvailable > 0
      ? (totalHoursOccupied / totalHoursAvailable) * 100
      : 0;
    const turnoverRate = daysInRange > 0 ? totalSessions / daysInRange : 0;
    const revenuePerHour = totalHoursOccupied > 0 ? totalRevenue / totalHoursOccupied : 0;

    // Check if currently occupied
    const activeSession = tableSessions.find(s => 
      ['ACTIVE', 'PREP_IN_PROGRESS', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAID_CONFIRMED'].includes(s.state)
    );

    return {
      tableId: table.id,
      tableName: table.name,
      zone: table.zone || 'Main',
      capacity: table.capacity,
      utilizationPercent: Math.round(utilizationPercent * 10) / 10,
      totalHoursOccupied: Math.round(totalHoursOccupied * 10) / 10,
      totalHoursAvailable,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenuePerHour: Math.round(revenuePerHour * 100) / 100,
      averageSessionValue: Math.round(averageSessionValue * 100) / 100,
      totalSessions,
      averageSessionDuration: Math.round(averageSessionDuration * 10) / 10,
      turnoverRate: Math.round(turnoverRate * 10) / 10,
      peakHour: peakHour ? `${peakHour}:00` : undefined,
      isCurrentlyOccupied: !!activeSession,
      currentSessionId: activeSession?.id
    };
  }

  /**
   * Calculate zone metrics
   */
  static calculateZoneMetrics(
    tables: Array<{ id: string; name: string; zone: string; capacity: number }>,
    tableMetrics: TableMetrics[]
  ): ZoneMetrics[] {
    const zoneMap = new Map<string, ZoneMetrics>();

    // Initialize zones
    tables.forEach(table => {
      const zone = table.zone || 'Main';
      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, {
          zone,
          totalTables: 0,
          totalRevenue: 0,
          totalSessions: 0,
          averageUtilization: 0,
          revenuePerTable: 0,
          sessionsPerTable: 0,
          averageSessionValue: 0
        });
      }
    });

    // Aggregate metrics by zone
    tableMetrics.forEach(metrics => {
      const zoneMetrics = zoneMap.get(metrics.zone);
      if (zoneMetrics) {
        zoneMetrics.totalTables += 1;
        zoneMetrics.totalRevenue += metrics.totalRevenue;
        zoneMetrics.totalSessions += metrics.totalSessions;
        zoneMetrics.averageUtilization += metrics.utilizationPercent;
      }
    });

    // Calculate averages
    const result: ZoneMetrics[] = [];
    zoneMap.forEach((zoneMetrics, zone) => {
      if (zoneMetrics.totalTables > 0) {
        zoneMetrics.averageUtilization = Math.round((zoneMetrics.averageUtilization / zoneMetrics.totalTables) * 10) / 10;
        zoneMetrics.revenuePerTable = Math.round((zoneMetrics.totalRevenue / zoneMetrics.totalTables) * 100) / 100;
        zoneMetrics.sessionsPerTable = Math.round((zoneMetrics.totalSessions / zoneMetrics.totalTables) * 10) / 10;
        zoneMetrics.averageSessionValue = zoneMetrics.totalSessions > 0
          ? Math.round((zoneMetrics.totalRevenue / zoneMetrics.totalSessions) * 100) / 100
          : 0;
      }
      result.push(zoneMetrics);
    });

    return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Generate heat map data
   */
  static generateHeatMapData(
    tables: Array<{ id: string; name: string; x: number; y: number; zone: string }>,
    tableMetrics: TableMetrics[],
    metric: 'revenue' | 'utilization' | 'sessions'
  ): HeatMapData[] {
    // Get all values for normalization
    const values = tableMetrics.map(m => {
      switch (metric) {
        case 'revenue':
          return m.totalRevenue;
        case 'utilization':
          return m.utilizationPercent;
        case 'sessions':
          return m.totalSessions;
        default:
          return 0;
      }
    });

    const maxValue = Math.max(...values, 1); // Avoid division by zero
    const minValue = Math.min(...values, 0);

    // Generate heat map data
    return tables.map(table => {
      const metrics = tableMetrics.find(m => m.tableId === table.id);
      if (!metrics) {
        return {
          tableId: table.id,
          tableName: table.name,
          x: table.x,
          y: table.y,
          value: 0,
          metric,
          rawValue: 0
        };
      }

      let rawValue = 0;
      switch (metric) {
        case 'revenue':
          rawValue = metrics.totalRevenue;
          break;
        case 'utilization':
          rawValue = metrics.utilizationPercent;
          break;
        case 'sessions':
          rawValue = metrics.totalSessions;
          break;
      }

      // Normalize to 0-1 range
      const normalizedValue = maxValue > minValue
        ? (rawValue - minValue) / (maxValue - minValue)
        : 0;

      return {
        tableId: table.id,
        tableName: table.name,
        x: table.x,
        y: table.y,
        value: normalizedValue,
        metric,
        rawValue: Math.round(rawValue * 100) / 100
      };
    });
  }

  /**
   * Get time-based heat map data (peak hours)
   */
  static getTimeBasedHeatMap(
    sessions: Array<{ startedAt?: string | Date; tableId: string }>,
    tables: Array<{ id: string; name: string; x: number; y: number }>
  ): HeatMapData[] {
    // Count sessions by hour
    const hourCounts: Record<string, Record<string, number>> = {};
    
    sessions.forEach(session => {
      if (!session.startedAt) return;
      
      const start = new Date(session.startedAt);
      const hour = start.getHours();
      const hourKey = `${hour}:00`;
      
      // Find matching table
      const table = tables.find(t => 
        t.id === session.tableId ||
        t.name === session.tableId ||
        t.name.toLowerCase() === session.tableId.toLowerCase()
      );
      
      if (table) {
        if (!hourCounts[table.id]) {
          hourCounts[table.id] = {};
        }
        hourCounts[table.id][hourKey] = (hourCounts[table.id][hourKey] || 0) + 1;
      }
    });

    // Find max count for normalization
    let maxCount = 0;
    Object.values(hourCounts).forEach(tableHours => {
      Object.values(tableHours).forEach(count => {
        maxCount = Math.max(maxCount, count);
      });
    });

    // Generate heat map data
    return tables.map(table => {
      const tableHours = hourCounts[table.id] || {};
      const peakHour = Object.entries(tableHours)
        .sort(([, a], [, b]) => b - a)[0];
      
      const rawValue = peakHour ? peakHour[1] : 0;
      const value = maxCount > 0 ? rawValue / maxCount : 0;

      return {
        tableId: table.id,
        tableName: table.name,
        x: table.x,
        y: table.y,
        value,
        metric: 'sessions',
        rawValue
      };
    });
  }
}

export interface HistoricalTrend {
  date: string; // ISO date string
  revenue: number;
  sessions: number;
  utilization: number;
  averageSessionValue: number;
}

export interface PeakHourAnalysis {
  hour: number;
  hourLabel: string; // "8:00 PM"
  sessionCount: number;
  revenue: number;
  utilization: number;
}

export interface DayOfWeekTrend {
  day: string; // "Monday", "Tuesday", etc.
  dayIndex: number; // 0-6
  averageRevenue: number;
  averageSessions: number;
  averageUtilization: number;
}

export class HistoricalTrendsService {
  /**
   * Calculate week-over-week trends
   */
  static calculateWeekOverWeek(
    currentWeekSessions: Array<{ createdAt: string | Date; priceCents?: number; durationSecs?: number }>,
    previousWeekSessions: Array<{ createdAt: string | Date; priceCents?: number; durationSecs?: number }>,
    totalHoursAvailable: number
  ): {
    revenue: { current: number; previous: number; change: number; changePercent: number };
    sessions: { current: number; previous: number; change: number; changePercent: number };
    utilization: { current: number; previous: number; change: number; changePercent: number };
  } {
    // Current week metrics
    const currentRevenue = currentWeekSessions.reduce((sum, s) => sum + ((s.priceCents || 0) / 100), 0);
    const currentSessions = currentWeekSessions.length;
    const currentHoursOccupied = currentWeekSessions.reduce((sum, s) => {
      const duration = s.durationSecs ? s.durationSecs / 3600 : 1; // Default 1 hour
      return sum + duration;
    }, 0);
    const currentUtilization = totalHoursAvailable > 0 ? (currentHoursOccupied / totalHoursAvailable) * 100 : 0;

    // Previous week metrics
    const previousRevenue = previousWeekSessions.reduce((sum, s) => sum + ((s.priceCents || 0) / 100), 0);
    const previousSessions = previousWeekSessions.length;
    const previousHoursOccupied = previousWeekSessions.reduce((sum, s) => {
      const duration = s.durationSecs ? s.durationSecs / 3600 : 1;
      return sum + duration;
    }, 0);
    const previousUtilization = totalHoursAvailable > 0 ? (previousHoursOccupied / totalHoursAvailable) * 100 : 0;

    // Calculate changes
    const revenueChange = currentRevenue - previousRevenue;
    const revenueChangePercent = previousRevenue > 0 ? (revenueChange / previousRevenue) * 100 : 0;
    
    const sessionsChange = currentSessions - previousSessions;
    const sessionsChangePercent = previousSessions > 0 ? (sessionsChange / previousSessions) * 100 : 0;
    
    const utilizationChange = currentUtilization - previousUtilization;
    const utilizationChangePercent = previousUtilization > 0 ? (utilizationChange / previousUtilization) * 100 : 0;

    return {
      revenue: {
        current: Math.round(currentRevenue * 100) / 100,
        previous: Math.round(previousRevenue * 100) / 100,
        change: Math.round(revenueChange * 100) / 100,
        changePercent: Math.round(revenueChangePercent * 10) / 10
      },
      sessions: {
        current: currentSessions,
        previous: previousSessions,
        change: sessionsChange,
        changePercent: Math.round(sessionsChangePercent * 10) / 10
      },
      utilization: {
        current: Math.round(currentUtilization * 10) / 10,
        previous: Math.round(previousUtilization * 10) / 10,
        change: Math.round(utilizationChange * 10) / 10,
        changePercent: Math.round(utilizationChangePercent * 10) / 10
      }
    };
  }

  /**
   * Identify peak hours
   */
  static identifyPeakHours(
    sessions: Array<{ startedAt?: string | Date; priceCents?: number; durationSecs?: number }>,
    totalTables: number
  ): PeakHourAnalysis[] {
    const hourStats: Record<number, { sessions: number; revenue: number; hoursOccupied: number }> = {};

    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      hourStats[hour] = { sessions: 0, revenue: 0, hoursOccupied: 0 };
    }

    // Aggregate by hour
    sessions.forEach(session => {
      if (!session.startedAt) return;
      
      const start = new Date(session.startedAt);
      const hour = start.getHours();
      
      hourStats[hour].sessions += 1;
      hourStats[hour].revenue += (session.priceCents || 0) / 100;
      
      const duration = session.durationSecs ? session.durationSecs / 3600 : 1;
      hourStats[hour].hoursOccupied += duration;
    });

    // Calculate utilization per hour (assuming 1 hour window)
    const results: PeakHourAnalysis[] = Object.entries(hourStats)
      .map(([hourStr, stats]) => {
        const hour = parseInt(hourStr);
        const utilization = totalTables > 0 ? (stats.hoursOccupied / totalTables) * 100 : 0;
        
        return {
          hour,
          hourLabel: this.formatHour(hour),
          sessionCount: stats.sessions,
          revenue: Math.round(stats.revenue * 100) / 100,
          utilization: Math.round(utilization * 10) / 10
        };
      })
      .sort((a, b) => b.sessionCount - a.sessionCount);

    return results;
  }

  /**
   * Calculate day-of-week trends
   */
  static calculateDayOfWeekTrends(
    sessions: Array<{ createdAt: string | Date; priceCents?: number; durationSecs?: number }>,
    totalHoursAvailablePerDay: number
  ): DayOfWeekTrend[] {
    const dayStats: Record<number, { revenue: number[]; sessions: number[]; hoursOccupied: number[] }> = {};

    // Initialize all days
    for (let day = 0; day < 7; day++) {
      dayStats[day] = { revenue: [], sessions: [], hoursOccupied: [] };
    }

    // Aggregate by day of week
    sessions.forEach(session => {
      if (!session.createdAt) return;
      
      const date = new Date(session.createdAt);
      const day = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      dayStats[day].revenue.push((session.priceCents || 0) / 100);
      dayStats[day].sessions.push(1);
      
      const duration = session.durationSecs ? session.durationSecs / 3600 : 1;
      dayStats[day].hoursOccupied.push(duration);
    });

    // Calculate averages
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return Object.entries(dayStats).map(([dayStr, stats]) => {
      const dayIndex = parseInt(dayStr);
      const dayCount = stats.revenue.length;
      
      const averageRevenue = dayCount > 0 
        ? stats.revenue.reduce((sum, r) => sum + r, 0) / dayCount 
        : 0;
      const averageSessions = dayCount > 0 
        ? stats.sessions.reduce((sum, s) => sum + s, 0) / dayCount 
        : 0;
      const totalHoursOccupied = stats.hoursOccupied.reduce((sum, h) => sum + h, 0);
      const averageUtilization = totalHoursAvailablePerDay > 0 && dayCount > 0
        ? (totalHoursOccupied / (totalHoursAvailablePerDay * dayCount)) * 100
        : 0;

      return {
        day: dayNames[dayIndex],
        dayIndex,
        averageRevenue: Math.round(averageRevenue * 100) / 100,
        averageSessions: Math.round(averageSessions * 10) / 10,
        averageUtilization: Math.round(averageUtilization * 10) / 10
      };
    });
  }

  /**
   * Calculate daily trends for a date range
   */
  static calculateDailyTrends(
    sessions: Array<{ createdAt: string | Date; priceCents?: number; durationSecs?: number }>,
    startDate: Date,
    endDate: Date,
    totalHoursAvailablePerDay: number
  ): HistoricalTrend[] {
    const dailyStats: Record<string, { revenue: number; sessions: number; hoursOccupied: number }> = {};

    // Initialize all days in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyStats[dateKey] = { revenue: 0, sessions: 0, hoursOccupied: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate by date
    sessions.forEach(session => {
      if (!session.createdAt) return;
      
      const date = new Date(session.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].revenue += (session.priceCents || 0) / 100;
        dailyStats[dateKey].sessions += 1;
        
        const duration = session.durationSecs ? session.durationSecs / 3600 : 1;
        dailyStats[dateKey].hoursOccupied += duration;
      }
    });

    // Convert to array and calculate utilization
    return Object.entries(dailyStats)
      .map(([dateKey, stats]) => {
        const utilization = totalHoursAvailablePerDay > 0
          ? (stats.hoursOccupied / totalHoursAvailablePerDay) * 100
          : 0;
        const averageSessionValue = stats.sessions > 0
          ? stats.revenue / stats.sessions
          : 0;

        return {
          date: dateKey,
          revenue: Math.round(stats.revenue * 100) / 100,
          sessions: stats.sessions,
          utilization: Math.round(utilization * 10) / 10,
          averageSessionValue: Math.round(averageSessionValue * 100) / 100
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Format hour for display
   */
  private static formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }
}




