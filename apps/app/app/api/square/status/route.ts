import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getCurrentTenant } from '../../../../lib/auth';

/**
 * GET /api/square/status
 * Get Square connection status for a lounge
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loungeId = searchParams.get('loungeId');
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!loungeId) {
      return NextResponse.json(
        { success: false, error: 'Missing loungeId parameter' },
        { status: 400 }
      );
    }

    let tenantId: string | undefined;
    if (!isDevelopment) {
      try {
        tenantId = (await getCurrentTenant()) || undefined;
      } catch (e) {
        // Non-blocking
      }
    }

    const merchant = await prisma.squareMerchant.findUnique({
      where: { loungeId }
    });

    if (!merchant) {
      return NextResponse.json({
        success: true,
        connected: false,
        message: 'Square not connected'
      });
    }

    const isExpired = merchant.expiresAt && merchant.expiresAt < new Date();
    const isActive = merchant.isActive && !isExpired;

    return NextResponse.json({
      success: true,
      connected: true,
      isActive,
      isExpired,
      merchantId: merchant.merchantId,
      locationIds: merchant.locationIds,
      expiresAt: merchant.expiresAt,
      createdAt: merchant.createdAt
    });
  } catch (error) {
    console.error('Error getting Square status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get Square status' },
      { status: 500 }
    );
  }
}

