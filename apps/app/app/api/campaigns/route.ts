import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { getCurrentTenant, getCurrentUser } from '../../../lib/auth';

/**
 * GET /api/campaigns
 * List all campaigns for the current lounge/tenant
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = searchParams.get('loungeId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    // In development, allow access without auth if loungeId is provided
    const isDevelopment = process.env.NODE_ENV === 'development';
    let tenantId: string | null = null;
    
    if (!isDevelopment) {
      tenantId = await getCurrentTenant(req);
    } else {
      // Try to get tenant, but don't fail if not available
      try {
        tenantId = await getCurrentTenant(req);
      } catch (err) {
        console.log('[Campaigns API] DEV mode - tenant lookup failed, continuing without auth');
      }
    }

    if (!loungeId && !tenantId) {
      return NextResponse.json(
        { error: 'loungeId or tenantId required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (loungeId) where.loungeId = loungeId;
    if (tenantId) where.tenantId = tenantId;
    if (status && status !== 'all') where.status = status;
    if (type && type !== 'all') where.type = type;

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaignUsages: {
          take: 10,
          orderBy: { appliedAt: 'desc' }
        }
      }
    });

    // Format campaigns for frontend
    const formattedCampaigns = campaigns.map(campaign => ({
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
      usageCount: campaign.campaignUsages.length
    }));

    return NextResponse.json({
      success: true,
      campaigns: formattedCampaigns,
      total: formattedCampaigns.length
    });
  } catch (error) {
    console.error('[Campaigns API] Error fetching campaigns:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch campaigns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      type,
      description,
      targetAudience,
      startDate,
      endDate,
      budget,
      channels,
      campaignConfig,
      qrPrefix,
      loungeId
    } = body;

    if (!name || !type || !loungeId) {
      return NextResponse.json(
        { error: 'name, type, and loungeId are required' },
        { status: 400 }
      );
    }

    // In development, allow access without auth if loungeId is provided
    const isDevelopment = process.env.NODE_ENV === 'development';
    let user = null;
    let tenantId: string | null = null;
    
    if (!isDevelopment) {
      user = await getCurrentUser(req);
      tenantId = await getCurrentTenant(req);
    } else {
      // Try to get user/tenant, but don't fail if not available
      try {
        user = await getCurrentUser(req);
        tenantId = await getCurrentTenant(req);
      } catch (err) {
        console.log('[Campaigns API] DEV mode - auth lookup failed, continuing without auth');
      }
    }

    // Validate campaign type
    const validTypes = [
      'loyalty',
      'promotional',
      'email',
      'sms',
      'social',
      'percentage_off',
      'first_x_customers',
      'buy_x_get_y',
      'time_limited'
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid campaign type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        loungeId,
        tenantId,
        name,
        type,
        status: 'draft',
        description: description || null,
        targetAudience: targetAudience || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        budgetCents: Math.round((budget || 0) * 100),
        spentCents: 0,
        reach: 0,
        engagement: 0,
        conversions: 0,
        roi: 0,
        channels: channels ? JSON.stringify(channels) : null,
        campaignConfig: campaignConfig || null,
        qrPrefix: qrPrefix || null,
        createdBy: user?.email || user?.id || 'system'
      }
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
    console.error('[Campaigns API] Error creating campaign:', error);
    return NextResponse.json(
      {
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

