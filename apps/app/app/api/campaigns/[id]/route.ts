import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';

/**
 * GET /api/campaigns/[id]
 * Get a specific campaign
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        campaignUsages: {
          take: 50,
          orderBy: { appliedAt: 'desc' }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        description: campaign.description,
        targetAudience: campaign.targetAudience,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budget: campaign.budgetCents / 100,
        spent: campaign.spentCents / 100,
        reach: campaign.reach,
        engagement: campaign.engagement,
        conversions: campaign.conversions,
        roi: campaign.roi,
        channels: campaign.channels ? JSON.parse(campaign.channels) : [],
        campaignConfig: campaign.campaignConfig,
        qrPrefix: campaign.qrPrefix,
        createdAt: campaign.createdAt,
        createdBy: campaign.createdBy,
        usageCount: campaign.campaignUsages.length,
        recentUsages: campaign.campaignUsages.map(usage => ({
          id: usage.id,
          sessionId: usage.sessionId,
          customerRef: usage.customerRef,
          discountCents: usage.discountCents,
          appliedAt: usage.appliedAt,
          metadata: usage.metadata
        }))
      }
    });
  } catch (error) {
    console.error('[Campaigns API] Error fetching campaign:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/campaigns/[id]
 * Update a campaign
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      type,
      status,
      description,
      targetAudience,
      startDate,
      endDate,
      budget,
      channels,
      campaignConfig,
      qrPrefix
    } = body;

    // Check if campaign exists
    const existing = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (budget !== undefined) updateData.budgetCents = Math.round(budget * 100);
    if (channels !== undefined) updateData.channels = channels ? JSON.stringify(channels) : null;
    if (campaignConfig !== undefined) updateData.campaignConfig = campaignConfig;
    if (qrPrefix !== undefined) updateData.qrPrefix = qrPrefix;

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        description: campaign.description,
        targetAudience: campaign.targetAudience,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budget: campaign.budgetCents / 100,
        spent: campaign.spentCents / 100,
        reach: campaign.reach,
        engagement: campaign.engagement,
        conversions: campaign.conversions,
        roi: campaign.roi,
        channels: campaign.channels ? JSON.parse(campaign.channels) : [],
        campaignConfig: campaign.campaignConfig,
        qrPrefix: campaign.qrPrefix,
        createdAt: campaign.createdAt,
        createdBy: campaign.createdBy
      }
    });
  } catch (error) {
    console.error('[Campaigns API] Error updating campaign:', error);
    return NextResponse.json(
      {
        error: 'Failed to update campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a campaign
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if campaign exists
    const existing = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Delete campaign (cascade will delete usages)
    await prisma.campaign.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('[Campaigns API] Error deleting campaign:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

