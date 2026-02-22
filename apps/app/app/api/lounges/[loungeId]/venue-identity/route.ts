import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type VenueIdentity = 'casino_velocity' | 'sports_momentum' | 'luxury_memory';

function isVenueIdentity(value: unknown): value is VenueIdentity {
  return value === 'casino_velocity' || value === 'sports_momentum' || value === 'luxury_memory';
}

/**
 * POST /api/lounges/[loungeId]/venue-identity
 *
 * Stores stable, manually-defined venue identity in `LoungeConfig.configData.venue_identity`.
 * Identity must never auto-switch; behavior can adapt only within the identity.
 *
 * Body:
 * { venueIdentity: "casino_velocity" | "sports_momentum" | "luxury_memory" }
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

    let configData: any = {};
    if (current?.configData) {
      try {
        configData = JSON.parse(current.configData) || {};
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
  } catch (error: any) {
    console.error('[Venue Identity] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set venue identity', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

