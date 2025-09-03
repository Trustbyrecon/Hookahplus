import { NextRequest, NextResponse } from 'next/server';
import { listAwards } from "@/app/lib/badgeStores.switch";
import { getAuthContext, canAccessProfile, canAccessVenue } from "@/app/lib/auth";
import { logAuditEvent, isCrossVenueOperation } from "@/app/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const authContext = getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const venueId = searchParams.get('venueId');

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'profileId is required' },
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

    const awards = await listAwards(profileId);
    
    // Filter by venue if specified
    const filteredAwards = venueId 
      ? awards.filter(a => a.venueId === venueId)
      : awards;

    // Log audit event
    await logAuditEvent(
      isCrossVenueOperation(authContext, venueId) ? 'cross_venue_read' : 'profile_accessed',
      authContext,
      {
        profileId,
        venueId,
        awardCount: filteredAwards.length
      },
      {
        ip: request.ip,
        userAgent: request.headers.get('user-agent') || undefined
      }
    );

    return NextResponse.json({
      success: true,
      data: filteredAwards
    });
  } catch (error) {
    console.error('Badges API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
