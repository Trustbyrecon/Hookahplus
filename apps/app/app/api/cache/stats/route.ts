import { NextRequest, NextResponse } from 'next/server';
import { cache } from '../../../../lib/cache';

/**
 * GET /api/cache/stats
 * Get cache statistics for monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const stats = cache.getStats();
    
    return NextResponse.json({
      success: true,
      cache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cache Stats API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get cache statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

