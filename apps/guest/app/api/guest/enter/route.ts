import { NextRequest, NextResponse } from 'next/server';
import { GuestEnterRequest, GuestEnterResponse, GuestProfile, QRData } from "@guest-types";
import { featureFlags } from './flags';
import { createGhostLogEntry, hashGuestEvent } from './hash';
import { v4 as uuidv4 } from 'uuid';
import { getGuestProfile, setGuestProfile } from '../shared-storage';

/**
 * POST /api/guest/enter
 * 
 * Handles guest entry via QR code scan
 * Creates or retrieves guest profile
 * Starts session if pre-seeded
 */
export async function POST(req: NextRequest) {
  try {
    const body: GuestEnterRequest = await req.json();
    const { loungeId, ref, u, deviceId, guestId: providedGuestId } = body as any;
    const tableId = typeof (body as any).tableId === 'string' ? (body as any).tableId : undefined;
    const notMe = Boolean((body as any).notMe);

    // Validate required fields
    if (!loungeId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required field: loungeId'
      }, { status: 400 });
    }

    // Get feature flags for this lounge
    const flags = featureFlags.getLoungeFlags(loungeId);

    // Check if guest features are enabled
    if (!flags.guest.enabled) {
      return NextResponse.json({
        ok: false,
        error: 'Guest features are not enabled for this lounge'
      }, { status: 403 });
    }

    let guestId: string;
    let isNewGuest = false;
    let existingProfile: GuestProfile | undefined;

    // Handle guest identification priority: u (token) > providedGuestId > deviceId > new anonymous
    if (u) {
      // Existing guest with token
      guestId = u;
      existingProfile = getGuestProfile(guestId);
    } else if (providedGuestId) {
      // Registered guest with guestId from localStorage
      guestId = providedGuestId;
      existingProfile = getGuestProfile(guestId);
    } else if (deviceId) {
      // Anonymous guest with device ID
      guestId = `anon_${deviceId}`;
      existingProfile = getGuestProfile(guestId);
    } else {
      // New anonymous guest
      guestId = `anon_${uuidv4()}`;
      isNewGuest = true;
    }

    // Create new profile if needed
    if (!existingProfile) {
      const newProfile: GuestProfile = {
        guestId,
        anon: true,
        lastLoungeId: loungeId,
        badges: [],
        sessions: [],
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deviceId: deviceId || undefined,
        preferences: {
          favoriteFlavors: [],
          savedMixes: [],
          notifications: false
        }
      };
      
      setGuestProfile(guestId, newProfile);
      existingProfile = newProfile;
      isNewGuest = true;
    } else {
      // Update existing profile
      existingProfile.lastLoungeId = loungeId;
      existingProfile.updatedAt = new Date().toISOString();
      setGuestProfile(guestId, existingProfile);
    }

    // Resolve session/participant deterministically when table context exists.
    let sessionId: string | undefined;
    let participantId: string | undefined;
    let resolveMode: 'create' | 'join' | 'rejoin' | 'blocked_multi_active' | undefined;
    if (tableId) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
      const resolveResp = await fetch(`${appUrl}/api/session/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loungeId,
          tableId,
          identityToken: deviceId || guestId || u || `anon-${uuidv4()}`,
          displayName: existingProfile?.anon ? 'Guest' : (existingProfile as any)?.displayName || 'Guest',
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

      sessionId = resolveData.session_id;
      participantId = resolveData.participant_id;
      resolveMode = resolveData.mode;
    } else {
      // Canonical enforcement: do not create any session without explicit table context.
      return NextResponse.json(
        {
          ok: false,
          error: 'MISSING_TABLE_CONTEXT',
          message: 'This link does not include a table. Scan the QR code on your table to continue.',
          next: 'ASK_STAFF_FOR_TABLE_QR',
        },
        { status: 400 }
      );
    }

    // Log guest entry event
    if (flags.ghostlog.lite) {
      const eventPayload = {
        eventType: 'guest.entered',
        loungeId,
        guestId,
        ref,
        isNewGuest,
        deviceId,
        sessionId,
        referralSource: ref ? 'partner' : 'direct'
      };

      const ghostLogEntry = createGhostLogEntry(eventPayload);
      
      // In production, store the ghost log entry
      console.log('GhostLog Entry:', ghostLogEntry);
    }

    // Handle referral tracking
    if (ref && flags.referral.qr.v1) {
      // Track referral click
      console.log(`Referral tracked: ${ref} for guest ${guestId} at lounge ${loungeId}`);
      
      // Log partner referral event to GhostLog
      if (flags.ghostlog.lite) {
        const referralEvent = {
          eventType: 'partner.referral.used',
          partnerId: ref,
          loungeId,
          guestId,
          sessionId,
          timestamp: new Date().toISOString()
        };
        
        const referralLogEntry = createGhostLogEntry(referralEvent);
        console.log('Partner Referral Logged:', referralLogEntry);
      }
      
      // In production, update referral analytics
    }

    const response: GuestEnterResponse = {
      guestId,
      sessionId,
      flags,
      isNewGuest,
      existingProfile: existingProfile // Always return profile (even if new)
    };

    return NextResponse.json({
      ok: true,
      participantId,
      mode: resolveMode,
      ...response
    });

  } catch (error) {
    console.error('Guest enter error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * GET /api/guest/enter
 * 
 * Validates QR code data and returns lounge information
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = searchParams.get('loungeId');
    const ref = searchParams.get('ref');
    const s = searchParams.get('s');
    const u = searchParams.get('u');

    if (!loungeId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing loungeId parameter'
      }, { status: 400 });
    }

    // Get feature flags
    const flags = featureFlags.getLoungeFlags(loungeId);

    // Mock lounge data (in production, fetch from database)
    const loungeData = {
      loungeId,
      name: 'Hookah Paradise Downtown',
      address: '123 Main St, Downtown',
      phone: '(555) 123-4567',
      hours: 'Mon-Sun: 6PM-2AM',
      features: ['VIP Lounge', 'Outdoor Patio', 'Live Music', 'Full Bar'],
      timezone: 'America/New_York',
      currency: 'USD',
      taxRate: 0.0875
    };

    const qrData: QRData = {
      loungeId,
      ref: ref || undefined,
      s: s || undefined,
      u: u || undefined
    };

    return NextResponse.json({
      ok: true,
      lounge: loungeData,
      qrData,
      flags
    });

  } catch (error) {
    console.error('QR validation error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
