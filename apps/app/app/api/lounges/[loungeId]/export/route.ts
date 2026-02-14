import { NextRequest, NextResponse } from 'next/server';
import { exportLoungeData } from '../../../../../lib/data-retention';
import { hasRole, getCurrentTenant } from '../../../../../lib/auth';

/**
 * GET /api/lounges/[loungeId]/export
 * Export lounge data (admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;

    // Check admin permissions
    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    // Verify tenant access
    const tenantId = await getCurrentTenant(req);
    if (tenantId !== loungeId) {
      return NextResponse.json(
        { error: 'Access denied to this lounge' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includeStaffNotes = searchParams.get('includeStaffNotes') === 'true';
    const format = (searchParams.get('format') || 'json') as 'json' | 'csv';
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const exportData = await exportLoungeData(loungeId, {
      includeStaffNotes,
      format,
      startDate,
      endDate,
    });

    // Return as JSON (CSV conversion can be done client-side if needed)
    return NextResponse.json({
      success: true,
      data: exportData,
    });

  } catch (error) {
    console.error('Error exporting lounge data:', error);
    return NextResponse.json(
      {
        error: 'Failed to export data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

