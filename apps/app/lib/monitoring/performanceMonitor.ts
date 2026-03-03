/**
 * Performance Monitoring Service
 * 
 * Tracks API response times, database query performance,
 * and other key performance indicators.
 */

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DatabaseQueryMetric {
  query: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private apiMetrics: PerformanceMetric[] = [];
  private dbMetrics: DatabaseQueryMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Record an API call metric
   */
  recordApiCall(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: new Date(),
      metadata,
    };

    this.apiMetrics.push(metric);

    // Keep only last maxMetrics
    if (this.apiMetrics.length > this.maxMetrics) {
      this.apiMetrics = this.apiMetrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Record a database query metric
   */
  recordDatabaseQuery(
    query: string,
    duration: number,
    success: boolean,
    error?: string
  ): void {
    const metric: DatabaseQueryMetric = {
      query,
      duration,
      timestamp: new Date(),
      success,
      error,
    };

    this.dbMetrics.push(metric);

    // Keep only last maxMetrics
    if (this.dbMetrics.length > this.maxMetrics) {
      this.dbMetrics = this.dbMetrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get API performance statistics
   */
  getApiStats(timeWindowMinutes: number = 5): {
    totalRequests: number;
    averageResponseTime: number;
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
    requestsByEndpoint: Record<string, number>;
    slowestEndpoints: Array<{ endpoint: string; avgTime: number; count: number }>;
  } {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recentMetrics = this.apiMetrics.filter((m) => m.timestamp >= cutoff);

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        errorRate: 0,
        requestsByEndpoint: {},
        slowestEndpoints: [],
      };
    }

    const responseTimes = recentMetrics.map((m) => m.responseTime).sort((a, b) => a - b);
    const errors = recentMetrics.filter((m) => m.statusCode >= 400).length;

    // Calculate percentiles
    const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)] || 0;
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;

    // Group by endpoint
    const requestsByEndpoint: Record<string, number> = {};
    const endpointTimes: Record<string, number[]> = {};

    recentMetrics.forEach((m) => {
      requestsByEndpoint[m.endpoint] = (requestsByEndpoint[m.endpoint] || 0) + 1;
      if (!endpointTimes[m.endpoint]) {
        endpointTimes[m.endpoint] = [];
      }
      endpointTimes[m.endpoint].push(m.responseTime);
    });

    // Calculate slowest endpoints
    const slowestEndpoints = Object.entries(endpointTimes)
      .map(([endpoint, times]) => ({
        endpoint,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        count: times.length,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    return {
      totalRequests: recentMetrics.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      p50,
      p95,
      p99,
      errorRate: errors / recentMetrics.length,
      requestsByEndpoint,
      slowestEndpoints,
    };
  }

  /**
   * Get database performance statistics
   */
  getDatabaseStats(timeWindowMinutes: number = 5): {
    totalQueries: number;
    averageDuration: number;
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
    slowestQueries: Array<{ query: string; avgDuration: number; count: number }>;
  } {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recentMetrics = this.dbMetrics.filter((m) => m.timestamp >= cutoff);

    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        errorRate: 0,
        slowestQueries: [],
      };
    }

    const durations = recentMetrics.map((m) => m.duration).sort((a, b) => a - b);
    const errors = recentMetrics.filter((m) => !m.success).length;

    // Calculate percentiles
    const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
    const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
    const p99 = durations[Math.floor(durations.length * 0.99)] || 0;

    // Group by query
    const queryDurations: Record<string, number[]> = {};
    recentMetrics.forEach((m) => {
      const queryKey = m.query.substring(0, 100); // Truncate long queries
      if (!queryDurations[queryKey]) {
        queryDurations[queryKey] = [];
      }
      queryDurations[queryKey].push(m.duration);
    });

    // Calculate slowest queries
    const slowestQueries = Object.entries(queryDurations)
      .map(([query, durations]) => ({
        query,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        count: durations.length,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    return {
      totalQueries: recentMetrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50,
      p95,
      p99,
      errorRate: errors / recentMetrics.length,
      slowestQueries,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.apiMetrics = [];
    this.dbMetrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

