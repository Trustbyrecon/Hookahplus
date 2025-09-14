/**
 * Observability System for Hookah+ Production
 * SLA tracking, performance metrics, and system health monitoring
 */

export interface SLAMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  metrics: SLAMetric[];
  alerts: Alert[];
  lastUpdated: Date;
}

export interface Alert {
  id: string;
  type: 'sla_breach' | 'performance' | 'error' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata: Record<string, any>;
}

export interface RefillSLA {
  requestId: string;
  sessionId: string;
  tableId: string;
  requestedAt: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  status: 'pending' | 'completed' | 'overdue';
  slaThreshold: number; // in seconds
}

export class ObservabilitySystem {
  private metrics: PerformanceMetric[] = [];
  private slaMetrics: SLAMetric[] = [];
  private alerts: Alert[] = [];
  private refillSLAs: RefillSLA[] = [];
  private maxMetrics: number = 10000;

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string,
    metadata: Record<string, any> = {}
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      metadata
    };

    this.metrics.push(metric);

    // Maintain max metrics limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check for SLA breaches
    this.checkSLABreaches(metric);
  }

  /**
   * Record refill request for SLA tracking
   */
  recordRefillRequest(
    requestId: string,
    sessionId: string,
    tableId: string,
    slaThreshold: number = 420 // 7 minutes default
  ): void {
    const refillSLA: RefillSLA = {
      requestId,
      sessionId,
      tableId,
      requestedAt: new Date(),
      status: 'pending',
      slaThreshold
    };

    this.refillSLAs.push(refillSLA);
  }

  /**
   * Complete refill request
   */
  completeRefillRequest(requestId: string): void {
    const refillSLA = this.refillSLAs.find(sla => sla.requestId === requestId);
    if (!refillSLA) return;

    refillSLA.completedAt = new Date();
    refillSLA.duration = Math.floor(
      (refillSLA.completedAt.getTime() - refillSLA.requestedAt.getTime()) / 1000
    );
    refillSLA.status = refillSLA.duration <= refillSLA.slaThreshold ? 'completed' : 'overdue';

    // Record SLA metric
    this.recordMetric(
      'refill_duration',
      refillSLA.duration,
      'seconds',
      {
        requestId,
        sessionId: refillSLA.sessionId,
        tableId: refillSLA.tableId,
        slaThreshold: refillSLA.slaThreshold
      }
    );
  }

  /**
   * Get refill SLA analytics
   */
  getRefillAnalytics(days: number = 7): {
    totalRequests: number;
    completedRequests: number;
    overdueRequests: number;
    averageDuration: number;
    slaCompliance: number;
    byStaff: Array<{ staffId: string; averageDuration: number; compliance: number }>;
  } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentSLAs = this.refillSLAs.filter(sla => sla.requestedAt >= cutoffDate);

    const totalRequests = recentSLAs.length;
    const completedRequests = recentSLAs.filter(sla => sla.status === 'completed').length;
    const overdueRequests = recentSLAs.filter(sla => sla.status === 'overdue').length;
    
    const completedSLAs = recentSLAs.filter(sla => sla.duration !== undefined);
    const averageDuration = completedSLAs.length > 0 
      ? completedSLAs.reduce((sum, sla) => sum + sla.duration!, 0) / completedSLAs.length 
      : 0;

    const slaCompliance = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    // Group by staff (simplified - in production would track actual staff assignments)
    const byStaff = this.getStaffRefillAnalytics(recentSLAs);

    return {
      totalRequests,
      completedRequests,
      overdueRequests,
      averageDuration,
      slaCompliance,
      byStaff
    };
  }

  /**
   * Get staff refill analytics
   */
  private getStaffRefillAnalytics(slas: RefillSLA[]): Array<{ staffId: string; averageDuration: number; compliance: number }> {
    // Simplified implementation - in production would track actual staff assignments
    const staffData: Record<string, { durations: number[]; completed: number; total: number }> = {};

    slas.forEach(sla => {
      const staffId = 'staff_001'; // Simplified - would be actual staff assignment
      if (!staffData[staffId]) {
        staffData[staffId] = { durations: [], completed: 0, total: 0 };
      }

      staffData[staffId].total++;
      if (sla.duration !== undefined) {
        staffData[staffId].durations.push(sla.duration);
        staffData[staffId].completed++;
      }
    });

    return Object.entries(staffData).map(([staffId, data]) => ({
      staffId,
      averageDuration: data.durations.length > 0 
        ? data.durations.reduce((sum, dur) => sum + dur, 0) / data.durations.length 
        : 0,
      compliance: data.total > 0 ? (data.completed / data.total) * 100 : 0
    }));
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const now = new Date();
    const recentMetrics = this.metrics.filter(
      m => now.getTime() - m.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    // Calculate SLA metrics
    const refillDuration = this.getAverageRefillDuration();
    const sessionTurnover = this.getSessionTurnoverRate();
    const errorRate = this.getErrorRate();

    const slaMetrics: SLAMetric[] = [
      {
        name: 'refill_duration',
        value: refillDuration,
        unit: 'seconds',
        timestamp: now,
        threshold: 420, // 7 minutes
        status: refillDuration <= 420 ? 'good' : refillDuration <= 600 ? 'warning' : 'critical'
      },
      {
        name: 'session_turnover',
        value: sessionTurnover,
        unit: 'sessions/hour',
        timestamp: now,
        threshold: 2, // Minimum 2 sessions per hour
        status: sessionTurnover >= 2 ? 'good' : sessionTurnover >= 1 ? 'warning' : 'critical'
      },
      {
        name: 'error_rate',
        value: errorRate,
        unit: 'percentage',
        timestamp: now,
        threshold: 5, // Max 5% error rate
        status: errorRate <= 5 ? 'good' : errorRate <= 10 ? 'warning' : 'critical'
      }
    ];

    // Determine overall health
    const criticalMetrics = slaMetrics.filter(m => m.status === 'critical');
    const warningMetrics = slaMetrics.filter(m => m.status === 'warning');

    let overall: 'healthy' | 'degraded' | 'critical';
    if (criticalMetrics.length > 0) {
      overall = 'critical';
    } else if (warningMetrics.length > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      metrics: slaMetrics,
      alerts: this.alerts.filter(a => !a.resolved),
      lastUpdated: now
    };
  }

  /**
   * Get average refill duration
   */
  private getAverageRefillDuration(): number {
    const recentRefills = this.refillSLAs.filter(
      sla => sla.duration !== undefined && 
      Date.now() - sla.requestedAt.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    if (recentRefills.length === 0) return 0;

    return recentRefills.reduce((sum, sla) => sum + sla.duration!, 0) / recentRefills.length;
  }

  /**
   * Get session turnover rate
   */
  private getSessionTurnoverRate(): number {
    // Simplified implementation - would track actual session data
    return 3.5; // Mock data
  }

  /**
   * Get error rate
   */
  private getErrorRate(): number {
    const recentMetrics = this.metrics.filter(
      m => Date.now() - m.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );

    if (recentMetrics.length === 0) return 0;

    const errorMetrics = recentMetrics.filter(m => m.name.includes('error'));
    return (errorMetrics.length / recentMetrics.length) * 100;
  }

  /**
   * Create alert
   */
  createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    message: string,
    metadata: Record<string, any> = {}
  ): string {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata
    };

    this.alerts.push(alert);
    return alert.id;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.resolved = true;
    return true;
  }

  /**
   * Check for SLA breaches and create alerts
   */
  private checkSLABreaches(metric: PerformanceMetric): void {
    if (metric.name === 'refill_duration' && metric.value > 600) {
      this.createAlert(
        'sla_breach',
        'high',
        `Refill SLA breached: ${metric.value}s (threshold: 420s)`,
        { metric: metric.name, value: metric.value, threshold: 420 }
      );
    }
  }

  /**
   * Get performance dashboard data
   */
  getPerformanceDashboard(): {
    refillAnalytics: ReturnType<typeof this.getRefillAnalytics>;
    systemHealth: SystemHealth;
    recentAlerts: Alert[];
    topMetrics: Array<{ name: string; value: number; trend: 'up' | 'down' | 'stable' }>;
  } {
    return {
      refillAnalytics: this.getRefillAnalytics(),
      systemHealth: this.getSystemHealth(),
      recentAlerts: this.alerts
        .filter(a => !a.resolved)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10),
      topMetrics: this.getTopMetrics()
    };
  }

  /**
   * Get top metrics with trends
   */
  private getTopMetrics(): Array<{ name: string; value: number; trend: 'up' | 'down' | 'stable' }> {
    const metricNames = ['refill_duration', 'session_turnover', 'error_rate'];
    
    return metricNames.map(name => {
      const recent = this.metrics
        .filter(m => m.name === name && Date.now() - m.timestamp.getTime() < 60 * 60 * 1000)
        .slice(-10);

      if (recent.length < 2) {
        return { name, value: 0, trend: 'stable' as const };
      }

      const current = recent[recent.length - 1].value;
      const previous = recent[0].value;
      const trend = current > previous ? 'up' : current < previous ? 'down' : 'stable';

      return { name, value: current, trend };
    });
  }
}

// Export singleton instance
export const observability = new ObservabilitySystem();
