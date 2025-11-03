import { NextRequest, NextResponse } from 'next/server';
import { calculatePrice, isWeekend, DEFAULT_FLAVOR_PRICES } from '../../../../lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flavors, addOns, tableId, loungeId, pricingModel, sessionDuration } = body;

    if (!flavors || !Array.isArray(flavors)) {
      return NextResponse.json(
        { error: 'Flavors array is required' },
        { status: 400 }
      );
    }

    // Validate pricing model
    if (pricingModel && pricingModel !== 'flat' && pricingModel !== 'time-based') {
      return NextResponse.json(
        { error: 'Invalid pricing model. Must be "flat" or "time-based"' },
        { status: 400 }
      );
    }

    // Validate session duration for time-based pricing
    if (pricingModel === 'time-based' && (!sessionDuration || sessionDuration < 15)) {
      return NextResponse.json(
        { error: 'Session duration is required for time-based pricing (minimum 15 minutes)' },
        { status: 400 }
      );
    }

    // Calculate pricing with flavor price map
    const pricing = calculatePrice({
      flavors,
      addOns: addOns || [],
      tableId,
      loungeId,
      isWeekend: isWeekend(),
      pricingModel: pricingModel || 'flat',
      sessionDuration: pricingModel === 'time-based' ? sessionDuration : undefined,
      flavorPrices: DEFAULT_FLAVOR_PRICES, // Pass flavor price map
    });

    return NextResponse.json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error('[Preorder Price API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate price',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

