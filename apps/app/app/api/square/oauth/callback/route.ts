import { NextRequest, NextResponse } from 'next/server';
import { SquareOAuth } from '../../../../../lib/square/oauth';
import { prisma } from '../../../../../lib/db';
import { encrypt } from '../../../../../lib/utils/encryption';
import { cookies } from 'next/headers';
import { getCurrentTenant } from '../../../../../lib/auth';

/**
 * GET /api/square/oauth/callback
 * Handle Square OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Check for OAuth errors
    if (error) {
      console.error('[Square OAuth] Error from Square:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=missing_params`
      );
    }

    // Verify state token
    const cookieStore = await cookies();
    const storedState = cookieStore.get('square_oauth_state')?.value;
    const loungeId = cookieStore.get('square_oauth_lounge_id')?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=invalid_state`
      );
    }

    if (!loungeId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=missing_lounge`
      );
    }

    // Exchange code for tokens
    const tokens = await SquareOAuth.exchangeCode(code);

    // Get merchant information
    const merchantInfo = await SquareOAuth.getMerchantInfo(tokens.accessToken);

    // Get tenant ID (if authenticated)
    let tenantId: string | undefined;
    if (!isDevelopment) {
      try {
        const tenant = await getCurrentTenant();
        tenantId = tenant?.id;
      } catch (e) {
        // Non-blocking if auth fails
      }
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    // Store merchant credentials
    await prisma.squareMerchant.upsert({
      where: { loungeId },
      create: {
        loungeId,
        tenantId: tenantId || null,
        merchantId: merchantInfo.id,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        locationIds: merchantInfo.locations,
        expiresAt,
        isActive: true
      },
      update: {
        merchantId: merchantInfo.id,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        locationIds: merchantInfo.locations,
        expiresAt,
        isActive: true
      }
    });

    // Clear OAuth cookies
    cookieStore.delete('square_oauth_state');
    cookieStore.delete('square_oauth_lounge_id');

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/settings?connected=true`
    );
  } catch (error) {
    console.error('[Square OAuth] Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=${encodeURIComponent(error instanceof Error ? error.message : 'unknown_error')}`
    );
  }
}

