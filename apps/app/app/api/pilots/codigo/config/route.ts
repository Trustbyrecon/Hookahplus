import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { hasRole } from '../../../../../lib/auth';

const LOUNGE_ID_CODIGO = 'CODIGO';

/**
 * GET /api/pilots/codigo/config?loungeId=...
 * Returns pilot configuration for lounge (peak nights, hours, pricing, staff, menu).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = (searchParams.get('loungeId') || '').trim() || LOUNGE_ID_CODIGO;

    const config = await prisma.pilotConfig.findUnique({
      where: { loungeId },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Pilot config not found for this lounge' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      loungeId,
      config: config.configData as object,
    });
  } catch (error) {
    console.error('[Pilot Config] GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch pilot config',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pilots/codigo/config
 * Admin-only. Partial updates to pilot config.
 * Body: { loungeId?, peakNights?, operatingWindow?, pricing?, staff?, menuPresets?, menuCatalogs? }
 */
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const loungeId = (body.loungeId || '').trim() || LOUNGE_ID_CODIGO;

    const existing = await prisma.pilotConfig.findUnique({
      where: { loungeId },
    });

    const current = (existing?.configData as Record<string, unknown>) || {};
    const updates: Record<string, unknown> = {};

    if (body.peakNights != null) updates.peakNights = body.peakNights;
    if (body.operatingWindow != null) updates.operatingWindow = body.operatingWindow;
    if (body.pricing != null) updates.pricing = body.pricing;
    if (body.staff != null) updates.staff = body.staff;
    if (body.menuPresets != null) updates.menuPresets = body.menuPresets;
    if (body.menuCatalogs != null) updates.menuCatalogs = body.menuCatalogs;

    const merged = { ...current, ...updates };

    const config = await prisma.pilotConfig.upsert({
      where: { loungeId },
      update: { configData: merged },
      create: {
        loungeId,
        configData: merged,
      },
    });

    return NextResponse.json({
      success: true,
      loungeId,
      config: config.configData as object,
    });
  } catch (error) {
    console.error('[Pilot Config] POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update pilot config',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
