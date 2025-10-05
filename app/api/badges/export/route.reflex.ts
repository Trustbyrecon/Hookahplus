// app/api/badges/export/route.reflex.ts
// Badge Export API with Reflex Integration - Self-aware data export

import { NextRequest, NextResponse } from 'next/server';
import { listAwards, listEvents } from "@/app/lib/badgeStores.switch";
import { getAuthContext, requireRole, canAccessProfile } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { reflexEngine } from "../../../../lib/reflex/reflexEngine";
import type { APIReflexContext, APIReflexResult } from "../../../../types/reflex";

// Simple in-memory token store (in production, use Redis or DB)
const exportTokens = new Map<string, { profileId: string; expiresAt: number; createdBy: string }>();

export async function GET(request: NextRequest): Promise<NextResponse> {
  const context: APIReflexContext = {
    agentId: "export_api_001",
    operationId: `export_data_${Date.now()}`,
    route: "/api/badges/export",
    startTime: Date.now(),
    criticalPath: true,
    endpoint: "/api/badges/export",
    method: "GET",
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role: 'admin', // Will be overridden by actual auth context
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || undefined
  };

  const result = await reflexEngine.executeAPIOperation(context, async () => {
    const authContext = getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const token = searchParams.get('token');

    if (!profileId) {
      throw new Error('profileId is required');
    }

    // Check access via token or direct permission
    if (token) {
      const tokenData = exportTokens.get(token);
      if (!tokenData || tokenData.expiresAt < Date.now()) {
        throw new Error('Invalid or expired token');
      }
      if (tokenData.profileId !== profileId) {
        throw new Error('Token does not match profile');
      }
    } else {
      // Direct access requires admin role or profile ownership
      if (authContext.role !== 'admin' && !canAccessProfile(profileId, authContext)) {
        throw new Error('Insufficient permissions');
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
      data: {
        awards,
        events,
        summary: {
          totalAwards: awards.length,
          totalEvents: events.length,
          uniqueVenues: new Set(events.map((e: any) => e.venueId).filter(Boolean)).size,
          uniqueCombos: new Set(events.filter((e: any) => e.comboHash).map((e: any) => e.comboHash)).size
        }
      },
      metadata: {
        exportVersion: "1.0",
        generatedBy: "reflex_export_api",
        tokenUsed: !!token
      }
    };

    // Log audit event
    await logAuditEvent(
      'data_exported',
      authContext,
      {
        profileId,
        exportType: 'badge_data',
        recordCount: awards.length + events.length,
        tokenUsed: !!token
      },
      {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    );

    return exportData;
  });

  // Handle reflex result
  if (result.requiresHumanReview) {
    console.warn(`[Reflex] Export API requires human review: ${result.nextActions.join(", ")}`);
  }

  if (result.failures.length > 0) {
    console.error(`[Reflex] Export API failures:`, result.failures.map(f => f.type));
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
    console.warn(`[Reflex] Export API in recovery mode: ${result.nextActions.join(", ")}`);
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    reflexScore: result.score.value,
    gateDecision: result.score.gateDecision,
    confidence: result.score.confidence
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const context: APIReflexContext = {
    agentId: "export_token_api_001",
    operationId: `create_export_token_${Date.now()}`,
    route: "/api/badges/export",
    startTime: Date.now(),
    criticalPath: true,
    endpoint: "/api/badges/export",
    method: "POST",
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role: 'admin', // Will be overridden by actual auth context
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || undefined
  };

  const result = await reflexEngine.executeAPIOperation(context, async () => {
    const authContext = getAuthContext(request);
    
    // Only admin can create export tokens
    if (!requireRole('admin', authContext.role)) {
      throw new Error('Insufficient permissions - admin role required');
    }

    const body = await request.json();
    const { profileId, expiresInHours = 24 } = body;

    if (!profileId) {
      throw new Error('profileId is required');
    }

    // Generate export token
    const token = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);

    exportTokens.set(token, {
      profileId,
      expiresAt,
      createdBy: authContext.actorId || 'unknown'
    });

    // Log audit event
    await logAuditEvent(
      'data_exported',
      authContext,
      {
        profileId,
        tokenId: token,
        expiresInHours,
        expiresAt: new Date(expiresAt).toISOString()
      },
      {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    );

    return {
      token,
      profileId,
      expiresAt: new Date(expiresAt).toISOString(),
      expiresInHours
    };
  });

  // Handle reflex result
  if (result.requiresHumanReview) {
    console.warn(`[Reflex] Export Token API requires human review: ${result.nextActions.join(", ")}`);
  }

  if (result.failures.length > 0) {
    console.error(`[Reflex] Export Token API failures:`, result.failures.map(f => f.type));
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
    console.warn(`[Reflex] Export Token API in recovery mode: ${result.nextActions.join(", ")}`);
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    reflexScore: result.score.value,
    gateDecision: result.score.gateDecision,
    confidence: result.score.confidence
  });
}
