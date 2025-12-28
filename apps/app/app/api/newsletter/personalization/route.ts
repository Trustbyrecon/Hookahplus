import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizationProfile } from '../../../../lib/newsletterPersonalization';
import { resolveHID } from '../../../../lib/hid/resolver';

/**
 * GET /api/newsletter/personalization
 * 
 * Get personalization profile for onboarding based on newsletter engagement
 * 
 * Query params:
 * - email: Email address to look up
 * - hid: HID to look up (alternative to email)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const hid = searchParams.get('hid');

    if (!email && !hid) {
      return NextResponse.json(
        { error: 'Email or HID is required' },
        { status: 400 }
      );
    }

    let targetHID = hid;

    // If email provided, resolve HID first
    if (email && !targetHID) {
      try {
        const hidResult = await resolveHID({ email: email.toLowerCase().trim() });
        targetHID = hidResult.hid;
      } catch (error) {
        console.error('[Personalization] Failed to resolve HID:', error);
        return NextResponse.json(
          { error: 'Failed to resolve HID from email' },
          { status: 500 }
        );
      }
    }

    if (!targetHID) {
      return NextResponse.json(
        { error: 'Could not determine HID' },
        { status: 400 }
      );
    }

    // Get personalization profile
    const profile = await getPersonalizationProfile(targetHID);

    if (!profile) {
      return NextResponse.json(
        { 
          message: 'No newsletter engagement found',
          hid: targetHID 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error: any) {
    console.error('[Personalization] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get personalization profile' },
      { status: 500 }
    );
  }
}

