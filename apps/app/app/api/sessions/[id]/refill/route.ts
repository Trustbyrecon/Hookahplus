import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { convertPrismaSessionToFireSession } from '../../../../../lib/session-utils-prisma';
import { canRefillSession } from '../../../../../lib/session-utils';

/**
 * POST /api/sessions/[id]/refill
 * 
 * Request a refill for an active session
 * 
 * Flow:
 * 1. Validate session can be refilled
 * 2. Update session refill status to 'requested'
 * 3. Notify BOH to prepare new coals
 * 4. Return updated session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const body = await request.json();
    const { userRole = 'FOH', operatorId } = body;

    // Find session
    const dbSession = await prisma.session.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { externalRef: sessionId },
          { tableId: sessionId }
        ]
      }
    });

    if (!dbSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
          details: `Session ${sessionId} not found`
        },
        { status: 404 }
      );
    }

    // Convert to FireSession format
    const fireSession = convertPrismaSessionToFireSession(dbSession);

    // Validate session can be refilled
    const validation = canRefillSession(fireSession);
    if (!validation.canRefill) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot refill session',
          details: validation.reason || 'Session cannot be refilled'
        },
        { status: 400 }
      );
    }

    // Update session with refill request
    // Note: We store refill status in a JSON field or use edgeCase for now
    // In production, you'd have a dedicated refillStatus column
    const updatedSession = await prisma.session.update({
      where: { id: dbSession.id },
      data: {
        edgeCase: 'refill_requested',
        edgeNote: `Refill requested by ${operatorId || userRole} at ${new Date().toISOString()}`,
        updatedAt: new Date()
      }
    });

    // Log refill request event
    try {
      await prisma.reflexEvent.create({
        data: {
          type: 'session.refill_requested',
          source: 'api',
          sessionId: dbSession.id,
          payload: JSON.stringify({
            action: 'request_refill',
            operatorId: operatorId || userRole,
            businessLogic: 'Refill requested - BOH should prepare new coals'
          }),
          payloadHash: `refill_${dbSession.id}_${Date.now()}`
        }
      });
    } catch (eventError) {
      console.warn('[Refill API] Failed to create analytics event:', eventError);
    }

    const updatedFireSession = convertPrismaSessionToFireSession(updatedSession);

    return NextResponse.json({
      success: true,
      session: updatedFireSession,
      message: 'Refill requested successfully',
      businessLogic: 'Refill requested - BOH notified to prepare new coals'
    });

  } catch (error: any) {
    console.error('[Refill API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to request refill',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sessions/[id]/refill
 * 
 * Complete a refill (BOH marks refill as delivered)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const body = await request.json();
    const { userRole = 'BOH', operatorId } = body;

    // Find session
    const dbSession = await prisma.session.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { externalRef: sessionId },
          { tableId: sessionId }
        ]
      }
    });

    if (!dbSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found'
        },
        { status: 404 }
      );
    }

    // Check if refill was requested
    if (dbSession.edgeCase !== 'refill_requested') {
      return NextResponse.json(
        {
          success: false,
          error: 'No refill request found',
          details: 'Session does not have a pending refill request'
        },
        { status: 400 }
      );
    }

    // Complete refill - clear refill status and update refill metadata
    const currentRefillCount: number =
      typeof (dbSession as any).refillCount === 'number'
        ? (dbSession as any).refillCount
        : typeof (dbSession as any).refill_count === 'number'
          ? (dbSession as any).refill_count
          : 0;

    const updatedSession = await prisma.session.update({
      where: { id: dbSession.id },
      data: {
        edgeCase: null,
        edgeNote: `Refill completed by ${operatorId || userRole} at ${new Date().toISOString()}`,
        updatedAt: new Date(),
        hadRefill: true,
        refillCount: currentRefillCount + 1
      }
    });

    // Log refill completion event
    try {
      await prisma.reflexEvent.create({
        data: {
          type: 'session.refill_completed',
          source: 'api',
          sessionId: dbSession.id,
          payload: JSON.stringify({
            action: 'complete_refill',
            operatorId: operatorId || userRole,
            businessLogic: 'Refill completed - new coals delivered to customer'
          }),
          payloadHash: `refill_complete_${dbSession.id}_${Date.now()}`
        }
      });
    } catch (eventError) {
      console.warn('[Refill API] Failed to create analytics event:', eventError);
    }

    const updatedFireSession = convertPrismaSessionToFireSession(updatedSession);

    return NextResponse.json({
      success: true,
      session: updatedFireSession,
      message: 'Refill completed successfully',
      businessLogic: 'Refill completed - new coals delivered to customer'
    });

  } catch (error: any) {
    console.error('[Refill API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete refill',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
