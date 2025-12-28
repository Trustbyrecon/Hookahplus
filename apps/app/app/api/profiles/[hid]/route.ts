import { NextRequest, NextResponse } from 'next/server';
import { getNetworkProfile } from '../../../../lib/profiles/network';

export async function GET(
  req: NextRequest,
  { params }: { params: { hid: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = searchParams.get('loungeId') || undefined;
    const scope = (searchParams.get('scope') as 'lounge' | 'network') || 'network';

    const profile = await getNetworkProfile(params.hid, loungeId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Filter notes by scope
    if (scope === 'lounge' && loungeId) {
      profile.notes = profile.notes?.filter(
        (n) => n.loungeId === loungeId || n.shareScope === 'network'
      );
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('[Network Profile] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get profile' },
      { status: 500 }
    );
  }
}

