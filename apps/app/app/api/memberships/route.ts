import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '../../../lib/supabase';
import { serverClient } from '../../../lib/supabase';

/**
 * Create a new membership
 * Uses service role to bypass RLS (required for membership creation during signup)
 * This endpoint should be called during signup after tenant creation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, tenantId, role = 'owner' } = body;

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: 'userId and tenantId are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'staff', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const admin = adminClient();

    // Create membership using service role (bypasses RLS)
    const { data: membershipData, error: membershipError } = await admin
      .from('memberships')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        role: role,
      })
      .select()
      .single();

    if (membershipError) {
      console.error('[Memberships API] Failed to create membership:', membershipError);
      return NextResponse.json(
        { error: 'Failed to create membership', details: membershipError.message },
        { status: 500 }
      );
    }

    if (!membershipData) {
      return NextResponse.json(
        { error: 'Membership creation returned no data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      membership: membershipData,
    });
  } catch (error: any) {
    console.error('[Memberships API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get memberships for the current user
 * Uses server client (respects RLS)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = serverClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's memberships (RLS will filter to only their own)
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('*, tenants(*)')
      .eq('user_id', user.id);

    if (membershipsError) {
      console.error('[Memberships API] Failed to fetch memberships:', membershipsError);
      return NextResponse.json(
        { error: 'Failed to fetch memberships', details: membershipsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      memberships: memberships || [],
    });
  } catch (error: any) {
    console.error('[Memberships API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

