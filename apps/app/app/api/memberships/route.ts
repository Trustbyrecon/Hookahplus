import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { serverClient } from '../../../lib/supabase';

export const runtime = 'nodejs';

type Body = {
  tenantId?: string;
  role?: 'owner' | 'admin' | 'staff' | 'viewer';
};

/**
 * POST /api/memberships
 * Creates (or ensures) a membership for the current authenticated user.
 *
 * This is used by signup / onboarding flows to "harden" canonical access
 * to admin surfaces by binding user -> tenant with a role.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = serverClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const tenantId = String(body?.tenantId || '').trim();
    const role = (body?.role || 'owner') as Body['role'];

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Missing required field: tenantId' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    await prisma.membership.upsert({
      where: {
        userId_tenantId: { userId: user.id, tenantId },
      },
      update: {
        role: role as any,
      },
      create: {
        userId: user.id,
        tenantId,
        role: role as any,
      },
    });

    const isAdmin = role === 'admin' || role === 'owner';
    await supabase.auth.updateUser({
      data: {
        tenant_id: tenantId,
        role,
        ...(isAdmin
          ? {
              admin_verified: true,
              active_role: 'admin',
              role_verified_at: new Date().toISOString(),
            }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      membership: { userId: user.id, tenantId, role },
    });
  } catch (error: any) {
    console.error('[Memberships API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create membership', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

