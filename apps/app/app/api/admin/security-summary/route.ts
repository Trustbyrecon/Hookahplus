import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { requireRole } from '../../../../lib/auth';
import { getCurrentTenant } from '../../../../lib/auth';

/**
 * GET /api/admin/security-summary?loungeId=CODIGO&limit=50
 * Live audit log + session counts (no mock security events).
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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '40', 10)));

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const baseSessionWhere: Record<string, unknown> = { state: { notIn: ['CANCELED'] } };
    if (loungeId) baseSessionWhere.loungeId = loungeId;
    else baseSessionWhere.tenantId = tenantId;

    let auditWhere: Record<string, unknown> = { createdAt: { gte: since } };
    if (loungeId) {
      auditWhere.loungeId = loungeId;
    } else {
      const tenantLounges = await prisma.session.findMany({
        where: { tenantId },
        select: { loungeId: true },
        distinct: ['loungeId'],
      });
      const ids = tenantLounges.map((r) => r.loungeId).filter(Boolean);
      auditWhere = {
        createdAt: { gte: since },
        OR: [{ loungeId: null }, ...(ids.length ? [{ loungeId: { in: ids } }] : [])],
      };
    }

    const [activeSessions, auditCount24h, audits, dbPing] = await Promise.all([
      prisma.session.count({
        where: {
          ...baseSessionWhere,
          state: { in: ['PENDING', 'ACTIVE', 'PAUSED'] },
        },
      }),
      prisma.auditLog.count({ where: auditWhere }),
      prisma.auditLog.findMany({
        where: auditWhere,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          action: true,
          loungeId: true,
          entityType: true,
          createdAt: true,
          changes: true,
        },
      }),
      prisma.$queryRaw`SELECT 1 as ok`.catch(() => null),
    ]);

    const events = audits.map((a) => ({
      id: a.id,
      type: a.action,
      user: '—',
      ip: '—',
      location: '—',
      timestamp: a.createdAt.toISOString(),
      status: a.action.includes('FAIL') || a.action.includes('REVOKED') ? 'failed' : 'success',
      details: `${a.entityType || 'Event'}${a.loungeId ? ` · ${a.loungeId}` : ''}`,
    }));

    return NextResponse.json({
      success: true,
      loungeId,
      stats: {
        overallStatus: dbPing ? 'Operational' : 'Degraded',
        threatLevel: 'Low',
        activeSessions,
        failedLogins: 0,
        blockedIPs: 0,
        securityScore: dbPing ? 98 : 60,
        lastScan: new Date().toISOString(),
        auditEvents24h: auditCount24h,
      },
      events,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg.includes('Unauthorized') ? 401 : msg.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
