import { NextRequest, NextResponse } from 'next/server';
import { deleteLoungeData, getRetentionPolicy } from '../../../../../lib/data-retention';
import { hasRole, getCurrentTenant } from '../../../../../lib/auth';

/**
 * DELETE /api/lounges/[loungeId]/data
 * Delete lounge data (admin only, guarded)
 * Requires explicit confirmation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const body = await req.json();
    const { confirm, deleteBefore, retainAuditLogs = true } = body;

    // Require explicit confirmation
    if (confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json(
        { 
          error: 'Deletion requires explicit confirmation',
          hint: 'Send { "confirm": "DELETE_ALL_DATA" } in request body',
        },
        { status: 400 }
      );
    }

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

    // Delete data
    const result = await deleteLoungeData(loungeId, {
      deleteBefore: deleteBefore ? new Date(deleteBefore) : undefined,
      retainAuditLogs,
    });

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      retained: result.retained,
      message: 'Data deleted successfully. Audit logs retained for compliance.',
    });

  } catch (error) {
    console.error('Error deleting lounge data:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lounges/[loungeId]/data
 * Get retention policy for lounge
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

    const policy = await getRetentionPolicy(loungeId);

    return NextResponse.json({
      success: true,
      policy,
    });

  } catch (error) {
    console.error('Error getting retention policy:', error);
    return NextResponse.json(
      {
        error: 'Failed to get retention policy',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

