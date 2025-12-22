import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine } from '../../../../lib/ai-recommendations/engine';
import { getCurrentTenant } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/recommendations/mixes
 * Get AI-powered mix recommendations for a customer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerPhone = searchParams.get('customerPhone');
    const customerId = searchParams.get('customerId');
    const loungeId = searchParams.get('loungeId');
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!loungeId) {
      return NextResponse.json(
        { success: false, error: 'Missing loungeId parameter' },
        { status: 400 }
      );
    }

    // Get customer preferences if available
    let preferences: any = {};
    if (customerPhone || customerId) {
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
        take: 20
      });

      // Extract saved mixes from past orders
      const savedMixes: Array<{ flavors: string[]; name?: string }> = [];
      const seenMixes = new Set<string>();
      
      for (const session of pastSessions) {
        if (session.flavorMix && typeof session.flavorMix === 'object') {
          const mix = session.flavorMix as any;
          const flavors = Array.isArray(mix.flavors) ? mix.flavors : [];
          if (flavors.length > 0) {
            const mixKey = flavors.sort().join(',');
            if (!seenMixes.has(mixKey)) {
              seenMixes.add(mixKey);
              savedMixes.push({
                flavors,
                name: mix.name || `Mix from ${new Date(session.createdAt).toLocaleDateString()}`
              });
            }
          }
        }
      }

      preferences.savedMixes = savedMixes.slice(0, 5); // Top 5 saved mixes
    }

    // Build recommendation context
    const context = {
      customerPhone: customerPhone || undefined,
      customerId: customerId || undefined,
      loungeId,
      preferences
    };

    // Get recommendations
    const recommendations = await recommendationEngine.getMixRecommendations(context);

    return NextResponse.json({
      success: true,
      recommendations,
      context: {
        hasHistory: (customerPhone || customerId) ? true : false
      }
    });
  } catch (error) {
    console.error('Error getting mix recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

