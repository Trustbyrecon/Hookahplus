/**
 * Custom Report Builder Service
 * 
 * Allows users to build custom reports with selected metrics and visualizations
 */

export interface ReportMetric {
  id: string;
  name: string;
  type: 'revenue' | 'sessions' | 'customers' | 'performance' | 'custom';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  format?: 'currency' | 'number' | 'percentage' | 'time';
}

export interface ReportVisualization {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'heatmap';
  metricIds: string[];
  config?: {
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    groupBy?: string;
    sortBy?: string;
  };
}

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  metrics: ReportMetric[];
  visualizations: ReportVisualization[];
  filters?: {
    dateRange?: {
      start: Date;
      end: Date;
    };
    loungeId?: string;
    tableId?: string;
    status?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class CustomReportBuilder {
  /**
   * Create a custom report
   */
  static createReport(
    name: string,
    metrics: ReportMetric[],
    visualizations: ReportVisualization[],
    filters?: CustomReport['filters']
  ): CustomReport {
    return {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      metrics,
      visualizations,
      filters,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get available metrics
   */
  static getAvailableMetrics(): ReportMetric[] {
    return [
      { id: 'revenue_total', name: 'Total Revenue', type: 'revenue', aggregation: 'sum', format: 'currency' },
      { id: 'revenue_daily', name: 'Daily Revenue', type: 'revenue', aggregation: 'avg', format: 'currency' },
      { id: 'sessions_total', name: 'Total Sessions', type: 'sessions', aggregation: 'count', format: 'number' },
      { id: 'sessions_active', name: 'Active Sessions', type: 'sessions', aggregation: 'count', format: 'number' },
      { id: 'sessions_avg_duration', name: 'Avg Session Duration', type: 'sessions', aggregation: 'avg', format: 'time' },
      { id: 'customers_total', name: 'Total Customers', type: 'customers', aggregation: 'count', format: 'number' },
      { id: 'customers_new', name: 'New Customers', type: 'customers', aggregation: 'count', format: 'number' },
      { id: 'customers_returning', name: 'Returning Customers', type: 'customers', aggregation: 'count', format: 'number' },
      { id: 'table_utilization', name: 'Table Utilization', type: 'performance', aggregation: 'avg', format: 'percentage' },
      { id: 'table_turnover', name: 'Table Turnover', type: 'performance', aggregation: 'avg', format: 'number' },
    ];
  }

  /**
   * Get available visualization types
   */
  static getAvailableVisualizations(): Array<{ type: string; label: string; description: string }> {
    return [
      { type: 'chart', label: 'Chart', description: 'Line, bar, pie, or area chart' },
      { type: 'table', label: 'Table', description: 'Data table with sorting and filtering' },
      { type: 'metric', label: 'Metric Card', description: 'Single metric display' },
      { type: 'heatmap', label: 'Heat Map', description: 'Visual heat map (for table layouts)' },
    ];
  }

  /**
   * Validate report configuration
   */
  static validateReport(report: CustomReport): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!report.name || report.name.trim().length === 0) {
      errors.push('Report name is required');
    }

    if (!report.metrics || report.metrics.length === 0) {
      errors.push('At least one metric is required');
    }

    if (!report.visualizations || report.visualizations.length === 0) {
      errors.push('At least one visualization is required');
    }

    // Validate visualizations reference valid metrics
    for (const viz of report.visualizations) {
      for (const metricId of viz.metricIds) {
        if (!report.metrics.find(m => m.id === metricId)) {
          errors.push(`Visualization references non-existent metric: ${metricId}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate report data
   */
  static async generateReportData(
    report: CustomReport,
    dataSource: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const reportData: any = {
        reportId: report.id,
        reportName: report.name,
        generatedAt: new Date().toISOString(),
        metrics: {},
        visualizations: [],
      };

      // Calculate metrics
      for (const metric of report.metrics) {
        // TODO: Calculate metric from dataSource
        reportData.metrics[metric.id] = {
          name: metric.name,
          value: 0, // Placeholder
          format: metric.format,
        };
      }

      // Generate visualization data
      for (const viz of report.visualizations) {
        // TODO: Generate visualization data
        reportData.visualizations.push({
          id: viz.id,
          type: viz.type,
          data: [], // Placeholder
        });
      }

      return {
        success: true,
        data: reportData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report data'
      };
    }
  }
}

