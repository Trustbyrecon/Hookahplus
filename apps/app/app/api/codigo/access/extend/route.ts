import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { hasRole } from '../../../../lib/auth';
import { extendCodigoAccess } from '../../../../lib/codigo-access';

/**
 * POST /api/codigo/access/extend
 * Admin-only. Extend CODIGO access by 14 days.
 * Body: { userId?: string } — if omitted, extends for current user.
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

    const { expiresAt } = await extendCodigoAccess(targetUserId, user.id);

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[CODIGO Access] Extend error:', error);
    return NextResponse.json(
      { error: 'Failed to extend access' },
      { status: 500 }
    );
  }
}
