import { NextRequest, NextResponse } from 'next/server';
import { GuestProfile } from "@guest-types";
import { createGhostLogEntry } from '../enter/hash';
import { v4 as uuidv4 } from 'uuid';
import { getGuestProfile, setGuestProfile } from '../shared-storage';

/**
 * POST /api/guest/register
 * 
 * Registers a guest with minimal information (phone or email)
 * Updates existing profile or creates new one
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestId, deviceId, name, phone, email } = body;

    // Validate at least one contact method
    if (!phone && !email) {
      return NextResponse.json({
        ok: false,
        error: 'Phone number or email address is required'
      }, { status: 400 });
    }

    // Use provided guestId or deviceId to look up existing profile
    let profileId = guestId;
    if (!profileId && deviceId) {
      profileId = `anon_${deviceId}`;
    }
    if (!profileId) {
      profileId = `guest_${uuidv4()}`;
    }

    // Get existing profile or create new
    let profile = getGuestProfile(profileId);

    if (!profile) {
      // Create new profile
      profile = {
        guestId: profileId,
        anon: false, // They're registering, so not anonymous
        name: name || undefined,
        phone: phone || undefined,
        email: email || undefined,
        badges: [],
        sessions: [],
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deviceId: deviceId || undefined,
        preferences: {
          favoriteFlavors: [],
          savedMixes: [],
          notifications: true // Opt-in to notifications by default
        }
      };
    } else {
      // Update existing profile
      profile.anon = false;
      if (name) profile.name = name;
      if (phone) profile.phone = phone;
      if (email) profile.email = email;
      profile.updatedAt = new Date().toISOString();
    }

    // Store profile in shared storage
    setGuestProfile(profileId, profile);

    // Log registration event
    const eventPayload = {
      eventType: 'guest.registered',
      guestId: profileId,
      hasPhone: !!phone,
      hasEmail: !!email,
      hasName: !!name,
      timestamp: new Date().toISOString()
    };

    const ghostLogEntry = createGhostLogEntry(eventPayload);
    console.log('Guest Registration Logged:', ghostLogEntry);

    return NextResponse.json({
      ok: true,
      guestId: profileId,
      id: profileId, // Also return as 'id' for compatibility
      deviceId: profile.deviceId,
      profile: {
        guestId: profile.guestId,
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        badges: profile.badges,
        points: profile.points,
        anon: profile.anon
      }
    });

  } catch (error) {
    console.error('Guest registration error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

