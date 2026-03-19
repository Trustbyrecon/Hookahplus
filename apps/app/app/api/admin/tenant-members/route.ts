import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { requireRole, getCurrentTenant } from '../../../../lib/auth';
import { adminClient } from '../../../../lib/supabase';

/**
 * GET /api/admin/tenant-members
 * Memberships for current tenant + Supabase emails (live user list, no demo rows).
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['admin', 'owner']);
    const tenantId = await getCurrentTenant(req);
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'No tenant context' }, { status: 400 });
    }

    const memberships = await prisma.membership.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
      select: { userId: true, role: true, createdAt: true },
    });

    let emailByUserId: Record<string, string> = {};
    try {
      const supabase = adminClient();
      const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (!error && data?.users) {
        emailByUserId = Object.fromEntries(
          data.users.map((u) => [u.id, u.email || '']).filter(([, e]) => e)
        );
      }
    } catch {
      // service role missing in dev — still return userIds
    }

    const users = memberships.map((m) => ({
      id: m.userId,
      userId: m.userId,
      email: emailByUserId[m.userId] || '(email unavailable)',
      name: emailByUserId[m.userId]?.split('@')[0] || m.userId.slice(0, 8),
      phone: '—',
      role: String(m.role),
      status: 'active',
      lastLogin: '—',
      joinDate: m.createdAt ? m.createdAt.toISOString().slice(0, 10) : '—',
      avatar: '👤',
    }));

    return NextResponse.json({ success: true, users });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg.includes('Unauthorized') ? 401 : msg.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
