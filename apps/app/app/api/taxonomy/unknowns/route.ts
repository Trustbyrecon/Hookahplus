/**
 * GET /api/taxonomy/unknowns
 * 
 * Returns top unknown enum values for taxonomy review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTopUnknowns } from '../../../../lib/taxonomy/unknown-tracker';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const enumType = searchParams.get('enumType') as 'SessionState' | 'TrustEventType' | 'DriftReason' | null;
    const windowDays = parseInt(searchParams.get('window') || '7', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const unknowns = await getTopUnknowns(enumType || undefined, windowDays, limit);

    return NextResponse.json({
      success: true,
      unknowns,
      windowDays,
      limit,
      total: unknowns.length
    });
  } catch (error) {
    console.error('[Taxonomy API] Error fetching unknowns:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

