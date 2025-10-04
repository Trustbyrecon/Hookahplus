// app/api/events/route.reflex.ts
// Events API with Reflex Integration - Self-aware event creation

import { NextRequest, NextResponse } from 'next/server';
import { addEvent } from "@/app/lib/badgeStores.switch";
import { getAuthContext, requireRole, canAccessProfile, canAccessVenue } from "@/app/lib/auth";
import { logAuditEvent, isCrossVenueOperation } from "@/app/lib/audit";
import { reflexEngine } from "../../../lib/reflex/reflexEngine";
import type { APIReflexContext, APIReflexResult } from "../../../types/reflex";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const context: APIReflexContext = {
    agentId: "events_api_001",
    operationId: `create_event_${Date.now()}`,
    route: "/api/events",
    startTime: Date.now(),
    criticalPath: true,
    endpoint: "/api/events",
    method: "POST",
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role: 'staff', // Will be overridden by actual auth context
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || undefined
  };

  const result = await reflexEngine.executeAPIOperation(context, async () => {
    const authContext = getAuthContext(request);
    
    // Only staff and admin can add events
    if (!requireRole('staff', authContext.role)) {
      throw new Error('Insufficient permissions');
    }

    const body = await request.json();
    const { type, profileId, venueId, comboHash, staffId } = body;

    if (!type || !profileId) {
      throw new Error('type and profileId are required');
    }

    // Check if user can access this profile
    if (!canAccessProfile(profileId, authContext)) {
      throw new Error('Cannot access profile');
    }

    // Check if user can access this venue
    if (venueId && !canAccessVenue(venueId, authContext)) {
      throw new Error('Cannot access venue');
    }

    const eventRecord: any = {
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
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    );

    return {
      eventId: eventRecord.id,
      success: true,
      timestamp: eventRecord.ts
    };
  });

  // Handle reflex result
  if (result.requiresHumanReview) {
    console.warn(`[Reflex] Events API requires human review: ${result.nextActions.join(", ")}`);
  }

  if (result.failures.length > 0) {
    console.error(`[Reflex] Events API failures:`, result.failures.map(f => f.type));
  }

  // Return response based on reflex score
  if (result.score.gateDecision === "halt") {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Operation halted by reflex system',
        reflexScore: result.score.value,
        failures: result.failures.map(f => f.type)
      },
      { status: 500 }
    );
  }

  if (result.score.gateDecision === "recover") {
    console.warn(`[Reflex] Events API in recovery mode: ${result.nextActions.join(", ")}`);
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    reflexScore: result.score.value,
    gateDecision: result.score.gateDecision,
    confidence: result.score.confidence
  });
}
