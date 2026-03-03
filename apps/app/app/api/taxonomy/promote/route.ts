/**
 * POST /api/taxonomy/promote
 * 
 * Promotes an unknown enum value to a suggested mapping
 * Admin only - requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { promoteUnknown } from '../../../../lib/taxonomy/unknown-tracker';

export async function POST(req: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // For now, allow all requests (add auth in production)
    
    const body = await req.json();
    const { enumType, rawLabel, suggestedMapping } = body;

    if (!enumType || !rawLabel || !suggestedMapping) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: enumType, rawLabel, suggestedMapping'
      }, { status: 400 });
    }

    if (!['SessionState', 'TrustEventType', 'DriftReason'].includes(enumType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid enumType. Must be SessionState, TrustEventType, or DriftReason'
      }, { status: 400 });
    }

    await promoteUnknown(enumType, rawLabel, suggestedMapping);

    return NextResponse.json({
      success: true,
      message: `Promoted ${enumType}:${rawLabel} → ${suggestedMapping}`
    });
  } catch (error) {
    console.error('[Taxonomy API] Error promoting unknown:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

