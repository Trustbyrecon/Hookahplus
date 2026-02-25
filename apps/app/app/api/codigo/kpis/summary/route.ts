import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

const LOUNGE_ID = 'CODIGO';

function parseDateOrNull(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function safeJsonArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v));
    return [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startRaw = searchParams.get('start');
    const endRaw = searchParams.get('end');

    const end = parseDateOrNull(endRaw) ?? new Date();
    const start =
      parseDateOrNull(startRaw) ??
      new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const whereBase = {
      loungeId: LOUNGE_ID,
      createdAt: {
        gte: start,
        lt: end,
      },
    } as const;

    const [sessionsCount, sessionsWithMemberCount] = await Promise.all([
      prisma.session.count({ where: whereBase }),
      prisma.session.count({ where: { ...whereBase, hid: { not: null } } }),
    ]);

    const durationAgg = await prisma.session.aggregate({
      where: { ...whereBase, durationSecs: { not: null } },
      _avg: { durationSecs: true },
      _count: { _all: true },
    });

    const sessions = await prisma.session.findMany({
      where: whereBase,
      select: {
        id: true,
        createdAt: true,
        startedAt: true,
        endedAt: true,
        durationSecs: true,
        tableId: true,
        hid: true,
        flavorMix: true,
        flavor: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 5000, // pilot-safe cap
    });

    const distinctHids = Array.from(
      new Set(
        sessions
          .map((s) => (typeof s.hid === 'string' ? s.hid.trim() : ''))
          .filter(Boolean)
      )
    );

    // Repeat rate: 2+ sessions per HID in window (if identity exists)
    const repeatGroups = distinctHids.length
      ? await prisma.session.groupBy({
          by: ['hid'],
          where: { ...whereBase, hid: { in: distinctHids } },
          _count: { _all: true },
        })
      : [];
    const repeaters = repeatGroups.filter((g: any) => (g?._count?._all || 0) >= 2).length;
    const repeatRate = distinctHids.length ? repeaters / distinctHids.length : null;

    // Profile completion: member has phoneHash or emailHash (best-effort)
    const completedProfiles = distinctHids.length
      ? await prisma.networkProfile.findMany({
          where: {
            hid: { in: distinctHids },
            OR: [{ phoneHash: { not: null } }, { emailHash: { not: null } }],
          },
          select: { hid: true },
        })
      : [];
    const profileCompletedCount = completedProfiles.length;
    const profileCompletionRate = distinctHids.length
      ? profileCompletedCount / distinctHids.length
      : null;

    // Premium attachment: session flavor mix includes a premium flavor (if configured)
    const premiumFlavors = await prisma.flavor.findMany({
      where: { loungeId: LOUNGE_ID, isPremium: true },
      select: { name: true },
    });
    const premiumSet = new Set(premiumFlavors.map((f) => f.name.trim()).filter(Boolean));

    let premiumSessions = 0;
    if (premiumSet.size > 0) {
      for (const s of sessions) {
        const mix = safeJsonArray(s.flavorMix);
        const names = mix.length ? mix : s.flavor ? [s.flavor] : [];
        if (names.some((n) => premiumSet.has(String(n).trim()))) premiumSessions += 1;
      }
    }
    const premiumAttachmentRate = premiumSet.size > 0 && sessionsCount > 0
      ? premiumSessions / sessionsCount
      : null;

    // Idle time estimate: gap between consecutive sessions per table
    const byTable = new Map<string, Array<{ startMs: number; endMs: number | null }>>();
    for (const s of sessions) {
      const tableKey = (s.tableId || '').trim();
      if (!tableKey) continue;
      const startMs = (s.startedAt ? new Date(s.startedAt).getTime() : s.createdAt.getTime());
      let endMs: number | null = null;
      if (s.endedAt) endMs = new Date(s.endedAt).getTime();
      else if (typeof s.durationSecs === 'number' && s.startedAt) {
        endMs = new Date(s.startedAt).getTime() + s.durationSecs * 1000;
      }
      const arr = byTable.get(tableKey) || [];
      arr.push({ startMs, endMs });
      byTable.set(tableKey, arr);
    }

    const gapsSecs: number[] = [];
    for (const arr of byTable.values()) {
      const sorted = [...arr].sort((a, b) => a.startMs - b.startMs);
      for (let i = 1; i < sorted.length; i += 1) {
        const prevEnd = sorted[i - 1].endMs;
        const nextStart = sorted[i].startMs;
        if (!prevEnd) continue;
        const gapMs = nextStart - prevEnd;
        if (gapMs > 0) gapsSecs.push(Math.round(gapMs / 1000));
      }
    }
    const idleAvgSecs = gapsSecs.length ? Math.round(gapsSecs.reduce((a, b) => a + b, 0) / gapsSecs.length) : null;
    const idleMedianSecs = median(gapsSecs);

    const memberCaptureRate = sessionsCount > 0 ? sessionsWithMemberCount / sessionsCount : null;

    return NextResponse.json(
      {
        loungeId: LOUNGE_ID,
        window: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        sessions: {
          count: sessionsCount,
          withMember: sessionsWithMemberCount,
          memberCaptureRate,
        },
        premium: {
          definition: premiumSet.size > 0 ? 'premium flavor in flavorMix' : null,
          premiumSessions: premiumSet.size > 0 ? premiumSessions : null,
          attachmentRate: premiumAttachmentRate,
        },
        duration: {
          method: 'durationSecs avg (when present)',
          avgSeconds: durationAgg?._avg?.durationSecs ?? null,
          coverageSessions: durationAgg?._count?._all ?? 0,
        },
        idleTime: {
          method: 'table consecutive-session gaps (best-effort)',
          avgSeconds: idleAvgSecs,
          medianSeconds: idleMedianSecs,
          samples: gapsSecs.length,
        },
        profiles: {
          capturedMembers: distinctHids.length,
          completed: profileCompletedCount,
          completionRate: profileCompletionRate,
        },
        repeat: {
          members: distinctHids.length,
          repeaters,
          repeatRate,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[CODIGO KPIs] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to compute KPIs' },
      { status: 500 }
    );
  }
}

