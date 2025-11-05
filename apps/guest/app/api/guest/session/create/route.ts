import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sharedSessions, getGuestProfile } from '../../shared-storage';
import { createGhostLogEntry } from '../hash';
import { featureFlags } from '../flags';

/**
 * POST /api/guest/session/create
 * 
 * Creates a new session with selected flavors
 * This is called when guest selects flavors and is ready to checkout
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestId, loungeId, flavors, specialInstructions, tableId, zone } = body;

    // Validate required fields
    if (!guestId || !loungeId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required fields: guestId, loungeId'
      }, { status: 400 });
    }

    // Verify guest exists
    const guestProfile = getGuestProfile(guestId);
    if (!guestProfile) {
      return NextResponse.json({
        ok: false,
        error: 'Guest not found'
      }, { status: 404 });
    }

    // Create session
    const sessionId = `session_${uuidv4()}`;
    const session = {
      sessionId,
      guestId,
      loungeId,
      tableId: tableId || undefined,
      zone: zone || undefined,
      status: 'pending', // Pending payment
      mix: {
        flavors: flavors || [],
        specialInstructions: specialInstructions || undefined
      },
      price: {
        base: 0,
        addons: 0,
        total: 0,
        currency: 'USD'
      },
      ts: {
        createdAt: new Date().toISOString(),
        startedAt: undefined,
        closedAt: undefined
      }
    };

    sharedSessions.set(sessionId, session);

    // Log session creation
    const flags = featureFlags.getLoungeFlags(loungeId);
    if (flags.ghostlog.lite) {
      const eventPayload = {
        eventType: 'session.created',
        sessionId,
        guestId,
        loungeId,
        flavors: flavors || [],
        timestamp: new Date().toISOString()
      };

      const ghostLogEntry = createGhostLogEntry(eventPayload);
      console.log('Session created logged:', ghostLogEntry);
    }

    return NextResponse.json({
      ok: true,
      sessionId,
      session
    });

  } catch (error) {
    console.error('Create session error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

