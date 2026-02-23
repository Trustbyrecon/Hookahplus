import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { worldShisha2026Campaign } from '../../../../lib/campaigns/worldShisha2026';

type ReflexEventRow = {
  id: string;
  payload: string | null;
  createdAt: Date;
};

export async function GET(req: NextRequest) {
  try {
    // Fetch exhibitor contacts from reflex_events
    const exhibitors = await prisma.$queryRawUnsafe(`
      SELECT id, payload, "createdAt"
      FROM reflex_events
      WHERE type = $1
      ORDER BY "createdAt" DESC
      LIMIT 100
    `, 'world_shisha_2026_exhibitor_contact') as ReflexEventRow[];

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
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || 'admin-exhibitor-outreach';

    const payload = JSON.stringify({
      name,
      company,
      boothNumber,
      category,
      email,
      linkedinUrl,
      website,
      contactStatus: 'new',
      campaign: worldShisha2026Campaign.id,
    });

    const insertResult = await prisma.$queryRawUnsafe(`
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
      RETURNING id
    `,
      'world_shisha_2026_exhibitor_contact',
      'ui',
      payload,
      userAgent,
      ip
    ) as Array<{ id: string }>;

    const exhibitorId = insertResult?.[0]?.id;
    if (!exhibitorId) throw new Error('Failed to create exhibitor contact');

    return NextResponse.json({
      success: true,
      message: 'Exhibitor added successfully',
      exhibitorId
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

    const existingRows = await prisma.$queryRawUnsafe(`
      SELECT id, payload
      FROM reflex_events
      WHERE id = $1
      LIMIT 1
    `, id) as Array<{ id: string; payload: string | null }>;
    const existingEvent = existingRows?.[0];

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Exhibitor not found' },
        { status: 404 }
      );
    }

    const currentPayload = JSON.parse(existingEvent.payload || '{}');
    const updatedPayload = { ...currentPayload, ...updates };

    await prisma.$queryRawUnsafe(`
      UPDATE reflex_events
      SET payload = $2
      WHERE id = $1
    `, id, JSON.stringify(updatedPayload));

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

