import { NextRequest, NextResponse } from 'next/server';
import { ScalabilityService } from '../../../../../lib/services/ScalabilityService';

/**
 * GET /api/scalability/health
 * Health check for scalability services
 */
export async function GET(req: NextRequest) {
  try {
    const health = await ScalabilityService.healthCheck();

    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Scalability Health API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check scalability health'
    }, { status: 500 });
  }
}

