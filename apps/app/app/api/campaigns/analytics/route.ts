import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getCurrentTenant } from '../../../../lib/auth';

/**
 * GET /api/campaigns/analytics
 * Get campaign performance analytics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = searchParams.get('loungeId');
    const campaignId = searchParams.get('campaignId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
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
        console.log('[Campaigns Analytics API] DEV mode - tenant lookup failed, continuing without auth');
      }
    }

    if (!loungeId && !tenantId && !campaignId) {
      return NextResponse.json(
        { error: 'loungeId, tenantId, or campaignId required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (campaignId) {
      where.id = campaignId;
    } else {
      if (loungeId) where.loungeId = loungeId;
      if (tenantId) where.tenantId = tenantId;
    }

    // Get campaigns with usage data
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        campaignUsages: {
          where: {
            ...(startDate && { appliedAt: { gte: new Date(startDate) } }),
            ...(endDate && { appliedAt: { lte: new Date(endDate) } })
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate analytics for each campaign
    const analytics = campaigns.map(campaign => {
      const usages = campaign.campaignUsages;
      const totalUsages = usages.length;
      const totalDiscountCents = usages.reduce((sum, usage) => sum + (usage.discountCents || 0), 0);
      const totalDiscount = totalDiscountCents / 100;
      const totalSpent = campaign.spentCents / 100;
      const budget = campaign.budgetCents / 100;
      const conversions = campaign.conversions || totalUsages;
      const reach = campaign.reach || 0;

      // Calculate ROI: (Revenue from conversions - Campaign cost) / Campaign cost
      // For now, estimate revenue per conversion at $40 average
      const avgRevenuePerConversion = 40; // This could be calculated from actual session data
      const estimatedRevenue = conversions * avgRevenuePerConversion;
      const roi = budget > 0 ? ((estimatedRevenue - totalSpent) / totalSpent) * 100 : 0;

      // Conversion rate: conversions / reach * 100
      const conversionRate = reach > 0 ? (conversions / reach) * 100 : 0;

      // Engagement rate (if we have engagement data)
      const engagementRate = campaign.engagement || 0;

      // Cost per conversion
      const costPerConversion = conversions > 0 ? totalSpent / conversions : 0;

      // Budget utilization
      const budgetUtilization = budget > 0 ? (totalSpent / budget) * 100 : 0;

      // Calculate daily stats
      const dailyStats = calculateDailyStats(usages, campaign.startDate, campaign.endDate);

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        campaignType: campaign.type,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        metrics: {
          totalUsages,
          conversions,
          reach,
          totalDiscount,
          totalSpent,
          budget,
          budgetRemaining: budget - totalSpent,
          budgetUtilization,
          roi: roi.toFixed(2),
          conversionRate: conversionRate.toFixed(2),
          engagementRate: engagementRate.toFixed(2),
          costPerConversion: costPerConversion.toFixed(2),
          avgDiscountPerUsage: totalUsages > 0 ? (totalDiscount / totalUsages).toFixed(2) : 0
        },
        dailyStats,
        recentUsages: usages.slice(0, 10).map(usage => ({
          id: usage.id,
          sessionId: usage.sessionId,
          customerRef: usage.customerRef,
          discountCents: usage.discountCents,
          appliedAt: usage.appliedAt
        }))
      };
    });

    // Calculate aggregate metrics
    const aggregateMetrics = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalSpent: campaigns.reduce((sum, c) => sum + (c.spentCents / 100), 0),
      totalBudget: campaigns.reduce((sum, c) => sum + (c.budgetCents / 100), 0),
      totalConversions: campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0),
      totalReach: campaigns.reduce((sum, c) => sum + (c.reach || 0), 0),
      avgROI: analytics.length > 0 
        ? (analytics.reduce((sum, a) => sum + parseFloat(a.metrics.roi), 0) / analytics.length).toFixed(2)
        : '0.00',
      avgConversionRate: analytics.length > 0
        ? (analytics.reduce((sum, a) => sum + parseFloat(a.metrics.conversionRate), 0) / analytics.length).toFixed(2)
        : '0.00'
    };

    return NextResponse.json({
      success: true,
      analytics,
      aggregateMetrics,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (error) {
    console.error('[Campaigns Analytics API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch campaign analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate daily statistics for campaign usage
 */
function calculateDailyStats(usages: any[], startDate: Date, endDate: Date | null) {
  const stats: Record<string, { date: string; usages: number; discount: number; conversions: number }> = {};
  
  usages.forEach(usage => {
    const date = new Date(usage.appliedAt).toISOString().split('T')[0];
    if (!stats[date]) {
      stats[date] = {
        date,
        usages: 0,
        discount: 0,
        conversions: 0
      };
    }
    stats[date].usages += 1;
    stats[date].discount += (usage.discountCents || 0) / 100;
    stats[date].conversions += 1;
  });

  // Fill in missing dates with zero values
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const allDates: string[] = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    allDates.push(dateStr);
    if (!stats[dateStr]) {
      stats[dateStr] = {
        date: dateStr,
        usages: 0,
        discount: 0,
        conversions: 0
      };
    }
  }

  return allDates.map(date => stats[date]).sort((a, b) => a.date.localeCompare(b.date));
}

