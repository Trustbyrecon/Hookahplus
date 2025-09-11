import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, requireRole } from "@/app/lib/auth";

// Simple in-memory token store (in production, use Redis or DB)
const exportTokens = new Map<string, { profileId: string; expiresAt: number; createdBy: string }>();

export async function POST(request: NextRequest) {
  try {
    const authContext = getAuthContext(request);
    
    // Only admin can create export tokens
    if (!requireRole('admin', authContext.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { profileId, expiresInHours = 24 } = body;

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'profileId is required' },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);

    // Store token
    exportTokens.set(token, {
      profileId,
      expiresAt,
      createdBy: authContext.actorId || 'admin'
    });

    // Clean up expired tokens
    for (const [key, value] of exportTokens.entries()) {
      if (value.expiresAt < Date.now()) {
        exportTokens.delete(key);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        token,
        profileId,
        expiresAt: new Date(expiresAt).toISOString(),
        exportUrl: `/api/badges/export?profileId=${profileId}&token=${token}`
      }
    });
  } catch (error) {
    console.error('Export token API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create export token' },
      { status: 500 }
    );
  }
}
