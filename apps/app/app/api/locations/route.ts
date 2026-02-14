import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MultiLocationService } from '../../../lib/services/MultiLocationService';

const prisma = new PrismaClient();

/**
 * GET /api/locations
 * Get all locations for a tenant
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    const result = await MultiLocationService.getLocations(tenantId || undefined, prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      locations: result.locations || [],
    });

  } catch (error) {
    console.error('[Locations API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get locations'
    }, { status: 500 });
  }
}

