import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

type VenueIdentity = 'casino_velocity' | 'sports_momentum' | 'luxury_memory';

function isVenueIdentity(value: unknown): value is VenueIdentity {
  return value === 'casino_velocity' || value === 'sports_momentum' || value === 'luxury_memory';
}

/**
 * GET /api/lounges/[loungeId]/venue-identity
 * Returns current venue_identity from LoungeConfig (if any).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId: loungeIdRaw } = await params;
    const loungeId = (loungeIdRaw || '').trim();
    if (!loungeId) {
      return NextResponse.json({ success: false, error: 'loungeId is required' }, { status: 400 });
    }

    const current = await prisma.loungeConfig.findFirst({
      where: { loungeId },
      orderBy: { version: 'desc' },
      select: { version: true, configData: true, effectiveAt: true },
    });

    let venueIdentity: VenueIdentity | null = null;
    if (current?.configData) {
      try {
        const configData = JSON.parse(current.configData) as Record<string, unknown>;
        const raw = configData.venue_identity;
        if (isVenueIdentity(raw)) venueIdentity = raw;
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      loungeId,
      venueIdentity,
      version: current?.version ?? 0,
      effectiveAt: current?.effectiveAt?.toISOString() ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Venue Identity GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load venue identity', details: message }, { status: 500 });
  }
}

/**
 * POST /api/lounges/[loungeId]/venue-identity
 *
 * Stores stable, manually-defined venue identity in `LoungeConfig.configData.venue_identity`.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId: loungeIdRaw } = await params;
    const loungeId = (loungeIdRaw || '').trim();
    if (!loungeId) {
      return NextResponse.json({ success: false, error: 'loungeId is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const venueIdentity = body?.venueIdentity;
    if (!isVenueIdentity(venueIdentity)) {
      return NextResponse.json(
        { success: false, error: 'venueIdentity must be one of: casino_velocity | sports_momentum | luxury_memory' },
        { status: 400 }
      );
    }

    const current = await prisma.loungeConfig.findFirst({
      where: { loungeId },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, configData: true },
    });

    let configData: Record<string, unknown> = {};
    if (current?.configData) {
      try {
        const parsed = JSON.parse(current.configData);
        if (parsed && typeof parsed === 'object') configData = parsed as Record<string, unknown>;
      } catch {
        configData = {};
      }
    }

    configData.venue_identity = venueIdentity;

    const nextVersion = current ? current.version + 1 : 1;
    const updated = await prisma.loungeConfig.upsert({
      where: { loungeId },
      update: {
        configData: JSON.stringify(configData),
        version: nextVersion,
        effectiveAt: new Date(),
      },
      create: {
        loungeId,
        configData: JSON.stringify(configData),
        version: nextVersion,
        effectiveAt: new Date(),
      },
      select: { id: true, version: true, effectiveAt: true },
    });

    await prisma.auditLog.create({
      data: {
        loungeId,
        action: 'VENUE_IDENTITY_SET',
        entityType: 'LoungeConfig',
        entityId: updated.id,
        changes: JSON.stringify({
          venue_identity: venueIdentity,
          version: current?.version || 0,
          newVersion: updated.version,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      loungeId,
      venueIdentity,
      version: updated.version,
      effectiveAt: updated.effectiveAt.toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Venue Identity POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set venue identity', details: message },
      { status: 500 }
    );
  }
}
