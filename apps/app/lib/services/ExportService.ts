/**
 * Export Service
 * 
 * Handles data export in various formats (PDF, CSV, JSON)
 */

import { PrismaClient } from '@prisma/client';

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json' | 'xlsx';
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: {
    loungeId?: string;
    tableId?: string;
    status?: string;
  };
  includeCharts?: boolean;
  includeDetails?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: string | Buffer;
  filename?: string;
  mimeType?: string;
  error?: string;
}

export class ExportService {
  /**
   * Export analytics data to CSV
   */
  static async exportToCSV(
    data: any[],
    options: ExportOptions,
    prisma?: PrismaClient
  ): Promise<ExportResult> {
    try {
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'No data to export'
        };
      }

      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      const csvRows: string[] = [];
      
      // Add headers
      csvRows.push(headers.join(','));
      
      // Add data rows
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header];
          // Handle values that contain commas, quotes, or newlines
          if (value === null || value === undefined) {
            return '';
          }
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvRows.push(values.join(','));
      }
      
      const csvContent = csvRows.join('\n');
      const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
      
      return {
        success: true,
        data: csvContent,
        filename,
        mimeType: 'text/csv'
      };
    } catch (error) {
      console.error('[ExportService] Error exporting to CSV:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export to CSV'
      };
    }
  }

  /**
   * Export analytics data to JSON
   */
  static async exportToJSON(
    data: any,
    options: ExportOptions,
    prisma?: PrismaClient
  ): Promise<ExportResult> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
      
      return {
        success: true,
        data: jsonContent,
        filename,
        mimeType: 'application/json'
      };
    } catch (error) {
      console.error('[ExportService] Error exporting to JSON:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export to JSON'
      };
    }
  }

  /**
   * Export analytics data to PDF
   * Note: Requires a PDF library like pdfkit or puppeteer
   */
  static async exportToPDF(
    data: any,
    options: ExportOptions,
    prisma?: PrismaClient
  ): Promise<ExportResult> {
    try {
      // TODO: Implement PDF generation using pdfkit or puppeteer
      // For now, return a placeholder
      const pdfContent = `PDF Export - ${new Date().toISOString()}\n\nData: ${JSON.stringify(data, null, 2)}`;
      const filename = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      return {
        success: true,
        data: pdfContent,
        filename,
        mimeType: 'application/pdf'
      };
    } catch (error) {
      console.error('[ExportService] Error exporting to PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export to PDF'
      };
    }
  }

  /**
   * Export sessions data
   */
  static async exportSessions(
    options: ExportOptions,
    prisma?: PrismaClient
  ): Promise<ExportResult> {
    try {
      if (!prisma) {
        return {
          success: false,
          error: 'Prisma client required for database queries'
        };
      }

      const where: any = {};
      
      if (options.filters?.loungeId) {
        where.loungeId = options.filters.loungeId;
      }
      
      if (options.filters?.tableId) {
        where.tableId = options.filters.tableId;
      }
      
      if (options.filters?.status) {
        where.state = options.filters.status;
      }
      
      if (options.dateRange) {
        where.createdAt = {
          gte: options.dateRange.start,
          lte: options.dateRange.end,
        };
      }

      const sessions = await prisma.session.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10000, // Limit to prevent memory issues
      });

      // Transform sessions for export
      const exportData = sessions.map(session => ({
        id: session.id,
        loungeId: session.loungeId,
        tableId: session.tableId,
        customerName: session.customerRef,
        customerPhone: session.customerPhone,
        status: session.state,
        amount: session.priceCents ? (session.priceCents / 100).toFixed(2) : '0.00',
        createdAt: session.createdAt.toISOString(),
        startedAt: session.startedAt?.toISOString() || '',
        endedAt: session.endedAt?.toISOString() || '',
        duration: session.durationSecs ? `${Math.floor(session.durationSecs / 60)}m` : '',
      }));

      switch (options.format) {
        case 'csv':
          return await this.exportToCSV(exportData, options, prisma);
        case 'json':
          return await this.exportToJSON(exportData, options, prisma);
        case 'pdf':
          return await this.exportToPDF(exportData, options, prisma);
        default:
          return {
            success: false,
            error: `Unsupported format: ${options.format}`
          };
      }
    } catch (error) {
      console.error('[ExportService] Error exporting sessions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export sessions'
      };
    }
  }

  /**
   * Export analytics data
   */
  static async exportAnalytics(
    analyticsData: any,
    options: ExportOptions,
    prisma?: PrismaClient
  ): Promise<ExportResult> {
    try {
      // Flatten analytics data for export
      const exportData = this.flattenAnalyticsData(analyticsData);

      switch (options.format) {
        case 'csv':
          return await this.exportToCSV(exportData, options, prisma);
        case 'json':
          return await this.exportToJSON(exportData, options, prisma);
        case 'pdf':
          return await this.exportToPDF(exportData, options, prisma);
        default:
          return {
            success: false,
            error: `Unsupported format: ${options.format}`
          };
      }
    } catch (error) {
      console.error('[ExportService] Error exporting analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export analytics'
      };
    }
  }

  /**
   * Flatten nested analytics data for export
   */
  private static flattenAnalyticsData(data: any): any[] {
    const flattened: any[] = [];
    
    if (data.revenue) {
      flattened.push({
        metric: 'Revenue',
        total: data.revenue.total,
        daily: data.revenue.daily,
        hourly: data.revenue.hourly,
        change: data.revenue.change || 0,
      });
    }
    
    if (data.sessions) {
      flattened.push({
        metric: 'Sessions',
        total: data.sessions.total,
        active: data.sessions.active,
        completed: data.sessions.completed,
        cancelled: data.sessions.cancelled || 0,
        avgDuration: data.sessions.avgDuration,
      });
    }
    
    if (data.customers) {
      flattened.push({
        metric: 'Customers',
        total: data.customers.total,
        new: data.customers.new,
        returning: data.customers.returning,
        vip: data.customers.vip || 0,
        avgSpend: data.customers.avgSpend,
      });
    }
    
    return flattened;
  }
}

