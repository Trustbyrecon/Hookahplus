import { NextRequest, NextResponse } from 'next/server';
import { approveAdjustment } from '../../../../../../../lib/session-adjustments';
import { hasRole, getCurrentUser } from '../../../../../../../lib/auth';

/**
 * POST /api/sessions/[id]/adjustments/[adjustmentId]/approve
 * Approve an adjustment (manager only)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; adjustmentId: string } }
) {
  try {
    const { adjustmentId } = params;

    // Check manager permissions
    const isManager = await hasRole(req, ['admin', 'owner']);
    if (!isManager) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Manager role required.' },
        { status: 403 }
      );
    }

    // Get current user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Approve adjustment
    const adjustment = await approveAdjustment(adjustmentId, user.id);

    return NextResponse.json({
      success: true,
      adjustment,
      message: 'Adjustment approved',
    });

  } catch (error) {
    console.error('Error approving adjustment:', error);
    return NextResponse.json(
      {
        error: 'Failed to approve adjustment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

