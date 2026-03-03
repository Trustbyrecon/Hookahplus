import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logSessionEvent } from '@/lib/session-events';

const prisma = new PrismaClient();

/**
 * POST /api/sessions/[id]/pause
 * Pause the session timer (e.g., clearing table)
 * 
 * Body: {
 *   staffId?: string
 *   reason?: string
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();
    const { staffId, reason } = body;

    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.timerStatus !== 'running') {
      return NextResponse.json(
        { error: 'Timer is not running. Cannot pause.' },
        { status: 400 }
      );
    }

    // Calculate elapsed time before pause
    const now = new Date();
    const startedAt = session.timerStartedAt || session.startedAt || now;
    const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

    // Update session - pause timer
    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: {
        timerStatus: 'paused',
        timerPausedAt: now,
        paused: true,
        edgeNote: reason ? `Paused: ${reason}` : 'Session paused'
      }
    });

    // Log session event (append-only ledger)
    await logSessionEvent({
      eventType: 'paused',
      sessionId,
      eventData: {
        elapsedSeconds,
        reason: reason || null,
        timerPausedAt: now.toISOString(),
      },
      actorId: staffId,
      actorRole: 'staff',
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId: session.loungeId,
        userId: staffId,
        action: 'TIMER_PAUSED',
        entityType: 'Session',
        entityId: sessionId,
        changes: JSON.stringify({
          elapsedSeconds,
          reason: reason || null
        })
      }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: updated.id,
        timerStatus: updated.timerStatus,
        timerPausedAt: updated.timerPausedAt?.toISOString(),
        paused: updated.paused
      }
    });

  } catch (error) {
    console.error('Error pausing session:', error);
    return NextResponse.json(
      {
        error: 'Failed to pause session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

