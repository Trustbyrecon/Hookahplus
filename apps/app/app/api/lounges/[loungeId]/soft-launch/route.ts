import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { hasRole } from '../../../../../lib/auth';

/**
 * GET /api/lounges/[loungeId]/soft-launch
 * Returns CODIGO Soft Launch mode status for a lounge (admin only).
 * Response: { success: true, loungeId, softLaunchEnabled: boolean }
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

    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const config = await prisma.loungeConfig.findFirst({
      where: { loungeId: loungeIdTrimmed },
      orderBy: { version: 'desc' },
      select: { softLaunchEnabled: true },
    });

    const softLaunchEnabled = config?.softLaunchEnabled ?? false;

    return NextResponse.json({
      success: true,
      loungeId: loungeIdTrimmed,
      softLaunchEnabled,
    });
  } catch (error) {
    console.error('[Soft Launch] GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch soft launch status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lounges/[loungeId]/soft-launch
 * Set CODIGO Soft Launch mode for a lounge (admin only).
 * Body: { softLaunchEnabled: boolean }
 * Response: { success: true, loungeId, softLaunchEnabled: boolean }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> }
) {
  try {
    const { loungeId } = await params;
    const loungeIdTrimmed = (loungeId || '').trim();
    if (!loungeIdTrimmed) {
      return NextResponse.json({ error: 'loungeId is required' }, { status: 400 });
    }

    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const softLaunchEnabled = Boolean(body?.softLaunchEnabled);

    const config = await prisma.loungeConfig.upsert({
      where: { loungeId: loungeIdTrimmed },
      update: { softLaunchEnabled },
      create: {
        loungeId: loungeIdTrimmed,
        configData: '{}',
        version: 1,
        softLaunchEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      loungeId: loungeIdTrimmed,
      softLaunchEnabled: config.softLaunchEnabled,
    });
  } catch (error) {
    console.error('[Soft Launch] POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update soft launch status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
