import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ExportService, ExportOptions } from '../../../lib/services/ExportService';

const prisma = new PrismaClient();

/**
 * POST /api/export
 * Export data in various formats (CSV, JSON, PDF)
 * 
 * Body: {
 *   type: 'sessions' | 'analytics',
 *   format: 'csv' | 'json' | 'pdf',
 *   dateRange?: { start: string, end: string },
 *   filters?: { loungeId?: string, tableId?: string, status?: string }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, format, dateRange, filters } = body;

    if (!type || !format) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: type and format'
      }, { status: 400 });
    }

    const exportOptions: ExportOptions = {
      format: format as 'csv' | 'json' | 'pdf',
      dateRange: dateRange ? {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      } : undefined,
      filters,
    };

    let result;
    
    if (type === 'sessions') {
      result = await ExportService.exportSessions(exportOptions, prisma);
    } else if (type === 'analytics') {
      // For analytics, we need to fetch the data first
      // This is a simplified version - in production, you'd fetch from analytics API
      const analyticsData = {}; // Placeholder
      result = await ExportService.exportAnalytics(analyticsData, exportOptions, prisma);
    } else {
      return NextResponse.json({
        success: false,
        error: `Unsupported export type: ${type}`
      }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    // Return the export data
    // Convert Buffer to string if needed, or use string directly
    const responseBody = typeof result.data === 'string' 
      ? result.data 
      : result.data instanceof Buffer 
        ? result.data.toString('utf-8')
        : String(result.data || '');
    
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    });

  } catch (error) {
    console.error('[Export API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to export data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/export/formats
 * Get available export formats
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const formats = [
      { value: 'csv', label: 'CSV', description: 'Comma-separated values for Excel/Sheets' },
      { value: 'json', label: 'JSON', description: 'Structured data format' },
      { value: 'pdf', label: 'PDF', description: 'Portable document format with charts' },
    ];

    return NextResponse.json({
      success: true,
      formats,
      supportedTypes: ['sessions', 'analytics'],
    });

  } catch (error) {
    console.error('[Export API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get export formats'
    }, { status: 500 });
  }
}

