import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine } from '../../../../lib/ai-recommendations/engine';
import { getCurrentTenant } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/recommendations/flavors
 * Get AI-powered flavor recommendations for a customer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerPhone = searchParams.get('customerPhone');
    const customerId = searchParams.get('customerId');
    const loungeId = searchParams.get('loungeId');
    const currentSelection = searchParams.get('selection')?.split(',').filter(Boolean) || [];
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!loungeId) {
      return NextResponse.json(
        { success: false, error: 'Missing loungeId parameter' },
        { status: 400 }
      );
    }

    let tenantId: string | undefined;
    if (!isDevelopment) {
      const tenant = await getCurrentTenant();
      tenantId = tenant?.id;
    }

    // Get customer preferences if available
    let preferences: any = {};
    if (customerPhone || customerId) {
      // Try to get from loyalty profile
      const loyaltyProfile = await prisma.loyaltyProfile.findFirst({
        where: {
          loungeId,
          ...(customerPhone ? { guestKey: customerPhone } : {}),
        },
        take: 1
      });

      if (loyaltyProfile?.preferenceSummary) {
        try {
          preferences = JSON.parse(loyaltyProfile.preferenceSummary);
        } catch (e) {
          // Ignore parse errors
        }
      }

      // Get from past sessions
      const where: any = { loungeId };
      if (customerPhone) where.customerPhone = customerPhone;
      if (customerId) where.customerRef = customerId;

      const pastSessions = await prisma.session.findMany({
        where: {
          ...where,
          flavorMix: { not: null },
          paymentStatus: 'succeeded'
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      // Extract favorite flavors
      const flavorFrequency = new Map<string, number>();
      for (const session of pastSessions) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          for (const flavor of flavors) {
            flavorFrequency.set(flavor, (flavorFrequency.get(flavor) || 0) + 1);
          }
        }
      }

      // Get top 5 favorite flavors
      const favoriteFlavors = Array.from(flavorFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([flavor]) => flavor);

      preferences.favoriteFlavors = favoriteFlavors;
    }

    // Build recommendation context with time awareness
    // Use current time for time-based recommendations (late-night vs afternoon preferences)
    const sessionTime = new Date();
    
    const context = {
      customerPhone: customerPhone || undefined,
      customerId: customerId || undefined,
      loungeId,
      currentSelection: currentSelection.length > 0 ? currentSelection : undefined,
      sessionTime, // Include time for cyclical encoding and time-based recommendations
      preferences
    };

    // Get recommendations (now time-aware with cyclical encoding)
    const recommendations = await recommendationEngine.getFlavorRecommendations(context);

    return NextResponse.json({
      success: true,
      recommendations,
      context: {
        hasHistory: (customerPhone || customerId) ? true : false,
        selectionCount: currentSelection.length
      }
    });
  } catch (error) {
    console.error('Error getting flavor recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

