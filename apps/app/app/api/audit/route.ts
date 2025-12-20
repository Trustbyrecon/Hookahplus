import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuditLogService } from '../../../../lib/services/AuditLogService';

const prisma = new PrismaClient();

/**
 * GET /api/audit
 * Get audit logs with filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') as any;
    const resource = searchParams.get('resource');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    const result = await AuditLogService.getLogs({
      userId: userId || undefined,
      action,
      resource: resource || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
    }, prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      logs: result.logs || [],
      count: result.logs?.length || 0,
    });

  } catch (error) {
    console.error('[Audit API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get audit logs'
    }, { status: 500 });
  }
}

/**
 * POST /api/audit/export
 * Export audit logs
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate, endDate, format } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: startDate and endDate'
      }, { status: 400 });
    }

    const result = await AuditLogService.exportLogs({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      format: format || 'csv',
    }, prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': format === 'json' ? 'application/json' : 'text/csv',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    });

  } catch (error) {
    console.error('[Audit Export API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to export audit logs'
    }, { status: 500 });
  }
}

