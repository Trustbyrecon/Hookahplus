import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createPricingSnapshot } from '@/lib/pricing-snapshots';

const prisma = new PrismaClient();

/**
 * POST /api/sessions/[id]/checkout
 * Calculate final amount and prepare for payment
 * 
 * Body: {
 *   provider?: "stripe" | "clover" | "toast" (default: "stripe")
 * }
 * 
 * Response: {
 *   amount: number (in cents)
 *   lineItems: Array<{ description, quantity, priceCents }>
 *   taxes?: number
 *   total: number
 *   paymentIntent?: string (Stripe PI ID if provider is stripe)
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const body = await req.json();
    const { provider = 'stripe' } = body;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          include: {
            items: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Calculate base session price
    let basePrice = session.priceCents || 0;

    // Add order items
    const orderItems: any[] = [];
    let ordersTotal = 0;

    for (const order of session.orders) {
      for (const item of order.items) {
        const itemTotal = item.priceCents * item.quantity;
        ordersTotal += itemTotal;
        
        orderItems.push({
          description: item.name,
          quantity: item.quantity,
          priceCents: item.priceCents,
          subtotal: itemTotal,
          orderType: order.type
        });
      }
    }

    // Calculate time-based charges if timer is running
    let timeCharge = 0;
    if (session.timerStartedAt && session.timerStatus === 'running') {
      const now = new Date();
      const startedAt = session.timerStartedAt;
      const elapsedMinutes = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60));
      const timerDuration = (session.timerDuration || 45 * 60) / 60; // Convert to minutes
      
      // If over time, calculate overage
      if (elapsedMinutes > timerDuration) {
        const overageMinutes = elapsedMinutes - timerDuration;
        // Simple overage calculation: $1 per minute over
        timeCharge = overageMinutes * 100; // 100 cents = $1
      }
    }

    // Calculate taxes (simplified - 8% sales tax)
    const subtotal = basePrice + ordersTotal + timeCharge;
    const taxes = Math.round(subtotal * 0.08);
    const total = subtotal + taxes;

    // Build line items for receipt
    const lineItems = [
      {
        description: 'Base Session',
        quantity: 1,
        priceCents: basePrice
      },
      ...orderItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        priceCents: item.subtotal
      })),
      ...(timeCharge > 0 ? [{
        description: 'Overtime Charge',
        quantity: 1,
        priceCents: timeCharge
      }] : []),
      {
        description: 'Tax',
        quantity: 1,
        priceCents: taxes
      }
    ];

    // If Stripe, create payment intent
    let paymentIntent = null;
    if (provider === 'stripe') {
      try {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        paymentIntent = await stripe.paymentIntents.create({
          amount: total,
          currency: 'usd',
          metadata: {
            sessionId,
            loungeId: session.loungeId,
            tableId: session.tableId || ''
          }
        });

        // Update session with payment intent
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            paymentIntent: paymentIntent.id,
            paymentStatus: 'pending'
          }
        });
      } catch (stripeError) {
        console.warn('Stripe payment intent creation failed:', stripeError);
        // Continue without payment intent - can be created later
      }
    }

    // Create pricing snapshot before checkout
    // This ensures we have an immutable record of pricing at checkout time
    const breakdown = {
      basePrice: basePrice / 100, // Convert to dollars
      addOns: orderItems.map(item => ({
        name: item.description,
        priceCents: item.priceCents,
      })),
      premiumFlavors: [], // TODO: Detect premium flavors from mix
      adjustments: [], // TODO: Include adjustments from SessionAdjustment
      subtotal: subtotal / 100,
      finalPrice: total / 100,
    };

    // Parse flavor mix if available
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

    try {
      await createPricingSnapshot(sessionId, breakdown, mixItems);
    } catch (snapshotError) {
      console.error('Failed to create pricing snapshot:', snapshotError);
      // Don't fail checkout if snapshot creation fails, but log it
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId: session.loungeId,
        action: 'CHECKOUT_INITIATED',
        entityType: 'Session',
        entityId: sessionId,
        changes: JSON.stringify({
          basePrice,
          ordersTotal,
          timeCharge,
          taxes,
          total,
          provider
        })
      }
    });

    return NextResponse.json({
      success: true,
      checkout: {
        amount: total,
        lineItems,
        taxes,
        total,
        breakdown: {
          basePrice,
          ordersTotal,
          timeCharge,
          taxes,
          total
        },
        paymentIntent: paymentIntent?.id || null,
        provider
      }
    });

  } catch (error) {
    console.error('Error calculating checkout:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate checkout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

