import { NextRequest, NextResponse } from 'next/server';
import {
  getEntityAuditLogs,
  replayEntityAuditLogs,
  getLoungeAuditLogs,
  getAuditTrailSummary,
  exportAuditLogs
} from '../../../../lib/audit/replay';

/**
 * GET /api/audit/replay
 * Get audit logs or replay entity state
 * 
 * Query params:
 *   - entityType: string (required for entity logs)
 *   - entityId: string (required for entity logs)
 *   - loungeId: string (required for lounge logs)
 *   - userId: string (optional, for user logs)
 *   - startDate: ISO string (optional)
 *   - endDate: ISO string (optional)
 *   - action: "logs" | "replay" | "summary" | "export" (default: "logs")
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const loungeId = searchParams.get('loungeId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const action = searchParams.get('action') || 'logs';

    if (action === 'replay') {
      if (!entityType || !entityId) {
        return NextResponse.json(
          { error: 'entityType and entityId are required for replay' },
          { status: 400 }
        );
      }

      const result = await replayEntityAuditLogs(entityType, entityId);

      return NextResponse.json({
        success: result.success,
        result
      });
    }

    if (action === 'summary') {
      if (!loungeId || !startDate || !endDate) {
        return NextResponse.json(
          { error: 'loungeId, startDate, and endDate are required for summary' },
          { status: 400 }
        );
      }

      const summary = await getAuditTrailSummary(
        loungeId,
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json({
        success: true,
        summary
      });
    }

    if (action === 'export') {
      if (!loungeId || !startDate || !endDate) {
        return NextResponse.json(
          { error: 'loungeId, startDate, and endDate are required for export' },
          { status: 400 }
        );
      }

      const logs = await exportAuditLogs(
        loungeId,
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json({
        success: true,
        logs,
        count: logs.length
      });
    }

    // Default: get logs
    if (entityType && entityId) {
      const logs = await getEntityAuditLogs(entityType, entityId);
      return NextResponse.json({
        success: true,
        logs,
        count: logs.length
      });
    }

    if (loungeId) {
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: 7 days
      const end = endDate ? new Date(endDate) : new Date();

      const logs = await getLoungeAuditLogs(loungeId, start, end);
      return NextResponse.json({
        success: true,
        logs,
        count: logs.length
      });
    }

    return NextResponse.json(
      { error: 'Must provide entityType+entityId, loungeId, or userId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in audit replay API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process audit request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

