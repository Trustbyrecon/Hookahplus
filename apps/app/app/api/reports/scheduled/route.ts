import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ScheduledReportService } from '../../../../../lib/services/ScheduledReportService';

const prisma = new PrismaClient();

/**
 * POST /api/reports/scheduled
 * Create a new scheduled report
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, format, frequency, recipients, filters, enabled } = body;

    if (!name || !type || !format || !frequency || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, type, format, frequency, recipients'
      }, { status: 400 });
    }

    const result = await ScheduledReportService.createReport({
      name,
      type,
      format,
      frequency,
      recipients,
      filters,
      enabled: enabled !== false, // Default to true
    }, prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reportId: result.reportId,
    });

  } catch (error) {
    console.error('[Scheduled Reports API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create scheduled report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/reports/scheduled
 * Get all scheduled reports
 */
export async function GET(req: NextRequest) {
  try {
    const result = await ScheduledReportService.getReports(prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reports: result.reports || [],
    });

  } catch (error) {
    console.error('[Scheduled Reports API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get scheduled reports'
    }, { status: 500 });
  }
}

