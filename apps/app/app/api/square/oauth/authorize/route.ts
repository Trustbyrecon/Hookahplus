import { NextRequest, NextResponse } from 'next/server';
import { SquareOAuth } from '../../../../../lib/square/oauth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * GET /api/square/oauth/authorize
 * Initiate Square OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loungeId = searchParams.get('loungeId');
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!loungeId) {
      return NextResponse.json(
        { error: 'Missing loungeId parameter' },
        { status: 400 }
      );
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in cookie for verification
    const cookieStore = await cookies();
    cookieStore.set('square_oauth_state', state, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      path: '/', // must be readable by /api/square/oauth/callback
      maxAge: 600 // 10 minutes
    });

    // Store loungeId in cookie for callback
    cookieStore.set('square_oauth_lounge_id', loungeId, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      path: '/', // must be readable by /api/square/oauth/callback
      maxAge: 600
    });

    // Generate authorization URL
    const authUrl = SquareOAuth.getAuthorizationUrl(state);
    
    // Log the authorization URL for debugging (don't log full URL in production)
    if (isDevelopment) {
      console.log('[Square OAuth] Redirecting to:', authUrl);
    }

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[Square OAuth] Authorization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to initiate OAuth flow',
        details: errorMessage,
        hint: 'Check that SQUARE_APPLICATION_ID is set correctly in .env.local'
      },
      { status: 500 }
    );
  }
}

