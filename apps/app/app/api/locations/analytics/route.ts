import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MultiLocationService } from '../../../../lib/services/MultiLocationService';

const prisma = new PrismaClient();

/**
 * GET /api/locations/analytics
 * Get cross-location analytics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate),
    } : undefined;

    const result = await MultiLocationService.getCrossLocationAnalytics(
      tenantId || undefined,
      dateRange,
      prisma
    );

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analytics: result.analytics,
    });

  } catch (error) {
    console.error('[Cross-Location Analytics API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cross-location analytics'
    }, { status: 500 });
  }
}

