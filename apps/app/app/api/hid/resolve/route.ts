import { NextRequest, NextResponse } from 'next/server';
import { resolveHID, getProfileByHID } from '../../../../lib/hid/resolver';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, email, qrToken, deviceId } = body;

    if (!phone && !email && !qrToken && !deviceId) {
      return NextResponse.json(
        { error: 'At least one identifier is required (phone, email, qrToken, or deviceId)' },
        { status: 400 }
      );
    }

    const result = await resolveHID({ phone, email, qrToken, deviceId });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[HID Resolver] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve HID' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hid = searchParams.get('hid');
    const scope = (searchParams.get('scope') as 'lounge' | 'network') || 'network';

    if (!hid) {
      return NextResponse.json(
        { error: 'HID is required' },
        { status: 400 }
      );
    }

    const profile = await getProfileByHID(hid, scope);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('[HID Resolver] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get profile' },
      { status: 500 }
    );
  }
}

