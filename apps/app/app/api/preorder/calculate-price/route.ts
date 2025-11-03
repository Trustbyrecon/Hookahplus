import { NextRequest, NextResponse } from 'next/server';
import { calculatePrice, isWeekend } from '../../../../lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flavors, addOns, tableId, loungeId } = body;

    if (!flavors || !Array.isArray(flavors)) {
      return NextResponse.json(
        { error: 'Flavors array is required' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const pricing = calculatePrice({
      flavors,
      addOns: addOns || [],
      tableId,
      loungeId,
      isWeekend: isWeekend(),
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

