import { NextRequest, NextResponse } from 'next/server';
import { sharedSessions } from '../../shared-storage';

export const dynamic = 'force-dynamic';

/**
 * GET /api/guest/session/status?guestId=...
 *
 * Returns the most recent active session for a guest.
 * Used by SessionCard after checkout to show session status.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
      return NextResponse.json(
        { ok: false, error: 'Missing guestId parameter' },
        { status: 400 }
      );
    }

    // Find most recent session for this guest in sharedSessions
    let bestSession: { sessionId: string; session: any } | null = null;
    for (const [sid, session] of sharedSessions) {
      if (session?.guestId === guestId) {
        const status = session.status || 'pending';
        // Prefer in_progress, then started, then pending
        if (!bestSession) {
          bestSession = { sessionId: sid, session };
        } else {
          const bestStatus = bestSession.session.status || 'pending';
          const order = { in_progress: 3, started: 2, served: 1, pending: 0, closed: -1, cancelled: -1 };
          if ((order[status as keyof typeof order] ?? 0) > (order[bestStatus as keyof typeof order] ?? 0)) {
            bestSession = { sessionId: sid, session };
          }
        }
      }
    }

    if (!bestSession) {
      return NextResponse.json({ ok: true, session: null });
    }

    const { sessionId, session } = bestSession;
    const startedAt = session.ts?.startedAt || session.ts?.createdAt || new Date().toISOString();

    // Optional: compute timeRemaining for in_progress (e.g. 60 min default)
    let timeRemaining: number | undefined;
    if (session.status === 'in_progress') {
      const durationMin = 60; // default session length
      const started = new Date(startedAt).getTime();
      const elapsedSec = Math.floor((Date.now() - started) / 1000);
      timeRemaining = Math.max(0, durationMin * 60 - elapsedSec);
    }

    return NextResponse.json({
      ok: true,
      session: {
        sessionId,
        status: session.status || 'started',
        startedAt,
        estimatedWait: 5,
        tableId: session.tableId,
        timeRemaining,
      },
    });
  } catch (error) {
    console.error('[guest/session/status] error', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to get session status' },
      { status: 500 }
    );
  }
}
