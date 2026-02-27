import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { hasRole } from '../../../../../lib/auth';

function parseDateOrNull(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function safeJsonArray(value: unknown): string[] {
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

/**
 * GET /api/pilots/codigo/baseline?loungeId=...&start=...&end=...
 * CODIGO Week 1 baseline KPI endpoint (admin only).
 * Requires lounge to have softLaunchEnabled.
 */
export async function GET(req: NextRequest) {
  try {
    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const loungeId = (searchParams.get('loungeId') || '').trim();
    if (!loungeId) {
      return NextResponse.json({ error: 'loungeId is required' }, { status: 400 });
    }

    const end = parseDateOrNull(searchParams.get('end')) ?? new Date();
    const start =
      parseDateOrNull(searchParams.get('start')) ??
      new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    const whereBase = {
      loungeId,
      createdAt: { gte: start, lt: end },
    } as const;

    // Verify lounge exists and has softLaunchEnabled
    const loungeConfig = await prisma.loungeConfig.findFirst({
      where: { loungeId },
      orderBy: { version: 'desc' },
      select: { softLaunchEnabled: true },
    });

    if (!loungeConfig?.softLaunchEnabled) {
      return NextResponse.json(
        { error: 'Lounge not found or soft launch not enabled' },
        { status: 404 }
      );
    }

    // Single session query: fetch all needed fields
    const sessions = await prisma.session.findMany({
      where: whereBase,
      select: {
        id: true,
        state: true,
        durationSecs: true,
        flavorMix: true,
        flavor: true,
        zoneId: true,
        edgeCase: true,
      },
      take: 50000,
    });

    const sessions_total = sessions.length;
    const sessions_closed = sessions.filter((s) => s.state === 'CLOSED').length;
    const sessions_closed_pct =
      sessions_total > 0 ? sessions_closed / sessions_total : 0;

    const durations = sessions
      .map((s) => s.durationSecs)
      .filter((d): d is number => typeof d === 'number' && d > 0);
    const avg_session_duration_minutes =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length / 60
        : null;

    // Premium: flavorMix includes premium flavor (from Flavor table)
    const premiumFlavors = await prisma.flavor.findMany({
      where: { loungeId, isPremium: true },
      select: { name: true },
    });
    const premiumSet = new Set(
      premiumFlavors.map((f) => f.name.trim()).filter(Boolean)
    );
    let premiumSessions = 0;
    if (premiumSet.size > 0) {
      for (const s of sessions) {
        const mix = safeJsonArray(s.flavorMix);
        const names = mix.length ? mix : s.flavor ? [s.flavor] : [];
        if (names.some((n) => premiumSet.has(String(n).trim()))) premiumSessions += 1;
      }
    }
    const premium_attachment_rate =
      sessions_total > 0 && premiumSet.size > 0
        ? premiumSessions / sessions_total
        : 0;

    // Sessions by floor (zoneId = floor tagging); empty if no zoneId on any session
    const sessions_by_floor: Record<string, number> = {};
    const zoneIds = [...new Set(sessions.map((s) => s.zoneId).filter(Boolean))] as string[];
    if (zoneIds.length > 0) {
      const zones = await prisma.zone.findMany({
        where: { id: { in: zoneIds } },
        select: { id: true, name: true },
      });
      const zoneNameById = new Map(zones.map((z) => [z.id, z.name]));
      for (const s of sessions) {
        const key = s.zoneId
          ? (zoneNameById.get(s.zoneId) || s.zoneId)
          : '_untagged';
        sessions_by_floor[key] = (sessions_by_floor[key] || 0) + 1;
      }
      if (sessions_by_floor['_untagged'] && Object.keys(sessions_by_floor).length === 1) {
        delete sessions_by_floor['_untagged'];
      }
    }

    const anomalies_count = sessions.filter((s) => s.edgeCase != null).length;

    return NextResponse.json({
      loungeId,
      window: { start: start.toISOString(), end: end.toISOString() },
      sessions_total,
      sessions_closed_pct,
      avg_session_duration_minutes:
        avg_session_duration_minutes != null
          ? Math.round(avg_session_duration_minutes * 10) / 10
          : null,
      premium_attachment_rate:
        premiumSet.size > 0 ? Math.round(premium_attachment_rate * 1000) / 1000 : 0,
      sessions_by_floor,
      anomalies_count,
    });
  } catch (error) {
    console.error('[CODIGO Baseline] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute baseline KPIs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
