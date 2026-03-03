import { NextRequest, NextResponse } from 'next/server';
import { sendNewsletterConfirmation } from '../../../../lib/email';
import { trackCTA } from '../../../../lib/ctaTracking';

/**
 * POST /api/newsletter/subscribe
 * 
 * Handles newsletter signups
 * - Creates shadow HID profile from email (MOAT Step 1)
 * - Tracks CTA event with content engagement data
 * - Sends confirmation email with free resources
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, contentEngagement } = body; // contentEngagement: { pages: string[], timeSpent: number }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Step 1: Create shadow HID profile from email (MOAT alignment)
    let hid: string | null = null;
    let hidStatus: 'new' | 'existing' | 'error' = 'error';
    
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
      const hidResponse = await fetch(`${appUrl}/api/hid/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      if (hidResponse.ok) {
        const hidResult = await hidResponse.json();
        hid = hidResult.hid;
        hidStatus = hidResult.status === 'existing' ? 'existing' : 'new';
        console.log(`[Newsletter] HID ${hidStatus}: ${hid} for ${email}`);
      } else {
        console.warn('[Newsletter] Failed to create HID profile, continuing anyway');
      }
    } catch (hidError) {
      console.error('[Newsletter] HID creation error:', hidError);
      // Continue anyway - HID failure shouldn't block signup
    }

    // Track CTA event with HID and content engagement
    try {
      const referrer = req.headers.get('referer') || 'unknown';
      const metadata: Record<string, any> = {
        source: referrer,
        timestamp: new Date().toISOString(),
        hid: hid || undefined,
        hidStatus: hid || undefined ? hidStatus : undefined,
      };

      // Add content engagement data if provided
      if (contentEngagement) {
        metadata.contentEngagement = contentEngagement;
        metadata.contentPages = contentEngagement.pages || [];
        metadata.contentTimeSpent = contentEngagement.timeSpent || 0;
      }

      await trackCTA({
        ctaSource: 'website',
        ctaType: 'newsletter_signup',
        data: {
          email,
          name: name || undefined,
          hid: hid || undefined,
        },
        metadata,
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
      emailSent: emailResult.success,
      hid: hid || undefined, // Include HID in response for client-side tracking
    });

  } catch (error) {
    console.error('[Newsletter] Error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

