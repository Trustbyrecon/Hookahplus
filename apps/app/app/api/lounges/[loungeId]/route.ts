/**
 * GET /api/lounges/[loungeId]?includeTables=true&includeCampaigns=true
 *
 * Returns lounge details with tables (from FloorplanLayout) and campaigns.
 * Used by QR Generator to load tables for QR code generation.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId } = await params;
    const loungeIdTrimmed = (loungeId || '').trim();
    if (!loungeIdTrimmed) {
      return NextResponse.json({ error: 'loungeId is required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const includeTables = searchParams.get('includeTables') === 'true';
    const includeCampaigns = searchParams.get('includeCampaigns') === 'true';

    // Map CODIGO-Pilot to CODIGO for floorplan lookup (pilot lounge uses CODIGO floorplan)
    const floorplanLoungeId = loungeIdTrimmed === 'CODIGO-Pilot' ? 'CODIGO' : loungeIdTrimmed;

    const lounge: {
      lounge_id: string;
      lounge_name: string;
      slug: string;
      tables?: Array<{ id: string; name: string; type: string; capacity: number; zone: string; qr_enabled: boolean; status: string }>;
      campaigns?: Array<{ id: string; name: string; active: boolean; qr_prefix: string; start_date: string; end_date: string; description: string }>;
    } = {
      lounge_id: loungeIdTrimmed,
      lounge_name: loungeIdTrimmed === 'CODIGO-Pilot' ? 'CODIGO Lounge' : loungeIdTrimmed.replace(/_/g, ' '),
      slug: loungeIdTrimmed.toLowerCase().replace(/_/g, '-'),
    };

    if (includeTables) {
      try {
        const floorplan = await prisma.floorplanLayout.findFirst({
          where: { loungeId: floorplanLoungeId },
          orderBy: { floorId: 'asc' },
        });
        if (floorplan?.nodes && Array.isArray(floorplan.nodes)) {
          const nodes = floorplan.nodes as Array<{ id?: string; label?: string; type?: string; x?: number; y?: number; capacity?: number }>;
          lounge.tables = nodes
            .filter((n) => n.id)
            .map((n) => ({
              id: n.id || '',
              name: n.label || n.id || '',
              type: n.type === 'kiosk' ? 'Kiosk' : n.type === 'table' ? 'Table' : 'Booth',
              capacity: n.capacity ?? 2,
              zone: 'Main Floor',
              qr_enabled: true,
              status: 'active' as const,
            }));
        } else {
          lounge.tables = [];
        }
      } catch {
        lounge.tables = [];
      }
    }

    if (includeCampaigns) {
      try {
        const campaigns = await prisma.campaign.findMany({
          where: {
            OR: [{ loungeId: loungeIdTrimmed }, { loungeId: floorplanLoungeId }],
            isActive: true,
          },
          orderBy: { startDate: 'desc' },
        });
        lounge.campaigns = campaigns.map((c) => ({
          id: c.id,
          name: c.name,
          active: c.status === 'active',
          qr_prefix: c.qrPrefix || '',
          start_date: c.startDate.toISOString(),
          end_date: c.endDate?.toISOString() || '',
          description: c.description || '',
        }));
      } catch {
        lounge.campaigns = [];
      }
    }

    return NextResponse.json({
      success: true,
      lounge,
    });
  } catch (error) {
    console.error('[Lounges] GET lounge detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lounge details', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
