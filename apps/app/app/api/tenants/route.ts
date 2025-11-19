import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '../../../lib/supabase';
import { prisma } from '../../../lib/db';

/**
 * Create a new tenant
 * Uses service role to bypass RLS (required for tenant creation)
 * This endpoint should be called during signup
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tenant name is required' },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const admin = adminClient();

    // Create tenant using service role (bypasses RLS)
    const { data: tenantData, error: tenantError } = await admin
      .from('tenants')
      .insert({
        name: name.trim(),
      })
      .select()
      .single();

    if (tenantError) {
      console.error('[Tenants API] Failed to create tenant:', tenantError);
      return NextResponse.json(
        { error: 'Failed to create tenant', details: tenantError.message },
        { status: 500 }
      );
    }

    if (!tenantData) {
      return NextResponse.json(
        { error: 'Tenant creation returned no data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tenant: tenantData,
    });
  } catch (error: any) {
    console.error('[Tenants API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

