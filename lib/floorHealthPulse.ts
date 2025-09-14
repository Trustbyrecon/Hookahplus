/**
 * Floor Health Pulse for Hookah+ Moat
 * Real-time snapshot of active sessions, revenue run-rate, and operational metrics
 */

export interface FloorHealthMetrics {
  timestamp: Date;
  activeSessions: number;
  pendingRefills: number;
  revenueRunRate: number; // $/hour
  averageSessionDuration: number; // minutes
  tableUtilization: number; // percentage
  staffEfficiency: number; // percentage
  customerSatisfaction: number; // 1-10 scale
  peakHours: boolean;
  alerts: string[];
}

export interface SessionSnapshot {
  id: string;
  tableId: string;
  state: string;
  duration: number; // minutes
  remainingTime: number; // minutes
  revenue: number; // cents
  customerCount: number;
  lastActivity: Date;
  refillRequests: number;
  extensions: number;
}

export interface TableStatus {
  id: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  sessionId?: string;
  customerCount?: number;
  lastOccupied?: Date;
  revenue: number; // cents
}

export interface StaffPerformance {
  staffId: string;
  name: string;
  role: 'foh' | 'boh' | 'manager';
  activeSessions: number;
  refillResponseTime: number; // seconds
  customerRating: number; // 1-10
  efficiency: number; // percentage
  lastActive: Date;
}

export class FloorHealthPulse {
  private sessions: Map<string, SessionSnapshot> = new Map();
  private tables: Map<string, TableStatus> = new Map();
  private staff: Map<string, StaffPerformance> = new Map();
  private metricsHistory: FloorHealthMetrics[] = [];
  private maxHistorySize: number = 100;

  constructor() {
    this.initializeTables();
    this.initializeStaff();
  }

  /**
   * Initialize table statuses
   */
  private initializeTables(): void {
    const tableIds = ['T-001', 'T-002', 'T-003', 'T-004', 'T-005', 'T-006', 'T-007', 'T-008'];
    
    tableIds.forEach(id => {
      this.tables.set(id, {
        id,
        status: 'available',
        revenue: 0
      });
    });
  }

  /**
   * Initialize staff performance tracking
   */
  private initializeStaff(): void {
    const staffMembers: StaffPerformance[] = [
      {
        staffId: 'foh_001',
        name: 'Sarah Johnson',
        role: 'foh',
        activeSessions: 0,
        refillResponseTime: 0,
        customerRating: 8.5,
        efficiency: 85,
        lastActive: new Date()
      },
      {
        staffId: 'boh_001',
        name: 'Mike Chen',
        role: 'boh',
        activeSessions: 0,
        refillResponseTime: 0,
        customerRating: 9.0,
        efficiency: 90,
        lastActive: new Date()
      },
      {
        staffId: 'manager_001',
        name: 'Alex Rodriguez',
        role: 'manager',
        activeSessions: 0,
        refillResponseTime: 0,
        customerRating: 9.5,
        efficiency: 95,
        lastActive: new Date()
      }
    ];

    staffMembers.forEach(staff => {
      this.staff.set(staff.staffId, staff);
    });
  }

  /**
   * Update session snapshot
   */
  updateSession(session: SessionSnapshot): void {
    this.sessions.set(session.id, session);
    
    // Update table status
    const table = this.tables.get(session.tableId);
    if (table) {
      table.status = 'occupied';
      table.sessionId = session.id;
      table.customerCount = session.customerCount;
      table.revenue = session.revenue;
    }
  }

  /**
   * Remove session
   */
  removeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    this.sessions.delete(sessionId);

