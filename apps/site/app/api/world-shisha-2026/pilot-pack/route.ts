import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { sendWorldShishaPilotPackSignupNotification } from '../../../../lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      businessName, 
      ownerName, 
      email, 
      phone, 
      location,
      city,
      country,
      currentPOS,
      numberOfLocations,
      howDidYouHear,
      referralCode,
      campaign
    } = body;

    if (!email || !businessName || !ownerName) {
      return NextResponse.json(
        { error: 'Email, business name, and owner name are required' },
        { status: 400 }
      );
    }

    // Create lead in reflex_events table
    try {
      // Get IP and user agent from request
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.headers.get('x-real-ip') || 
                 '0.0.0.0';
      const userAgent = req.headers.get('user-agent') || 'world-shisha-2026-pilot-pack';

      // Store metadata in payload as JSON string
      const payload = JSON.stringify({
        businessName,
        ownerName,
        email,
        phone: phone || null,
        location: location || null,
        city: city || null,
        country: country || null,
        currentPOS: currentPOS || null,
        numberOfLocations: numberOfLocations || '1',
        howDidYouHear: howDidYouHear || null,
        referralCode: referralCode || null,
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
        'world_shisha_2026_pilot_pack_signup',
        'backend',
        payload,
        userAgent,
        ip
      );
    } catch (dbError: any) {
      console.error('[World Shisha Pilot Pack] Database error:', dbError);
      // Continue even if DB insert fails
    }

    // Send email notification
    try {
      await sendWorldShishaPilotPackSignupNotification({
        businessName,
        ownerName,
        email,
        phone: phone || undefined,
        location: location || undefined,
        city: city || undefined,
        country: country || undefined,
        currentPOS: currentPOS || undefined,
        numberOfLocations: numberOfLocations || '1',
        exhibitor: howDidYouHear || undefined,
        referralCode: referralCode || undefined,
        campaign: campaign || 'world_shisha_2026'
      });
    } catch (emailError) {
      console.error('[World Shisha Pilot Pack] Email error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Pilot Pack signup received successfully'
    });
  } catch (error: any) {
    console.error('[World Shisha Pilot Pack] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process signup', details: error.message },
      { status: 500 }
    );
  }
}

