import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/** Canonical workflow stages (Payment → Light). NAN = guest has session. */
const STAGE_ORDER = ['Payment', 'Prep', 'Ready', 'Deliver', 'Light'] as const;
type Stage = (typeof STAGE_ORDER)[number];

/**
 * GET /api/analytics/penetration
 *
 * P0 Stripe-first: Workflow penetration off stage/action + Session.
 * Reduce-clicks: one headline = "reached guest" (Deliver or Light = same outcome; byStage gives split when needed).
 * Measures % of sessions that reach Deliver or Light (<30 / 50–60 / 70+ buckets).
 *
 * Query params:
 *   windowDays — days back (default 30, max 93)
 *   loungeId   — optional filter by lounge
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const windowDays = Math.min(
      Math.max(1, parseInt(searchParams.get('windowDays') || '30', 10)),
      93
    );
    const loungeId = searchParams.get('loungeId') || undefined;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - windowDays);

    const where = {
      createdAt: { gte: cutoff },
      state: { not: 'CANCELED' as const },
      ...(loungeId ? { loungeId } : {}),
    };

    const [total, byStageRows] = await Promise.all([
      prisma.session.count({ where }),
      prisma.session.groupBy({
        by: ['stage'],
        where: { ...where, stage: { not: null } },
        _count: { id: true },
      }),
    ]);

    const byStage: Record<string, number> = {};
    STAGE_ORDER.forEach((s) => (byStage[s] = 0));
    byStageRows.forEach((r) => {
      const stage = (r.stage as string) || 'Payment';
      if (STAGE_ORDER.includes(stage as Stage)) byStage[stage] = r._count.id;
      else byStage[stage] = (byStage[stage] ?? 0) + r._count.id;
    });

    // Streamline: Deliver + Light = one outcome ("guest has session" / NAN); byStage gives split when needed
    const reachedGuest =
      (byStage['Deliver'] ?? 0) + (byStage['Light'] ?? 0);
    const penetrationPct = total > 0 ? (reachedGuest / total) * 100 : 0;

    let bucket: '<30' | '30-50' | '50-60' | '70+';
    if (penetrationPct < 30) bucket = '<30';
    else if (penetrationPct < 50) bucket = '30-50';
    else if (penetrationPct < 70) bucket = '50-60';
    else bucket = '70+';

    return NextResponse.json({
      success: true,
      period: {
        windowDays,
        from: cutoff.toISOString(),
        to: new Date().toISOString(),
      },
      filter: { loungeId: loungeId ?? null },
      totalSessions: total,
      byStage,
      reachedGuest,
      reachedDeliverOrLight: reachedGuest,
      penetrationPct: Math.round(penetrationPct * 10) / 10,
      bucket,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Analytics Penetration] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get penetration', details: message },
      { status: 500 }
    );
  }
}
