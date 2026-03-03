import { NextRequest, NextResponse } from 'next/server';
import { SessionStartRequest, SessionStartResponse, Session } from "@guest-types";
import { featureFlags } from './flags';
import { createGhostLogEntry, hashSessionEvent } from './hash';
import { v4 as uuidv4 } from 'uuid';

// Mock data stores
const sessions = new Map<string, Session>();
const guestProfiles = new Map<string, any>();

/**
 * POST /api/guest/session/start
 * 
 * Starts a new session for a guest
 */
export async function POST(req: NextRequest) {
  try {
    const body: SessionStartRequest = await req.json();
    const { loungeId, guestId, tableId } = body as any;
    const notMe = Boolean((body as any).notMe);

    // Validate required fields
    if (!loungeId || !guestId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required fields: loungeId, guestId'
      }, { status: 400 });
    }

    // Get feature flags
    const flags = featureFlags.getLoungeFlags(loungeId);

    // Check if guest features are enabled
    if (!flags.guest.enabled) {
      return NextResponse.json({
        ok: false,
        error: 'Guest features are not enabled for this lounge'
      }, { status: 403 });
    }

    if (!tableId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required field: tableId'
      }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const resolveResp = await fetch(`${appUrl}/api/session/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loungeId,
        tableId,
        identityToken: guestId,
        displayName: 'Guest',
        notMe,
      }),
    });
    const resolveData = await resolveResp.json().catch(() => ({}));

    if (!resolveResp.ok || resolveData?.blocked) {
      return NextResponse.json({
        ok: false,
        blocked: true,
        error: resolveData?.message || 'We need staff to confirm your table before continuing.',
        conflictSessionIds: resolveData?.conflictSessionIds || [],
      }, { status: 409 });
    }

    const sessionId = resolveData.session_id as string;

    // Update guest profile
    const guestProfile = guestProfiles.get(guestId);
    if (guestProfile) {
      guestProfile.sessions.unshift(sessionId);
      guestProfile.updatedAt = new Date().toISOString();
      guestProfiles.set(guestId, guestProfile);
    }

    // Log session start event
    if (flags.ghostlog.lite) {
      const eventPayload = {
        sessionId,
        loungeId,
        guestId,
        tableId,
        timestamp: new Date().toISOString()
      };

      const ghostLogEntry = createGhostLogEntry({
        eventType: 'session.started',
        ...eventPayload
      });
      console.log('Session start logged:', ghostLogEntry);
    }

    // Calculate estimated wait time (mock)
    const estimatedWait = Math.floor(Math.random() * 15) + 5; // 5-20 minutes

    const response: SessionStartResponse = {
      sessionId,
      tableId,
      estimatedWait
    };

    return NextResponse.json({
      ok: true,
      participantId: resolveData.participant_id,
      mode: resolveData.mode,
      ...response
    });

  } catch (error) {
    console.error('Session start error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * GET /api/guest/session/start
 * 
 * Gets session status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing sessionId parameter'
      }, { status: 400 });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({
        ok: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      session
    });

  } catch (error) {
    console.error('Session status error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
