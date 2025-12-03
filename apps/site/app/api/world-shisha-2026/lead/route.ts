import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { sendWorldShishaLeadNotification } from '../../../../lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, campaign, source, exhibitor, referralCode } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create lead in reflex_events table
    try {
      await prisma.reflexEvent.create({
        data: {
          eventType: 'world_shisha_2026_lead',
          source: 'backend', // Map to valid enum value
          metadata: {
            email,
            campaign: campaign || 'world_shisha_2026',
            source: source || 'landing_page',
            exhibitor: exhibitor || null,
            referralCode: referralCode || null,
            timestamp: new Date().toISOString()
          },
          userAgent: 'world-shisha-2026-landing',
          ip: '0.0.0.0' // Public form, no IP tracking
        }
      });
    } catch (dbError: any) {
      console.error('[World Shisha 2026 Lead] Database error:', dbError);
      // Continue even if DB insert fails - still send email
    }

    // Send email notification
    try {
      await sendWorldShishaLeadNotification({
        email,
        source: source || 'landing_page',
        exhibitor: exhibitor || null,
        campaign: campaign || 'world_shisha_2026'
      });
    } catch (emailError) {
      console.error('[World Shisha 2026 Lead] Email error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully'
    });
  } catch (error: any) {
    console.error('[World Shisha 2026 Lead] Error:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead', details: error.message },
      { status: 500 }
    );
  }
}

