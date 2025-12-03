import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { sendWorldShishaBriefDownloadNotification } from '../../../../../lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, exhibitor, campaign } = body;

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
          eventType: 'world_shisha_2026_brief_download',
          source: 'backend',
          metadata: {
            email,
            name: name || null,
            exhibitor: exhibitor || null,
            campaign: campaign || 'world_shisha_2026',
            timestamp: new Date().toISOString()
          },
          userAgent: 'world-shisha-2026-brief',
          ip: '0.0.0.0'
        }
      });
    } catch (dbError: any) {
      console.error('[World Shisha Brief Download] Database error:', dbError);
      // Continue even if DB insert fails
    }

    // Send email notification
    try {
      await sendWorldShishaBriefDownloadNotification({
        email,
        name: name || undefined,
        exhibitor: exhibitor || undefined,
        campaign: campaign || 'world_shisha_2026'
      });
    } catch (emailError) {
      console.error('[World Shisha Brief Download] Email error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Download tracking recorded'
    });
  } catch (error: any) {
    console.error('[World Shisha Brief Download] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track download', details: error.message },
      { status: 500 }
    );
  }
}

