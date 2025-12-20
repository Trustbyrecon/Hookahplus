import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TenantService } from '../../../../../../lib/services/TenantService';

const prisma = new PrismaClient();

/**
 * GET /api/tenants/[id]/config
 * Get tenant configuration
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: tenantId } = params;

    const result = await TenantService.getTenantConfig(tenantId, prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      config: result.config,
    });

  } catch (error) {
    console.error('[Tenant Config API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get tenant configuration'
    }, { status: 500 });
  }
}

/**
 * PUT /api/tenants/[id]/config
 * Update tenant configuration
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: tenantId } = params;
    const body = await req.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: config'
      }, { status: 400 });
    }

    const result = await TenantService.updateTenantConfig(tenantId, config, prisma);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration updated',
    });

  } catch (error) {
    console.error('[Tenant Config API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update tenant configuration'
    }, { status: 500 });
  }
}

