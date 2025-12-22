import { NextRequest, NextResponse } from 'next/server';
import { dynamicPricingEngine } from '../../../../lib/pricing/dynamic';
import { getCurrentTenant } from '../../../../lib/auth';

/**
 * POST /api/pricing/dynamic
 * Calculate dynamic pricing adjustments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      loungeId,
      customerPhone,
      customerId,
      sessionTime,
      basePrice,
      flavorPrices
    } = body;
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!loungeId || !basePrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: loungeId, basePrice' },
        { status: 400 }
      );
    }

    let tenantId: string | undefined;
    if (!isDevelopment) {
      const tenant = await getCurrentTenant();
      tenantId = tenant?.id;
    }

    const context = {
      loungeId,
      tenantId: tenantId || null,
      customerPhone: customerPhone || undefined,
      customerId: customerId || undefined,
      sessionTime: sessionTime ? new Date(sessionTime) : new Date(),
      basePrice: parseInt(basePrice) || 0,
      flavorPrices: flavorPrices || {}
    };

    const result = await dynamicPricingEngine.calculateDynamicPrice(context);

    return NextResponse.json({
      success: true,
      ...result,
      originalBasePrice: context.basePrice,
      percentageChange: context.basePrice > 0 
        ? ((result.totalAdjustment / context.basePrice) * 100).toFixed(1)
        : '0'
    });
  } catch (error) {
    console.error('Error calculating dynamic pricing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate dynamic pricing' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pricing/dynamic/rules
 * Get pricing rules for a lounge
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loungeId = searchParams.get('loungeId');
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

    // Get pricing rules (for now, return default rules)
    // In production, these would be stored in database
    const rules = await dynamicPricingEngine['getPricingRules'](loungeId, tenantId);

    return NextResponse.json({
      success: true,
      rules: rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        type: rule.type,
        isActive: rule.isActive,
        priority: rule.priority
      }))
    });
  } catch (error) {
    console.error('Error getting pricing rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get pricing rules' },
      { status: 500 }
    );
  }
}

