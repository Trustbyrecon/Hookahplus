import { NextResponse } from 'next/server';
import { serverClient } from '../../../../lib/supabase';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/me/operator-context
 * Lounges (tenant scopes) the signed-in user may access via memberships.
 * loungeId matches Session.loungeId / LoungeConfig for LaunchPad-provisioned tenants (tenant UUID).
 */
export async function GET() {
  try {
    const supabase = await serverClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: { tenant: true },
      orderBy: { createdAt: 'asc' },
    });

    const lounges = memberships.map((m) => ({
      loungeId: m.tenantId,
      name: m.tenant?.name?.trim() || m.tenantId,
      role: String(m.role),
    }));

    const allowOrgWide =
      lounges.length > 1 ||
      lounges.some((l) => l.role === 'owner' || l.role === 'admin');

    return NextResponse.json({
      success: true,
      lounges,
      allowOrgWide,
    });
  } catch (e) {
    console.error('[operator-context] GET error:', e);
    return NextResponse.json(
      { success: false, error: 'Failed to load operator context' },
      { status: 500 }
    );
  }
}