    // Update table status
    const table = this.tables.get(session.tableId);
    if (table) {
      table.status = 'available';
      table.sessionId = undefined;
      table.customerCount = undefined;
      table.lastOccupied = new Date();
    }
  }

  /**
   * Update staff performance
   */
  updateStaffPerformance(staffId: string, updates: Partial<StaffPerformance>): void {
    const staff = this.staff.get(staffId);
    if (!staff) return;

    Object.assign(staff, updates);
    staff.lastActive = new Date();
  }

  /**
   * Get current floor health metrics
   */
  getFloorHealthMetrics(): FloorHealthMetrics {
    const now = new Date();
    const activeSessions = this.sessions.size;
    const pendingRefills = Array.from(this.sessions.values())
      .reduce((sum, session) => sum + session.refillRequests, 0);

    // Calculate revenue run rate (last hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentSessions = Array.from(this.sessions.values())
      .filter(session => session.lastActivity >= oneHourAgo);
    const revenueRunRate = recentSessions.reduce((sum, session) => sum + session.revenue, 0) / 100; // Convert to dollars

    // Calculate average session duration
    const averageSessionDuration = activeSessions > 0 
      ? Array.from(this.sessions.values()).reduce((sum, session) => sum + session.duration, 0) / activeSessions
      : 0;

    // Calculate table utilization
    const totalTables = this.tables.size;
    const occupiedTables = Array.from(this.tables.values())
      .filter(table => table.status === 'occupied').length;
    const tableUtilization = (occupiedTables / totalTables) * 100;

    // Calculate staff efficiency
    const staffEfficiency = Array.from(this.staff.values())
      .reduce((sum, staff) => sum + staff.efficiency, 0) / this.staff.size;

    // Calculate customer satisfaction
    const customerSatisfaction = Array.from(this.staff.values())
      .reduce((sum, staff) => sum + staff.customerRating, 0) / this.staff.size;

    // Check if peak hours (6 PM - 11 PM)
    const currentHour = now.getHours();
    const peakHours = currentHour >= 18 && currentHour <= 23;

    // Generate alerts
    const alerts: string[] = [];
    if (pendingRefills > 3) {
      alerts.push(`High refill requests: ${pendingRefills} pending`);
    }
    if (tableUtilization > 90) {
      alerts.push(`High table utilization: ${tableUtilization.toFixed(1)}%`);
    }
    if (staffEfficiency < 80) {
      alerts.push(`Staff efficiency below target: ${staffEfficiency.toFixed(1)}%`);
    }
    if (customerSatisfaction < 8) {
      alerts.push(`Customer satisfaction below target: ${customerSatisfaction.toFixed(1)}/10`);
    }

    const metrics: FloorHealthMetrics = {
      timestamp: now,
      activeSessions,
      pendingRefills,
      revenueRunRate,
      averageSessionDuration,
      tableUtilization,
      staffEfficiency,
      customerSatisfaction,
      peakHours,
      alerts
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
    }

    return metrics;
  }

  /**
   * Get session snapshots
   */
  getSessionSnapshots(): SessionSnapshot[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get table statuses
   */
  getTableStatuses(): TableStatus[] {
    return Array.from(this.tables.values());
  }

  /**
   * Get staff performance
   */
  getStaffPerformance(): StaffPerformance[] {
    return Array.from(this.staff.values());
  }

  /**
   * Get floor health trends
   */
  getFloorHealthTrends(hours: number = 24): {
    revenueTrend: Array<{ timestamp: Date; revenue: number }>;
    sessionTrend: Array<{ timestamp: Date; sessions: number }>;
    efficiencyTrend: Array<{ timestamp: Date; efficiency: number }>;
  } {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metricsHistory.filter(m => m.timestamp >= cutoffTime);

    const revenueTrend = recentMetrics.map(m => ({
      timestamp: m.timestamp,
      revenue: m.revenueRunRate
    }));

    const sessionTrend = recentMetrics.map(m => ({
      timestamp: m.timestamp,
      sessions: m.activeSessions
    }));

    const efficiencyTrend = recentMetrics.map(m => ({
      timestamp: m.timestamp,
      efficiency: m.staffEfficiency
    }));

    return {
      revenueTrend,
      sessionTrend,
      efficiencyTrend
    };
  }

  /**
   * Get operational insights
   */
  getOperationalInsights(): {
    peakHours: { start: number; end: number; utilization: number };
    bestPerformingStaff: StaffPerformance[];
    busiestTables: TableStatus[];
    revenueOpportunities: string[];
  } {
    // Analyze peak hours
    const hourlyUtilization: Record<number, number> = {};
    this.metricsHistory.forEach(metric => {
      const hour = metric.timestamp.getHours();
      hourlyUtilization[hour] = (hourlyUtilization[hour] || 0) + metric.tableUtilization;
    });

    let peakStart = 18;
    let peakEnd = 23;
    let maxUtilization = 0;

    Object.entries(hourlyUtilization).forEach(([hour, utilization]) => {
      const avgUtilization = utilization / this.metricsHistory.length;
      if (avgUtilization > maxUtilization) {
        maxUtilization = avgUtilization;
        peakStart = parseInt(hour);
        peakEnd = parseInt(hour) + 1;
      }
    });

    // Get best performing staff
    const bestPerformingStaff = Array.from(this.staff.values())
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3);

    // Get busiest tables
    const busiestTables = Array.from(this.tables.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Identify revenue opportunities
    const revenueOpportunities: string[] = [];
    const currentMetrics = this.getFloorHealthMetrics();
    
    if (currentMetrics.tableUtilization < 70) {
      revenueOpportunities.push('Low table utilization - consider promotions');
    }
    if (currentMetrics.averageSessionDuration < 25) {
      revenueOpportunities.push('Short session duration - offer extensions');
    }
    if (currentMetrics.pendingRefills === 0 && currentMetrics.activeSessions > 0) {
      revenueOpportunities.push('No pending refills - good service level');
    }

    return {
      peakHours: { start: peakStart, end: peakEnd, utilization: maxUtilization },
      bestPerformingStaff,
      busiestTables,
      revenueOpportunities
    };
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData(): {
    metrics: FloorHealthMetrics;
    sessions: SessionSnapshot[];
    tables: TableStatus[];
    staff: StaffPerformance[];
    trends: ReturnType<typeof this.getFloorHealthTrends>;
    insights: ReturnType<typeof this.getOperationalInsights>;
  } {
    return {
      metrics: this.getFloorHealthMetrics(),
      sessions: this.getSessionSnapshots(),
      tables: this.getTableStatuses(),
      staff: this.getStaffPerformance(),
      trends: this.getFloorHealthTrends(),
      insights: this.getOperationalInsights()
    };
  }
}

// Export singleton instance
export const floorHealthPulse = new FloorHealthPulse();
