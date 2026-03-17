import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasRole } from '../../../../../lib/auth';
import { grantCodigoAccess } from '../../../../../lib/codigo-access';

/**
 * POST /api/codigo/access/grant
 * Admin-only. Grant CODIGO access to a user (or self).
 * Body: { userId?: string } — if omitted, grants to current user.
 */
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await hasRole(req, ['owner', 'admin']);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const targetUserId = (body.userId || user.id) as string;
    if (!targetUserId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { grantedAt, expiresAt } = await grantCodigoAccess(targetUserId, user.id);

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      grantedAt: grantedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[CODIGO Access] Grant error:', error);
    return NextResponse.json(
      { error: 'Failed to grant access' },
      { status: 500 }
    );
  }
}
