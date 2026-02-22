import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAliethiaPolicy } from '../../../../../../lib/aliethia/policy';

const prisma = new PrismaClient();

/**
 * GET /api/sessions/[id]/upsell/policy
 *
 * Read-only: returns Aliethia policy + computed eligibility gates for this session.
 * This does not perform an upsell; it exists so UI/business logic can share one source of truth.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = (id || '').trim();
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'session id is required' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        loungeId: true,
        tenantId: true,
        createdAt: true,
        startedAt: true,
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const policy = await getAliethiaPolicy({
      loungeId: session.loungeId,
      tenantId: session.tenantId,
      sessionId: session.id,
    });

    const now = new Date();
    const sessionStart = session.startedAt || session.createdAt;
    const sessionAgeMinutes = Math.max(0, Math.round((now.getTime() - new Date(sessionStart).getTime()) / 60000));

    const eligibility = (() => {
      if (!policy.upsell.enabled) return { eligible: false, reason: 'UPSSELL_DISABLED' as const };
      const e = policy.upsell.eligibility;
      if (typeof e.minSessionAgeMinutes === 'number' && sessionAgeMinutes < e.minSessionAgeMinutes) {
        return { eligible: false, reason: 'TOO_EARLY' as const, sessionAgeMinutes };
      }
      if (typeof e.maxSessionAgeMinutes === 'number' && sessionAgeMinutes > e.maxSessionAgeMinutes) {
        return { eligible: false, reason: 'TOO_LATE' as const, sessionAgeMinutes };
      }
      // Tier / trust gates are optional; if not provided in ctx they are not enforced here.
      return { eligible: true, reason: 'OK' as const, sessionAgeMinutes };
    })();

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        loungeId: session.loungeId,
        tenantId: session.tenantId,
        sessionAgeMinutes,
      },
      policy,
      eligibility,
    });
  } catch (error: any) {
    console.error('[Upsell Policy] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute upsell policy', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

