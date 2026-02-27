import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';
import { hasRole } from '../../../../../../lib/auth';

/**
 * GET /api/lounges/[loungeId]/floorplan?floorId=F3
 * Returns floorplan layout for a lounge/floor.
 * This schema is compatible with future Visual Layout Grounder output.
 */
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
    const floorId = (searchParams.get('floorId') || '').trim() || 'F3';

    const layout = await prisma.floorplanLayout.findUnique({
      where: {
        loungeId_floorId: { loungeId: loungeIdTrimmed, floorId },
      },
    });

    if (!layout) {
      return NextResponse.json(
        { error: 'Floorplan not found for this lounge/floor' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      loungeId: loungeIdTrimmed,
      floorId,
      nodes: layout.nodes,
      metadata: layout.metadata,
    });
  } catch (error) {
    console.error('[Floorplan] GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch floorplan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lounges/[loungeId]/floorplan?floorId=F3
 * Admin-only. Create or update floorplan layout.
 * Body: { nodes: [...], metadata?: { imageRef?, ... } }
 * This schema is compatible with future Visual Layout Grounder output.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const { loungeId } = await params;
    const loungeIdTrimmed = (loungeId || '').trim();
    if (!loungeIdTrimmed) {
      return NextResponse.json({ error: 'loungeId is required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const floorId = (searchParams.get('floorId') || '').trim() || 'F3';

    const body = await req.json().catch(() => ({}));
    const nodes = Array.isArray(body.nodes) ? body.nodes : [];
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : null;

    const layout = await prisma.floorplanLayout.upsert({
      where: {
        loungeId_floorId: { loungeId: loungeIdTrimmed, floorId },
      },
      update: { nodes, metadata },
      create: {
        loungeId: loungeIdTrimmed,
        floorId,
        nodes,
        metadata,
      },
    });

    return NextResponse.json({
      success: true,
      loungeId: loungeIdTrimmed,
      floorId,
      nodes: layout.nodes,
      metadata: layout.metadata,
    });
  } catch (error) {
    console.error('[Floorplan] POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update floorplan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
