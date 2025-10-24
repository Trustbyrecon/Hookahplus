import { NextRequest, NextResponse } from 'next/server';
import { GuestEnterRequest, GuestEnterResponse, GuestProfile, QRData } from '../../../../../types/guest';
import { featureFlags } from './flags';
import { createGhostLogEntry, hashGuestEvent } from './hash';
import { v4 as uuidv4 } from 'uuid';

// Mock data store (in production, this would be a database)
const guestProfiles = new Map<string, GuestProfile>();
const sessions = new Map<string, any>();

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
    const { loungeId, ref, u, deviceId } = body;

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

    // Handle guest token or device ID
    if (u) {
      // Existing guest with token
      guestId = u;
      existingProfile = guestProfiles.get(guestId);
    } else if (deviceId) {
      // Anonymous guest with device ID
      guestId = `anon_${deviceId}`;
      existingProfile = guestProfiles.get(guestId);
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
      
      guestProfiles.set(guestId, newProfile);
      existingProfile = newProfile;
      isNewGuest = true;
    } else {
      // Update existing profile
      existingProfile.lastLoungeId = loungeId;
      existingProfile.updatedAt = new Date().toISOString();
      guestProfiles.set(guestId, existingProfile);
    }

    // Create session if not pre-seeded
    let sessionId: string | undefined;
    if (!body.u) {
      sessionId = `session_${uuidv4()}`;
      sessions.set(sessionId, {
        sessionId,
        loungeId,
        guestId,
        status: 'started',
        startedAt: new Date().toISOString()
      });
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
      existingProfile: isNewGuest ? undefined : existingProfile
    };

    return NextResponse.json({
      ok: true,
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
