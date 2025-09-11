import { NextRequest, NextResponse } from 'next/server';
import { listAwards, listEvents } from "@/app/lib/badgeStores.switch";
import { getAuthContext, requireRole, canAccessProfile } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";

// Simple in-memory token store (in production, use Redis or DB)
const exportTokens = new Map<string, { profileId: string; expiresAt: number; createdBy: string }>();

export async function GET(request: NextRequest) {
  try {
    const authContext = getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const token = searchParams.get('token');

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'profileId is required' },
        { status: 400 }
      );
    }

    // Check access via token or direct permission
    if (token) {
      const tokenData = exportTokens.get(token);
      if (!tokenData || tokenData.expiresAt < Date.now()) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 403 }
        );
      }
      if (tokenData.profileId !== profileId) {
        return NextResponse.json(
          { success: false, error: 'Token does not match profile' },
          { status: 403 }
        );
      }
    } else {
      // Direct access requires admin role or profile ownership
      if (authContext.role !== 'admin' && !canAccessProfile(profileId, authContext)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Fetch all data for the profile
    const [awards, events] = await Promise.all([
      listAwards(profileId),
      listEvents(profileId)
    ]);

    const exportData = {
      profileId,
      exportedAt: new Date().toISOString(),
      awards,
      events,
      metadata: {
        totalAwards: awards.length,
        totalEvents: events.length,
        exportedBy: token ? 'token' : authContext.actorId || 'system'
      }
    };

    // Log audit event
    await logAuditEvent(
      'data_exported',
      authContext,
      {
        profileId,
        exportType: token ? 'token' : 'direct',
        awardCount: awards.length,
        eventCount: events.length
      },
      {
        ip: request.ip,
        userAgent: request.headers.get('user-agent') || undefined
      }
    );

    return NextResponse.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Badge export API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export badge data' },
      { status: 500 }
    );
  }
}
