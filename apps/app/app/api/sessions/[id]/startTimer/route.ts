import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logSessionEvent } from '../../../../lib/session-events';

const prisma = new PrismaClient();

/**
 * POST /api/sessions/[id]/startTimer
 * Start the session timer
 * 
 * Body: {
 *   durationMinutes?: number (optional, defaults from session config)
 *   staffId?: string
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const body = await req.json();
    const { durationMinutes, staffId } = body;

    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Calculate timer duration (in seconds)
    const timerDuration = durationMinutes
      ? durationMinutes * 60
      : session.timerDuration || 45 * 60; // Default 45 minutes

    // Update session with timer
    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: {
        timerDuration: timerDuration,
        timerStartedAt: new Date(),
        timerStatus: 'running',
        state: 'ACTIVE',
        startedAt: session.startedAt || new Date()
      }
    });

    // Log session event (append-only ledger)
    await logSessionEvent({
      eventType: 'started',
      sessionId,
      eventData: {
        durationMinutes: timerDuration / 60,
        startedAt: updated.timerStartedAt?.toISOString(),
        state: 'ACTIVE',
      },
      actorId: staffId,
      actorRole: 'staff',
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId: session.loungeId,
        userId: staffId,
        action: 'TIMER_STARTED',
        entityType: 'Session',
        entityId: sessionId,
        changes: JSON.stringify({
          durationMinutes: timerDuration / 60,
          startedAt: updated.timerStartedAt?.toISOString()
        })
      }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: updated.id,
        timerDuration: updated.timerDuration,
        timerStartedAt: updated.timerStartedAt?.toISOString(),
        timerStatus: updated.timerStatus,
        state: updated.state
      }
    });

  } catch (error) {
    console.error('Error starting timer:', error);
    return NextResponse.json(
      {
        error: 'Failed to start timer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

