import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    // Fetch exhibitor contacts from reflex_events
    const exhibitors = await prisma.reflexEvent.findMany({
      where: {
        eventType: 'exhibitor_contact',
        source: 'backend'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    // Transform to exhibitor format
    const exhibitorList = exhibitors.map(event => ({
      id: event.id,
      name: (event.metadata as any)?.name || 'Unknown',
      company: (event.metadata as any)?.company || 'Unknown',
      boothNumber: (event.metadata as any)?.boothNumber || null,
      category: (event.metadata as any)?.category || 'unknown',
      contactStatus: (event.metadata as any)?.contactStatus || 'not_contacted',
      notes: (event.metadata as any)?.notes || '',
      lastContact: event.createdAt
    }));

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
    const { action, exhibitorData } = body;

    if (action === 'create_exhibitor') {
      // Create new exhibitor contact
      const exhibitor = await prisma.reflexEvent.create({
        data: {
          eventType: 'exhibitor_contact',
          source: 'backend',
          metadata: {
            name: exhibitorData.name,
            company: exhibitorData.company,
            boothNumber: exhibitorData.boothNumber || null,
            category: exhibitorData.category || 'unknown',
            contactStatus: 'not_contacted',
            notes: exhibitorData.notes || '',
            timestamp: new Date().toISOString()
          },
          userAgent: 'admin-exhibitor-outreach',
          ip: '0.0.0.0'
        }
      });

      return NextResponse.json({
        success: true,
        exhibitor: {
          id: exhibitor.id,
          ...exhibitor.metadata
        }
      });
    }

    if (action === 'update_status') {
      // Update exhibitor contact status
      const { exhibitorId, status, step } = exhibitorData;
      
      await prisma.reflexEvent.update({
        where: { id: exhibitorId },
        data: {
          metadata: {
            ...((await prisma.reflexEvent.findUnique({ where: { id: exhibitorId } }))?.metadata as any || {}),
            contactStatus: status,
            lastOutreachStep: step,
            lastContact: new Date().toISOString()
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Exhibitor status updated'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[Exhibitor Outreach] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

