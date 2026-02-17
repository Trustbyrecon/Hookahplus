import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { computeReadiness } from '../../../../lib/launchpad/readiness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DraftLocation = {
  name: string;
  tablesCount?: number;
  sectionsCount?: number;
  operatingHours?: any;
};

function safeArray(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = (searchParams.get('token') || '').trim();
    const includeChecklist = (searchParams.get('includeChecklist') || '').trim() === '1';

    if (!token) {
      return NextResponse.json({ success: false, error: 'token is required' }, { status: 400 });
    }

    const session = await prisma.setupSession.findUnique({
      where: { token },
      select: {
        token: true,
        status: true,
        source: true,
        expiresAt: true,
        organizationId: true,
        organizationSlug: true,
        multiLocationEnabled: true,
        locationDrafts: true,
        activatedLoungeIds: true,
        loungeId: true,
        progress: true,
        createdAt: true,
        updatedAt: true,
        lastActivityAt: true,
      } as any,
    } as any);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Setup session not found' }, { status: 404 });
    }

    const progress: any = (session as any).progress || {};
    const step1: any = progress?.data?.step1 || {};

    const organizationName =
      String(step1?.organizationName || '').trim() ||
      (String(step1?.loungeName || '').trim() ? `${String(step1.loungeName).trim()} Operator` : '') ||
      null;

    const draftLocationsFromStep = safeArray(step1?.locations).map((l: any): DraftLocation => ({
      name: String(l?.name || '').trim(),
      tablesCount: Number(l?.tablesCount || 0) || undefined,
      sectionsCount: Number(l?.sectionsCount || 0) || undefined,
      operatingHours: l?.operatingHours || undefined,
    }));

    const draftLocationsFromSession = safeArray((session as any).locationDrafts).map((l: any): DraftLocation => ({
      name: String(l?.name || '').trim(),
      tablesCount: Number(l?.tablesCount || 0) || undefined,
      sectionsCount: Number(l?.sectionsCount || 0) || undefined,
      operatingHours: l?.operatingHours || undefined,
    }));

    const draftLocations =
      draftLocationsFromStep.length > 0
        ? draftLocationsFromStep
        : (draftLocationsFromSession.length > 0 ? draftLocationsFromSession : []);

    const activatedIds: string[] = safeArray((session as any).activatedLoungeIds).filter(Boolean);
    const fallbackSingle = (session as any).loungeId ? [String((session as any).loungeId)] : [];
    const provisionedIds = activatedIds.length ? activatedIds : fallbackSingle;

    const readinessByLoungeId = new Map<string, any>();
    await Promise.all(
      provisionedIds.map(async (loungeId) => {
        const r = await computeReadiness({ loungeId, token });
        readinessByLoungeId.set(loungeId, includeChecklist ? r : { success: true, loungeId, score: r.score });
      })
    );

    const draftList = draftLocations.map((d, idx) => {
      const loungeId = provisionedIds[idx] || null; // best-effort alignment (provision order == draft order)
      const readiness = loungeId ? readinessByLoungeId.get(loungeId) : null;
      return {
        index: idx,
        name: d.name || `Location ${idx + 1}`,
        tablesCount: d.tablesCount || null,
        sectionsCount: d.sectionsCount || null,
        operatingHours: d.operatingHours || null,
        provisioned: Boolean(loungeId),
        loungeId,
        readiness,
      };
    });

    // If provisioned lounges exist but drafts are missing/mismatched, include them as extra rows.
    const draftLoungeIds = new Set(draftList.map((d) => d.loungeId).filter(Boolean));
    const extras = provisionedIds
      .filter((id) => !draftLoungeIds.has(id))
      .map((loungeId) => ({
        index: -1,
        name: loungeId,
        tablesCount: null,
        sectionsCount: null,
        operatingHours: null,
        provisioned: true,
        loungeId,
        readiness: readinessByLoungeId.get(loungeId) || null,
      }));

    return NextResponse.json({
      success: true,
      organization: {
        id: (session as any).organizationId || null,
        slug: (session as any).organizationSlug || null,
        name: organizationName,
      },
      session: {
        token: session.token,
        source: (session as any).source || null,
        status: (session as any).status || null,
        expiresAt: (session as any).expiresAt?.toISOString?.() || null,
        multiLocationEnabled: Boolean((session as any).multiLocationEnabled),
        activatedLoungeIds: provisionedIds,
        createdAt: (session as any).createdAt?.toISOString?.() || null,
        updatedAt: (session as any).updatedAt?.toISOString?.() || null,
        lastActivityAt: (session as any).lastActivityAt?.toISOString?.() || null,
      },
      locations: [...draftList, ...extras],
    });
  } catch (error: any) {
    console.error('[LaunchPad Locations] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load locations', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

