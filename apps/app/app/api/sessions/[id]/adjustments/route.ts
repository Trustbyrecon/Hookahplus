import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { 
  createAdjustment, 
  getSessionAdjustments, 
  getSessionLedger,
  AdjustmentType 
} from '../../../../../lib/session-adjustments';
import { hasRole, getCurrentUser } from '../../../../../lib/auth';

/**
 * POST /api/sessions/[id]/adjustments
 * Create a new adjustment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();
    const { adjustmentType, amountCents, reason, requiresApproval } = body;

    // Validate required fields
    if (!adjustmentType || !amountCents || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: adjustmentType, amountCents, reason' },
        { status: 400 }
      );
    }

    // Validate adjustment type
    const validTypes: AdjustmentType[] = ['DISCOUNT', 'COMP', 'SURCHARGE', 'REFUND'];
    if (!validTypes.includes(adjustmentType)) {
      return NextResponse.json(
        { error: `Invalid adjustmentType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Get current user for createdBy
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions (staff or manager required)
    const canAdjust = await hasRole(req, ['staff', 'admin', 'owner']);
    if (!canAdjust) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Staff role required.' },
        { status: 403 }
      );
    }

    // Create adjustment
    const adjustment = await createAdjustment({
      sessionId,
      adjustmentType,
      amountCents: Math.round(amountCents), // Ensure integer
      reason,
      createdBy: user.id,
      requiresApproval,
    });

    return NextResponse.json({
      success: true,
      adjustment,
      message: adjustment.approvedBy 
        ? 'Adjustment created and approved' 
        : 'Adjustment created, awaiting manager approval',
    });

  } catch (error) {
    console.error('Error creating adjustment:', error);
    return NextResponse.json(
      {
        error: 'Failed to create adjustment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sessions/[id]/adjustments
 * Get all adjustments for a session, or full ledger
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(req.url);
    const ledger = searchParams.get('ledger') === 'true';

    if (ledger) {
      // Return full ledger (adjustments + pricing snapshot)
      const ledgerData = await getSessionLedger(sessionId);
      return NextResponse.json({
        success: true,
        ledger: ledgerData,
      });
    } else {
      // Return just adjustments
      const adjustments = await getSessionAdjustments(sessionId);
      return NextResponse.json({
        success: true,
        adjustments,
      });
    }

  } catch (error) {
    console.error('Error getting adjustments:', error);
    return NextResponse.json(
      {
        error: 'Failed to get adjustments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

