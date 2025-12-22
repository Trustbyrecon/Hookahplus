import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/campaigns/lookup?ref=...&loungeId=...
 * Look up active campaign by QR code ref (campaignRef/qrPrefix)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    const loungeId = searchParams.get('loungeId');

    if (!ref) {
      return NextResponse.json(
        { error: 'ref parameter is required' },
        { status: 400 }
      );
    }

    // Find active campaign matching the ref
    const now = new Date();
    const campaign = await prisma.campaign.findFirst({
      where: {
        qrPrefix: ref,
        loungeId: loungeId || undefined,
        status: 'active',
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!campaign) {
      return NextResponse.json({
        success: true,
        campaign: null,
        message: 'No active campaign found for this reference'
      });
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        description: campaign.description,
        campaignConfig: campaign.campaignConfig,
        qrPrefix: campaign.qrPrefix
      }
    });
  } catch (error) {
    console.error('[Campaigns API] Error looking up campaign:', error);
    return NextResponse.json(
      {
        error: 'Failed to lookup campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

