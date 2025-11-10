import { NextRequest, NextResponse } from 'next/server';
import { sendNewsletterConfirmation } from '../../../lib/email';
import { trackCTA } from '../../../lib/ctaTracking';

/**
 * POST /api/newsletter/subscribe
 * 
 * Handles newsletter signups
 * - Tracks CTA event
 * - Sends confirmation email with free resources
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Track CTA event
    try {
      await trackCTA({
        ctaSource: 'website',
        ctaType: 'newsletter_signup',
        data: {
          email,
          name: name || undefined
        },
        metadata: {
          source: req.headers.get('referer') || 'unknown',
          timestamp: new Date().toISOString()
        },
        component: 'NewsletterSignup'
      });
    } catch (trackingError) {
      console.error('[Newsletter] Failed to track CTA:', trackingError);
      // Continue anyway - tracking failure shouldn't block signup
    }

    // Send confirmation email with free resources
    const emailResult = await sendNewsletterConfirmation(email, name);

    if (!emailResult.success) {
      console.warn('[Newsletter] Email sending failed, but signup recorded');
      // Still return success - email failure shouldn't block signup
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter! Check your email for confirmation and free resources.',
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('[Newsletter] Error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

