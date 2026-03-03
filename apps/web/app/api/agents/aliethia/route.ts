// apps/web/app/api/agents/aliethia/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { aliethiaIdentity } from '../../../../lib/aliethiaIdentity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const profileId = searchParams.get('profileId');
    const venueId = searchParams.get('venueId');

    switch (action) {
      case 'profile':
        if (!profileId) {
          return NextResponse.json(
            { success: false, error: 'Profile ID required' },
            { status: 400 }
          );
        }
        const profile = aliethiaIdentity.getProfile(profileId);
        return NextResponse.json({
          success: true,
          data: profile || null
        });

      case 'badges':
        if (!profileId) {
          return NextResponse.json(
            { success: false, error: 'Profile ID required' },
            { status: 400 }
          );
        }
        const badges = aliethiaIdentity.getBadges(profileId, venueId || undefined);
        return NextResponse.json({
          success: true,
          data: badges
        });

      case 'kpis':
        const kpis = aliethiaIdentity.getKPIs();
        return NextResponse.json({
          success: true,
          data: kpis
        });

      case 'export':
        if (!profileId) {
          return NextResponse.json(
            { success: false, error: 'Profile ID required' },
            { status: 400 }
          );
        }
        const exportData = aliethiaIdentity.exportProfile(profileId);
        return NextResponse.json({
          success: true,
          data: exportData
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Aliethia.Identity API active',
            endpoints: ['profile', 'badges', 'kpis', 'export']
          }
        });
    }
  } catch (error) {
    console.error('Aliethia.Identity API error:', error);
    return NextResponse.json(
      { success: false, error: 'Aliethia.Identity API error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'check_in':
        const { profileId, venueId, staffId } = data;
        aliethiaIdentity.handleCheckIn(profileId, venueId, staffId);
        return NextResponse.json({
          success: true,
          message: 'Check-in processed'
        });

      case 'visit_closed':
        const { profileId: vcProfileId, venueId: vcVenueId, comboHash } = data;
        aliethiaIdentity.handleVisitClosed(vcProfileId, vcVenueId, comboHash);
        return NextResponse.json({
          success: true,
          message: 'Visit closed processed'
        });

      case 'mix_ordered':
        const { profileId: moProfileId, venueId: moVenueId, comboHash: moComboHash } = data;
        aliethiaIdentity.handleMixOrdered(moProfileId, moVenueId, moComboHash);
        return NextResponse.json({
          success: true,
          message: 'Mix ordered processed'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Aliethia.Identity API error:', error);
    return NextResponse.json(
      { success: false, error: 'Aliethia.Identity API error' },
      { status: 500 }
    );
  }
}
