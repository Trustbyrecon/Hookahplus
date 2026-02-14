import { NextRequest, NextResponse } from 'next/server';
import { cache } from '../../../../lib/cache';

/**
 * POST /api/cache/clear
 * Clear all cache entries (admin/maintenance endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const statsBefore = cache.getStats();
    cache.invalidateAll();
    const statsAfter = cache.getStats();
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      before: statsBefore,
      after: statsAfter,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cache Clear API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

