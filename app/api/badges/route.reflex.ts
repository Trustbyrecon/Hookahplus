// app/api/badges/route.reflex.ts
// Badges API with Reflex Integration - Self-aware badge retrieval

import { NextRequest, NextResponse } from 'next/server';
import { listAwards } from "@/app/lib/badgeStores.switch";
import { getAuthContext, canAccessProfile, canAccessVenue } from "@/app/lib/auth";
import { logAuditEvent, isCrossVenueOperation } from "@/app/lib/audit";
import { reflexEngine } from "../../../lib/reflex/reflexEngine";
import type { APIReflexContext, APIReflexResult } from "../../../types/reflex";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const context: APIReflexContext = {
    agentId: "badges_api_001",
    operationId: `get_badges_${Date.now()}`,
    route: "/api/badges",
    startTime: Date.now(),
    criticalPath: false,
    endpoint: "/api/badges",
    method: "GET",
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role: 'staff', // Will be overridden by actual auth context
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || undefined
  };

  const result = await reflexEngine.executeAPIOperation(context, async () => {
    const authContext = getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const venueId = searchParams.get('venueId');

    if (!profileId) {
      throw new Error('profileId is required');
    }

    // Check if user can access this profile
    if (!canAccessProfile(profileId, authContext)) {
      throw new Error('Cannot access profile');
    }

    // Check if user can access this venue
    if (venueId && !canAccessVenue(venueId, authContext)) {
      throw new Error('Cannot access venue');
    }

    const awards = await listAwards(profileId);
    
    // Filter by venue if specified
    const filteredAwards = venueId 
      ? awards.filter((a: any) => a.venueId === venueId)
      : awards;

    // Log audit event
    await logAuditEvent(
      isCrossVenueOperation(authContext, venueId || undefined) ? 'cross_venue_read' : 'profile_accessed',
      authContext,
      {
        profileId,
        venueId,
        awardCount: filteredAwards.length
      },
      {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    );

    return {
      awards: filteredAwards,
      count: filteredAwards.length,
      profileId,
      venueId
    };
  });

  // Handle reflex result
  if (result.requiresHumanReview) {
    console.warn(`[Reflex] Badges API requires human review: ${result.nextActions.join(", ")}`);
  }

  if (result.failures.length > 0) {
    console.error(`[Reflex] Badges API failures:`, result.failures.map(f => f.type));
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
    console.warn(`[Reflex] Badges API in recovery mode: ${result.nextActions.join(", ")}`);
  }

  return NextResponse.json({
    success: true,
    data: result.data?.awards || [],
    count: result.data?.count || 0,
    reflexScore: result.score.value,
    gateDecision: result.score.gateDecision,
    confidence: result.score.confidence
  });
}
