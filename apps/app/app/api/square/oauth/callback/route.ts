import { NextRequest, NextResponse } from 'next/server';
import { SquareOAuth } from '../../../../../lib/square/oauth';
import { cookies } from 'next/headers';
import { getCurrentTenant } from '../../../../../lib/auth';

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

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
    const errorDescription = searchParams.get('error_description');
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Log all incoming parameters for debugging
    console.log('[Square OAuth] Callback received:', {
      hasCode: !!code,
      hasState: !!state,
      hasError: !!error,
      error,
      errorDescription,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // Check for OAuth errors from Square
    if (error) {
      console.error('[Square OAuth] Error from Square:', { error, errorDescription });
      const errorMsg = errorDescription || error;
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=${encodeURIComponent(errorMsg)}`
      );
    }

    // If no code or state, this might be a direct access or incomplete OAuth flow
    if (!code || !state) {
      console.error('[Square OAuth] Missing parameters:', { 
        hasCode: !!code, 
        hasState: !!state,
        url: request.url,
        searchParams: Object.fromEntries(searchParams.entries())
      });
      
      // If this is a direct access (no params at all), redirect to connect page
      if (!code && !state && !error) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=${encodeURIComponent('Please start the OAuth flow from the Connect page')}`
        );
      }
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=missing_params&details=${encodeURIComponent('OAuth callback missing code or state parameter. Make sure the redirect URL in Square matches exactly: http://localhost:3002/api/square/oauth/callback')}`
      );
    }

    // Defensive: avoid hard-crashing if DB isn't configured.
    // PrismaClient will throw at import time if DATABASE_URL is missing.
    if (!process.env.DATABASE_URL) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=${encodeURIComponent('server_misconfigured')}&details=${encodeURIComponent('DATABASE_URL is not set in this environment. Square OAuth cannot complete.')}`
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
        tenantId = (await getCurrentTenant()) || undefined;
      } catch (e) {
        // Non-blocking if auth fails
      }
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    // Lazy-load DB + encryption AFTER we know the callback is real.
    // This prevents /api/square/oauth/callback from 500ing on direct browser hits in
    // partially configured environments.
    const [{ prisma }, { encrypt }] = await Promise.all([
      import('../../../../../lib/db'),
      import('../../../../../lib/utils/encryption'),
    ]);

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
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/settings?connected=true&loungeId=${encodeURIComponent(
        loungeId
      )}`
    );
  } catch (error) {
    console.error('[Square OAuth] Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/square/connect?error=${encodeURIComponent(error instanceof Error ? error.message : 'unknown_error')}`
    );
  }
}

