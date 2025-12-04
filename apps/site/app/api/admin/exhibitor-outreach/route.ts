import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { worldShisha2026Campaign } from '../../../../lib/campaigns/worldShisha2026';

export async function GET(req: NextRequest) {
  try {
    // Fetch exhibitor contacts from reflex_events
    const exhibitors = await prisma.reflexEvent.findMany({
      where: {
        type: 'world_shisha_2026_exhibitor_contact',
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    // Transform to exhibitor format
    const exhibitorList = exhibitors.map(event => {
      const payload = JSON.parse(event.payload || '{}');
      return {
        id: event.id,
        name: payload.name || 'Unknown',
        company: payload.company || 'Unknown',
        boothNumber: payload.boothNumber || null,
        category: payload.category || 'unknown',
        contactStatus: payload.contactStatus || 'new',
        notes: payload.notes || '',
        email: payload.email || '',
        linkedinUrl: payload.linkedinUrl || '',
        website: payload.website || '',
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      exhibitors: exhibitorList
    });
  } catch (error: any) {
    console.error('[Exhibitor Outreach] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exhibitors', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, boothNumber, category, email, linkedinUrl, website } = body;

    if (!name || !company || !category || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, company, category, email' },
        { status: 400 }
      );
    }

    // Create new exhibitor contact
    const newExhibitor = await prisma.reflexEvent.create({
      data: {
        type: 'world_shisha_2026_exhibitor_contact',
        source: 'ui', // Admin panel is UI action
        payload: JSON.stringify({
          name,
          company,
          boothNumber,
          category,
          email,
          linkedinUrl,
          website,
          contactStatus: 'new',
          campaign: worldShisha2026Campaign.id,
        }),
        userAgent: req.headers.get('user-agent') || 'admin-exhibitor-outreach',
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Exhibitor added successfully',
      exhibitorId: newExhibitor.id
    });
  } catch (error: any) {
    console.error('[Exhibitor Outreach] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, updates' },
        { status: 400 }
      );
    }

    const existingEvent = await prisma.reflexEvent.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Exhibitor not found' },
        { status: 404 }
      );
    }

    const currentPayload = JSON.parse(existingEvent.payload || '{}');
    const updatedPayload = { ...currentPayload, ...updates };

    await prisma.reflexEvent.update({
      where: { id },
      data: {
        payload: JSON.stringify(updatedPayload),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Exhibitor updated successfully'
    });
  } catch (error: any) {
    console.error('[Exhibitor Outreach] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update exhibitor', details: error.message },
      { status: 500 }
    );
  }
}

