import { NextRequest, NextResponse } from 'next/server';
import { addEvent, EventRecord } from "@/app/lib/badgeStores.switch";
import { getAuthContext, requireRole, canAccessProfile, canAccessVenue } from "@/app/lib/auth";
import { logAuditEvent, isCrossVenueOperation } from "@/app/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const authContext = getAuthContext(request);
    
    // Only staff and admin can add events
    if (!requireRole('staff', authContext.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, profileId, venueId, comboHash, staffId } = body;

    if (!type || !profileId) {
      return NextResponse.json(
        { success: false, error: 'type and profileId are required' },
        { status: 400 }
      );
    }

    // Check if user can access this profile
    if (!canAccessProfile(profileId, authContext)) {
      return NextResponse.json(
        { success: false, error: 'Cannot access profile' },
        { status: 403 }
      );
    }

    // Check if user can access this venue
    if (venueId && !canAccessVenue(venueId, authContext)) {
      return NextResponse.json(
        { success: false, error: 'Cannot access venue' },
        { status: 403 }
      );
    }

    const eventRecord: EventRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ts: Date.now(),
      type,
      profileId,
      venueId: venueId || null,
      comboHash: comboHash || null,
      staffId: staffId || authContext.actorId || null,
    };

    await addEvent(eventRecord);

    // Log audit event
    await logAuditEvent(
      isCrossVenueOperation(authContext, venueId) ? 'cross_venue_write' : 'event_created',
      authContext,
      {
        eventId: eventRecord.id,
        type,
        profileId,
        venueId,
        comboHash,
        staffId
      },
      {
        ip: request.ip,
        userAgent: request.headers.get('user-agent') || undefined
      }
    );

    return NextResponse.json({
      success: true,
      data: { eventId: eventRecord.id }
    });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add event' },
      { status: 500 }
    );
  }
}
