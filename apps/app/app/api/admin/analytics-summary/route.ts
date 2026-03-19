import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { requireRole, getCurrentTenant } from '../../../../lib/auth';

const ACTIVE_STATES = ['PENDING', 'ACTIVE', 'PAUSED'] as const;

function rangeToMs(range: string): number {
  switch (range) {
    case '24h':
      return 24 * 60 * 60 * 1000;
    case '7d':
      return 7 * 24 * 60 * 60 * 1000;
    case '30d':
      return 30 * 24 * 60 * 60 * 1000;
    case '90d':
      return 90 * 24 * 60 * 60 * 1000;
    case '1y':
      return 365 * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

function pctChange(curr: number, prev: number): number | null {
  if (prev <= 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

/**
 * GET /api/admin/analytics-summary?loungeId=CODIGO&range=7d
 * loungeId omitted = tenant-wide (all lounges for tenant).
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['admin', 'owner']);
    const tenantId = await getCurrentTenant(req);
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'No tenant context' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const loungeId = (searchParams.get('loungeId') || '').trim() || null;
    const range = searchParams.get('range') || '7d';
    const ms = rangeToMs(range);
    const now = new Date();
    const periodStart = new Date(now.getTime() - ms);
    const prevStart = new Date(periodStart.getTime() - ms);

    const baseWhere: Record<string, unknown> = {
      state: { notIn: ['CANCELED'] },
    };
    if (loungeId) {
      baseWhere.loungeId = loungeId;
    } else {
      baseWhere.tenantId = tenantId;
    }

    const paidWhere = {
      ...baseWhere,
      paymentStatus: 'succeeded' as const,
    };

    const periodPaidWhere = { ...paidWhere, createdAt: { gte: periodStart, lte: now } };
    const prevPaidWhere = { ...paidWhere, createdAt: { gte: prevStart, lt: periodStart } };

    const periodSessionWhere = { ...baseWhere, createdAt: { gte: periodStart, lte: now } };
    const prevSessionWhere = { ...baseWhere, createdAt: { gte: prevStart, lt: periodStart } };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const [
      revCurr,
      revPrev,
      sessCurr,
      sessPrev,
      activeNow,
      todayRev,
      yesterdayRev,
      flavorGroups,
      tableGroups,
      durationAgg,
      guestGroups,
      teamMemberCount,
    ] = await Promise.all([
      prisma.session.aggregate({
        where: periodPaidWhere,
        _sum: { priceCents: true },
        _count: { id: true },
      }),
      prisma.session.aggregate({
        where: prevPaidWhere,
        _sum: { priceCents: true },
        _count: { id: true },
      }),
      prisma.session.count({ where: periodSessionWhere }),
      prisma.session.count({ where: prevSessionWhere }),
      prisma.session.count({
        where: {
          ...baseWhere,
          state: { in: [...ACTIVE_STATES] },
        },
      }),
      prisma.session.aggregate({
        where: {
          ...paidWhere,
          createdAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { priceCents: true },
      }),
      prisma.session.aggregate({
        where: {
          ...paidWhere,
          createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
        },
        _sum: { priceCents: true },
      }),
      prisma.session.groupBy({
        by: ['flavor'],
        where: {
          ...periodPaidWhere,
          flavor: { not: null },
        },
        _count: { id: true },
        _sum: { priceCents: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),
      prisma.session.groupBy({
        by: ['tableId'],
        where: {
          ...periodPaidWhere,
          tableId: { not: null },
        },
        _count: { id: true },
        _sum: { priceCents: true },
        orderBy: { _count: { id: 'desc' } },
        take: 15,
      }),
      prisma.session.aggregate({
        where: {
          ...periodSessionWhere,
          durationSecs: { not: null },
        },
        _avg: { durationSecs: true },
      }),
      prisma.session.groupBy({
        by: ['hid'],
        where: {
          ...periodSessionWhere,
          hid: { not: null },
        },
        _count: { _all: true },
      }),
      prisma.membership.count({ where: { tenantId } }),
    ]);

    const revenueCents = revCurr._sum.priceCents ?? 0;
    const revenuePrevCents = revPrev._sum.priceCents ?? 0;
    const sessionCount = sessCurr;
    const sessionPrevCount = sessPrev;
    const paidCount = revCurr._count.id;

    const avgDurationSecs = durationAgg._avg.durationSecs ?? 0;
    const avgPerSessionCents = paidCount > 0 ? Math.round(revenueCents / paidCount) : 0;
    const daysInRange = Math.max(1, ms / (24 * 60 * 60 * 1000));
    const dailyAvgCents = Math.round(revenueCents / daysInRange);

    const topFlavors = flavorGroups.map((g) => ({
      name: g.flavor || 'Unknown',
      count: g._count.id,
      revenueCents: g._sum.priceCents ?? 0,
    }));

    const tablePerformance = await Promise.all(
      tableGroups.map(async (g) => {
        const avgDur = await prisma.session.aggregate({
          where: {
            ...periodPaidWhere,
            tableId: g.tableId,
            durationSecs: { not: null },
          },
          _avg: { durationSecs: true },
        });
        return {
          table: g.tableId || '—',
          sessions: g._count.id,
          revenueCents: g._sum.priceCents ?? 0,
          avgDurationMinutes: Math.round((avgDur._avg.durationSecs ?? 0) / 60),
        };
      })
    );

    const guestCount = guestGroups.length;

    const todayRevenueCents = todayRev._sum.priceCents ?? 0;
    const yesterdayRevenueCents = yesterdayRev._sum.priceCents ?? 0;
    const todayRevenueChangePct = pctChange(todayRevenueCents, yesterdayRevenueCents);

    return NextResponse.json({
      success: true,
      range,
      loungeId,
      overview: {
        revenueCents,
        revenueChangePct: pctChange(revenueCents, revenuePrevCents),
        sessionCount,
        sessionChangePct: pctChange(sessionCount, sessionPrevCount),
        distinctGuests: guestCount,
        guestChangePct: null as number | null,
        avgDurationMinutes: Math.round(avgDurationSecs / 60),
        avgDurationChangePct: null as number | null,
        activeSessionsNow: activeNow,
        todayRevenueCents,
        todayRevenueChangePct,
        teamMemberCount,
      },
      revenue: {
        totalCents: revenueCents,
        avgPerSessionCents,
        dailyAvgCents,
      },
      sessions: {
        total: sessionCount,
        avgDurationMinutes: Math.round(avgDurationSecs / 60),
      },
      users: {
        totalDistinctGuests: guestCount,
        activeInRange: guestCount,
        inactive: 0,
      },
      topFlavors,
      tablePerformance,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg.includes('Unauthorized') ? 401 : msg.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
