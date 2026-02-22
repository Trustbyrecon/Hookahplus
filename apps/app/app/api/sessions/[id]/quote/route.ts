import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPricingSnapshot, createPricingSnapshot } from '@/lib/pricing-snapshots';

/**
 * GET /api/sessions/[id]/quote
 * Get pricing quote for a session
 * Returns existing snapshot if available, or calculates new one
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // Check if snapshot already exists
    const existingSnapshot = await getPricingSnapshot(sessionId);
    if (existingSnapshot) {
      return NextResponse.json({
        success: true,
        snapshot: existingSnapshot,
        cached: true,
      });
    }

    // If no snapshot exists, calculate one
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Calculate pricing (similar to checkout route)
    let basePrice = session.priceCents || 0;
    let ordersTotal = 0;
    const orderItems: any[] = [];

    for (const order of session.orders) {
      for (const item of order.items) {
        const itemTotal = item.priceCents * item.quantity;
        ordersTotal += itemTotal;
        orderItems.push({
          description: item.name,
          quantity: item.quantity,
          priceCents: item.priceCents,
          subtotal: itemTotal,
        });
      }
    }

    // Calculate time-based charges
    let timeCharge = 0;
    if (session.timerStartedAt && session.timerStatus === 'running') {
      const now = new Date();
      const startedAt = session.timerStartedAt;
      const elapsedMinutes = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60));
      const timerDuration = (session.timerDuration || 45 * 60) / 60;
      
      if (elapsedMinutes > timerDuration) {
        const overageMinutes = elapsedMinutes - timerDuration;
        timeCharge = overageMinutes * 100;
      }
    }

    const subtotal = basePrice + ordersTotal + timeCharge;
    const taxes = Math.round(subtotal * 0.08);
    const total = subtotal + taxes;

    // Build breakdown
    const breakdown = {
      basePrice: basePrice / 100,
      addOns: orderItems.map(item => ({
        name: item.description,
        priceCents: item.priceCents,
      })),
      premiumFlavors: [],
      adjustments: [],
      subtotal: subtotal / 100,
      finalPrice: total / 100,
    };

    // Parse flavor mix
    let mixItems: Array<{ name: string; quantity: number }> | undefined;
    if (session.flavorMix) {
      try {
        const mix = typeof session.flavorMix === 'string' 
          ? JSON.parse(session.flavorMix) 
          : session.flavorMix;
        if (Array.isArray(mix)) {
          mixItems = mix.map((flavor: string) => ({
            name: flavor,
            quantity: 1,
          }));
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Create snapshot
    await createPricingSnapshot(sessionId, breakdown, mixItems);

    // Get the created snapshot
    const snapshot = await getPricingSnapshot(sessionId);

    return NextResponse.json({
      success: true,
      snapshot: snapshot!,
      cached: false,
    });

  } catch (error) {
    console.error('Error getting quote:', error);
    return NextResponse.json(
      {
        error: 'Failed to get quote',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

