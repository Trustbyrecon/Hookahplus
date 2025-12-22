import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { decrypt } from '../../../../lib/utils/encryption';
import { SquareOAuth } from '../../../../lib/square/oauth';
import { getCurrentTenant } from '../../../../lib/auth';

/**
 * POST /api/square/disconnect
 * Disconnect Square account for a lounge
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loungeId } = body;
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
        const tenant = await getCurrentTenant();
        tenantId = tenant?.id;
      } catch (e) {
        // Non-blocking
      }
    }

    // Get merchant to revoke token
    const merchant = await prisma.squareMerchant.findUnique({
      where: { loungeId }
    });

    if (merchant) {
      try {
        // Revoke access token with Square
        const accessToken = decrypt(merchant.accessToken);
        await SquareOAuth.revokeToken(accessToken);
      } catch (error) {
        console.error('[Square] Error revoking token:', error);
        // Continue with deletion even if revocation fails
      }

      // Delete merchant record
      await prisma.squareMerchant.delete({
        where: { loungeId }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Square account disconnected'
    });
  } catch (error) {
    console.error('Error disconnecting Square:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect Square account' },
      { status: 500 }
    );
  }
}

