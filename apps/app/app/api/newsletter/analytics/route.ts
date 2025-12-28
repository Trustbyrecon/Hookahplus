import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

/**
 * GET /api/newsletter/analytics
 * 
 * Analytics endpoint for tracking newsletter → customer → network node conversion
 * Part of MOAT strategy measurement
 * 
 * Query params:
 * - days: Number of days to look back (default: 30)
 * - metric: Specific metric to return (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');
    const metric = searchParams.get('metric');

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get newsletter signups
    const newsletterSignups = await prisma.reflexEvent.findMany({
      where: {
        type: { startsWith: 'cta.' },
        ctaType: 'newsletter_signup',
        createdAt: { gte: since },
      },
      select: {
        id: true,
        email: true,
        metadata: true,
        createdAt: true,
      },
    });

    // Get onboarding signups (customers)
    const onboardingSignups = await prisma.reflexEvent.findMany({
      where: {
        type: { startsWith: 'cta.' },
        ctaType: 'onboarding_signup',
        createdAt: { gte: since },
      },
      select: {
        id: true,
        email: true,
        metadata: true,
        createdAt: true,
      },
    });

    // Get network profiles created
    const networkProfiles = await prisma.networkProfile.findMany({
      where: {
        createdAt: { gte: since },
      },
      select: {
        id: true,
        hid: true,
        emailHash: true,
        phoneHash: true,
        consentLevel: true,
        createdAt: true,
      },
    });

    // Calculate conversions
    const newsletterEmails = new Set(
      newsletterSignups
        .map(s => s.email)
        .filter(Boolean) as string[]
    );

    const onboardingEmails = new Set(
      onboardingSignups
        .map(s => s.email)
        .filter(Boolean) as string[]
    );

    // Newsletter → Customer conversion
    const convertedEmails = Array.from(newsletterEmails).filter(email =>
      onboardingEmails.has(email)
    );

    // Extract HIDs from newsletter signups
    const newsletterHIDs = new Set<string>();
    for (const signup of newsletterSignups) {
      const metadata = typeof signup.metadata === 'string'
        ? JSON.parse(signup.metadata)
        : signup.metadata || {};
      if (metadata.hid) {
        newsletterHIDs.add(metadata.hid);
      }
    }

    // Newsletter → Network Node conversion
    const networkHIDs = new Set(networkProfiles.map(p => p.hid));
    const networkNodesFromNewsletter = Array.from(newsletterHIDs).filter(hid =>
      networkHIDs.has(hid)
    );

    // Content engagement analysis
    const contentEngagement: Record<string, number> = {};
    for (const signup of newsletterSignups) {
      const metadata = typeof signup.metadata === 'string'
        ? JSON.parse(signup.metadata)
        : signup.metadata || {};
      
      const pages = metadata.contentPages || metadata.contentEngagement?.pages || [];
      for (const page of pages) {
        contentEngagement[page] = (contentEngagement[page] || 0) + 1;
      }
    }

    // Build response
    const stats = {
      period: {
        days,
        since: since.toISOString(),
        until: new Date().toISOString(),
      },
      newsletter: {
        totalSignups: newsletterSignups.length,
        uniqueEmails: newsletterEmails.size,
        withHID: newsletterHIDs.size,
        withContentEngagement: newsletterSignups.filter(s => {
          const metadata = typeof s.metadata === 'string'
            ? JSON.parse(s.metadata)
            : s.metadata || {};
          return metadata.contentPages || metadata.contentEngagement;
        }).length,
      },
      customers: {
        totalOnboardingSignups: onboardingSignups.length,
        uniqueEmails: onboardingEmails.size,
      },
      network: {
        totalProfiles: networkProfiles.length,
        shadowProfiles: networkProfiles.filter(p => p.consentLevel === 'shadow').length,
        claimedProfiles: networkProfiles.filter(p => p.consentLevel !== 'shadow').length,
      },
      conversion: {
        newsletterToCustomer: {
          count: convertedEmails.length,
          rate: newsletterEmails.size > 0
            ? (convertedEmails.length / newsletterEmails.size) * 100
            : 0,
        },
        newsletterToNetworkNode: {
          count: networkNodesFromNewsletter.length,
          rate: newsletterHIDs.size > 0
            ? (networkNodesFromNewsletter.length / newsletterHIDs.size) * 100
            : 0,
        },
        customerToNetworkNode: {
          count: networkProfiles.filter(p => {
            // Check if profile was created after onboarding
            return p.createdAt >= since;
          }).length,
        },
      },
      contentEngagement: {
        topPages: Object.entries(contentEngagement)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([page, count]) => ({ page, signups: count })),
        totalPagesViewed: Object.keys(contentEngagement).length,
      },
    };

    // Return specific metric if requested
    if (metric) {
      const metricMap: Record<string, any> = {
        'newsletter-signups': stats.newsletter.totalSignups,
        'conversion-rate': stats.conversion.newsletterToCustomer.rate,
        'network-nodes': stats.network.totalProfiles,
        'content-engagement': stats.contentEngagement,
      };

      if (metricMap[metric] !== undefined) {
        return NextResponse.json({
          success: true,
          metric,
          value: metricMap[metric],
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error: any) {
    console.error('[Newsletter Analytics] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get analytics' },
      { status: 500 }
    );
  }
}

