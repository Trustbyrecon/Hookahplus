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
      // Get IP and user agent from request
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.headers.get('x-real-ip') || 
                 '0.0.0.0';
      const userAgent = req.headers.get('user-agent') || 'world-shisha-2026-brief';

      // Store metadata in payload as JSON string
      const payload = JSON.stringify({
        email,
        name: name || null,
        exhibitor: exhibitor || null,
        campaign: campaign || 'world_shisha_2026',
        timestamp: new Date().toISOString()
      });

      // Use raw SQL to insert event
      await prisma.$queryRawUnsafe(`
        INSERT INTO reflex_events (
          id, type, source, payload, "userAgent", ip, "createdAt"
        )
        VALUES (
          gen_random_uuid()::text,
          $1,
          $2,
          $3,
          $4,
          $5,
          NOW()
        )
      `,
        'world_shisha_2026_brief_download',
        'backend',
        payload,
        userAgent,
        ip
      );
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

