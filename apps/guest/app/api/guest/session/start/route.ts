import { NextRequest, NextResponse } from 'next/server';
import { SessionStartRequest, SessionStartResponse, Session } from '../../../../../../types/guest';
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
    const { loungeId, guestId, tableId } = body;

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

    // Generate session ID
    const sessionId = `session_${uuidv4()}`;

    // Create trust stamp
    const trustStamp = hashSessionEvent({
      sessionId,
      eventType: 'session.started',
      loungeId,
      guestId,
      tableId
    });

    // Create session
    const session: Session = {
      sessionId,
      loungeId,
      guestId,
      mix: {
        flavors: [],
        notes: ''
      },
      price: {
        base: 0,
        addons: 0,
        total: 0,
        currency: 'USD'
      },
      status: 'started',
      ts: {
        startedAt: new Date().toISOString()
      },
      trust: {
        ghostHash: trustStamp,
        signature: trustStamp
      },
      tableId
    };

    // Store session
    sessions.set(sessionId, session);

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
        timestamp: session.ts.startedAt
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
