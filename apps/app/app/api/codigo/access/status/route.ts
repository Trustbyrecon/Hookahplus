import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { getCodigoAccess, getCodigoAccessDaysRemaining, hasCodigoAccess } from '../../../../lib/codigo-access';
import { hasRole } from '../../../../lib/auth';

/**
 * GET /api/codigo/access/status
 * Returns CODIGO access status for the current user.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', hasAccess: false }, { status: 401 });
    }

    const isAdmin = await hasRole(req, ['owner', 'admin']);
    const access = await getCodigoAccess(user.id);
    const hasAccess = await hasCodigoAccess(user.id, isAdmin);
    const daysRemaining = await getCodigoAccessDaysRemaining(user.id);

    return NextResponse.json({
      hasAccess,
      isAdminOverride: isAdmin && !access,
      access: access
        ? {
            grantedAt: access.grantedAt.toISOString(),
            expiresAt: access.expiresAt.toISOString(),
            status: access.status,
            daysRemaining,
          }
        : null,
    });
  } catch (error) {
    console.error('[CODIGO Access] Status error:', error);
    return NextResponse.json(
      { error: 'Failed to get access status' },
      { status: 500 }
    );
  }
}
