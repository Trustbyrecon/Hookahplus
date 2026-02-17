import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { computeReadiness } from '../../../../lib/launchpad/readiness';
import { getCurrentUser, requireAuth } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeArray<T = any>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

function bearerToken(req: NextRequest): string {
  const header = req.headers.get('authorization') || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || '';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = (searchParams.get('token') || '').trim();
    const sid = (searchParams.get('sid') || '').trim();
    const includeChecklist = (searchParams.get('includeChecklist') || '').trim() === '1';

    if (!token && !sid) {
      return NextResponse.json({ success: false, error: 'token or sid is required' }, { status: 400 });
    }

    const internalAdminToken = (process.env.INTERNAL_ADMIN_TOKEN || '').trim();
    const isInternalByToken = Boolean(internalAdminToken && bearerToken(req) && bearerToken(req) === internalAdminToken);

    let user: any = null;
    if (!isInternalByToken) {
      if (process.env.NODE_ENV === 'production') {
        user = await requireAuth(req);
      } else {
        user = await getCurrentUser(req);
      }
    }

    const session = token
      ? await prisma.setupSession.findUnique({ where: { token } } as any)
      : await prisma.setupSession.findFirst({ where: { stripeCheckoutSessionId: sid } } as any);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Setup session not found' }, { status: 404 });
    }

    // Access control (production): allow internal token OR the owner/user bound to this session OR a member of provisioned lounges.
    if (process.env.NODE_ENV === 'production' && !isInternalByToken) {
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const provisionedIds: string[] = [
        ...(session.loungeId ? [String(session.loungeId)] : []),
        ...safeArray<string>((session as any).activatedLoungeIds),
      ].filter(Boolean);

      const directOwner = session.userId && String(session.userId) === String(user.id);

      let memberOfProvisioned = false;
      if (!directOwner && provisionedIds.length) {
        const m = await prisma.membership.findFirst({
          where: {
            userId: String(user.id),
            tenantId: { in: provisionedIds as any },
          } as any,
          select: { tenantId: true },
        } as any);
        memberOfProvisioned = Boolean(m?.tenantId);
      }

      if (!directOwner && !memberOfProvisioned) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const progress: any = (session as any).progress || {};
    const step1: any = progress?.data?.step1 || {};

    const draftLocationsFromStep = safeArray(step1?.locations).map((l: any) => ({
      name: String(l?.name || '').trim(),
      tablesCount: Number(l?.tablesCount || 0) || null,
      sectionsCount: Number(l?.sectionsCount || 0) || null,
      operatingHours: l?.operatingHours || null,
    }));

    const draftLocationsFromSession = safeArray((session as any).locationDrafts).map((l: any) => ({
      name: String(l?.name || '').trim(),
      tablesCount: Number(l?.tablesCount || 0) || null,
      sectionsCount: Number(l?.sectionsCount || 0) || null,
      operatingHours: l?.operatingHours || null,
    }));

    const draftLocations =
      draftLocationsFromStep.length > 0
        ? draftLocationsFromStep
        : (draftLocationsFromSession.length > 0 ? draftLocationsFromSession : []);

    const activatedIds: string[] = safeArray<string>((session as any).activatedLoungeIds).filter(Boolean);
    const provisionedIds = activatedIds.length ? activatedIds : (session.loungeId ? [String(session.loungeId)] : []);

    const readinessByLoungeId: Record<string, any> = {};
    await Promise.all(
      provisionedIds.map(async (loungeId) => {
        const r = await computeReadiness({ loungeId, token: session.token });
        readinessByLoungeId[loungeId] = includeChecklist ? r : { success: true, loungeId, score: r.score };
      })
    );

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        token: session.token,
        setupLink: (session as any).setupLink || null,
        status: (session as any).status || null,
        source: (session as any).source || null,
        stripeCheckoutSessionId: (session as any).stripeCheckoutSessionId || null,
        loungeId: (session as any).loungeId || null,
        organizationId: (session as any).organizationId || null,
        organizationSlug: (session as any).organizationSlug || null,
        multiLocationEnabled: Boolean((session as any).multiLocationEnabled),
        locationDrafts: (session as any).locationDrafts || null,
        activatedLoungeIds: provisionedIds,
        createdAt: (session as any).createdAt?.toISOString?.() || null,
        updatedAt: (session as any).updatedAt?.toISOString?.() || null,
        expiresAt: (session as any).expiresAt?.toISOString?.() || null,
        lastActivityAt: (session as any).lastActivityAt?.toISOString?.() || null,
      },
      derived: {
        isExpired: Boolean((session as any).expiresAt && new Date((session as any).expiresAt).getTime() < Date.now()),
        draftLocationCount: draftLocations.length,
        provisionedLocationCount: provisionedIds.length,
      },
      organization: {
        name: String(step1?.organizationName || '').trim() || null,
      },
      locations: draftLocations.map((d, idx) => ({
        index: idx,
        ...d,
        loungeId: provisionedIds[idx] || null,
        readiness: (provisionedIds[idx] && readinessByLoungeId[provisionedIds[idx]]) ? readinessByLoungeId[provisionedIds[idx]] : null,
      })),
      readinessByLoungeId,
      progress, // full progress JSON for troubleshooting (non-PII in current flow)
    });
  } catch (error: any) {
    console.error('[Admin SetupSession] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to inspect setup session', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

