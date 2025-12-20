import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TenantService } from '../../../../lib/services/TenantService';

const prisma = new PrismaClient();

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
    const { name } = body;

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

    return NextResponse.json({
      success: true,
      tenantId: result.tenantId,
    });

  } catch (error) {
    console.error('[Tenants API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create tenant'
    }, { status: 500 });
  }
}
