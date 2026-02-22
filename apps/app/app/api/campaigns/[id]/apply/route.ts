import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

/**
 * POST /api/campaigns/[id]/apply
 * Apply a campaign to a session/checkout
 * This calculates the discount and records usage
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await req.json();
    const { sessionId, customerRef, subtotalCents } = body;

    if (!subtotalCents) {
      return NextResponse.json(
        { error: 'subtotalCents is required' },
        { status: 400 }
      );
    }

    // Get campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if campaign is active
    const now = new Date();
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      );
    }

    if (campaign.startDate > now || (campaign.endDate && campaign.endDate < now)) {
      return NextResponse.json(
        { error: 'Campaign is not currently active' },
        { status: 400 }
      );
    }

    // Calculate discount based on campaign type
    let discountCents = 0;
    const config = campaign.campaignConfig as any;

    switch (campaign.type) {
      case 'percentage_off':
        const percentage = config?.percentageOff || 0;
        const minSpend = (config?.minimumSpend || 0) * 100;
        if (subtotalCents >= minSpend) {
          discountCents = Math.round(subtotalCents * (percentage / 100));
        }
        break;

      case 'buy_x_get_y':
        // This would need item-level logic, simplified here
        const buy = config?.buyXGetY?.buy || 2;
        const get = config?.buyXGetY?.get || 1;
        // Simplified: if buying enough items, discount the "get" items
        // In practice, this would need item-level tracking
        break;

      case 'first_x_customers':
        // Check if customer is within first X
        const firstX = config?.firstXCustomers || 50;
        const usageCount = await prisma.campaignUsage.count({
          where: { campaignId }
        });
        if (usageCount < firstX) {
          discountCents = (config?.discountAmount || 0) * 100;
        }
        break;

      case 'time_limited':
        // Time-limited campaigns are validated by date range above
        discountCents = (config?.discountAmount || 0) * 100;
        break;

      default:
        // Other campaign types (loyalty, email, sms, social) don't apply discounts directly
        discountCents = 0;
    }

    // Record usage
    const usage = await prisma.campaignUsage.create({
      data: {
        campaignId,
        sessionId: sessionId || null,
        customerRef: customerRef || null,
        discountCents: discountCents > 0 ? discountCents : null,
        metadata: {
          subtotalCents,
          appliedAt: new Date().toISOString()
        }
      }
    });

    // Update campaign metrics
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        conversions: { increment: 1 },
        spentCents: { increment: discountCents },
        reach: { increment: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      discountCents,
      discountAmount: discountCents / 100,
      finalAmount: (subtotalCents - discountCents) / 100,
      usage: {
        id: usage.id,
        appliedAt: usage.appliedAt
      }
    });
  } catch (error) {
    console.error('[Campaigns API] Error applying campaign:', error);
    return NextResponse.json(
      {
        error: 'Failed to apply campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

