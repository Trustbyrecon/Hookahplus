import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '../../../../lib/supabase';

/**
 * GET /api/network-memory/bundle
 * Query params:
 * - hid: network HID
 * - loungeId: lounge identifier
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hid = searchParams.get('hid');
    const loungeId = searchParams.get('loungeId');

    if (!hid || !loungeId) {
      return NextResponse.json(
        { error: 'hid and loungeId are required' },
        { status: 400 }
      );
    }

    const supabase = await serverClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc('get_network_memory_bundle', {
      p_hid: hid,
      p_lounge_id: loungeId,
    });

    if (error) {
      console.error('[Network Memory Bundle] RPC error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch network memory', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Network Memory Bundle] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

