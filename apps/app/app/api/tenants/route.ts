import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from '../../../lib/services/TenantService';
import { prisma } from '../../../lib/db';
import { serverClient } from '../../../lib/supabase';

export const runtime = 'nodejs';

type CreateTenantBody = {
  name?: string;
  // Optional: if the caller wants auto-membership creation
  createMembership?: boolean;
  role?: 'owner' | 'admin' | 'staff' | 'viewer';
};

/**
 * GET /api/tenants/[id]
 * Get tenant information
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('id');

    if (!tenantId) {
      return NextResponse.json({
        success: false,
        error: 'Missing tenant ID'
      }, { status: 400 });
    }

    const result = await TenantService.getTenant(tenantId, prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tenant: result.tenant,
    });

  } catch (error) {
    console.error('[Tenants API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get tenant'
    }, { status: 500 });
  }
}

/**
 * POST /api/tenants
 * Create new tenant
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, createMembership = true, role = 'owner' } = (body || {}) as CreateTenantBody;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: name'
      }, { status: 400 });
    }

    const result = await TenantService.createTenant(name, prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    // If the caller is authenticated (typical signup flow), bind this tenant to the user canonically.
    // This is what unlocks admin settings: membership + JWT metadata.
    let userId: string | null = null;
    try {
      const supabase = serverClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;

      if (user && createMembership && result.tenantId) {
        await prisma.membership
          .create({
            data: {
              userId: user.id,
              tenantId: result.tenantId,
              role: role as any,
            },
          })
          .catch(async (e: any) => {
            // Ignore duplicate (idempotent) but surface other errors
            const msg = String(e?.message || '');
            if (!msg.toLowerCase().includes('unique') && !msg.toLowerCase().includes('already exists')) {
              throw e;
            }
          });

        const isAdmin = role === 'admin' || role === 'owner';
        await supabase.auth.updateUser({
          data: {
            tenant_id: result.tenantId,
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
      }
    } catch {
      // best-effort: tenant creation should still succeed even if auth binding fails
    }

    return NextResponse.json({
      success: true,
      // Return a "superset" response shape to stay compatible with older/newer clients.
      tenantId: result.tenantId,
      tenant_id: result.tenantId,
      tenant: result.tenantId ? { id: result.tenantId, name } : null,
      membership: result.tenantId && userId ? { userId, tenantId: result.tenantId, role } : null,
    });

  } catch (error) {
    console.error('[Tenants API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create tenant'
    }, { status: 500 });
  }
}
