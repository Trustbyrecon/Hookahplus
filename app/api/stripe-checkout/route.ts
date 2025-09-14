import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeConfig } from '@/lib/stripe-config';
import { calculateDynamicPrice } from '@/lib/stripe-catalog';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      tableId,
      customerName,
      customerEmail,
      flavors,
      totalAmount,
      isTestMode = false,
      membershipTier,
      isBundle = false,
      specialInstructions = '',
      successUrl,
      cancelUrl
    } = body;

    // Validate required fields
    if (!sessionId || !tableId || !customerName || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate dynamic pricing
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0') + ':00';
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const dynamicPrice = calculateDynamicPrice(totalAmount, {
      hour,
      day,
      isMember: !!membershipTier,
      membershipTier,
      isBundle
    });

    // Apply test mode pricing
    const finalAmount = isTestMode ? 100 : dynamicPrice; // $1.00 for test mode

    console.log(`Creating checkout session: ${finalAmount} cents (${isTestMode ? 'TEST MODE' : 'LIVE'})`);

    // Create line items for checkout
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Hookah+ Session - ${customerName}`,
            description: `Table ${tableId} - ${flavors?.join(', ') || 'Classic Hookah'}`,
            metadata: {
              sessionId,
              tableId,
              customerName,
              flavors: JSON.stringify(flavors || []),
              specialInstructions
            }
          },
          unit_amount: finalAmount,
        },
        quantity: 1,
      }
    ];

    // Add bundle items if applicable
    if (isBundle) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Bundle Discount',
            description: '10% bundle discount applied',
            metadata: {
              sessionId: sessionId,
              tableId: tableId,
              customerName: customerName,
              flavors: JSON.stringify(flavors || []),
              specialInstructions: specialInstructions
            }
          },
          unit_amount: -Math.round(finalAmount * 0.1), // Negative amount for discount
        },
        quantity: 1,
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/fire-session-dashboard?sessionId=${sessionId}&payment=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/preorder/${tableId}?payment=cancelled`,
      customer_email: customerEmail,
      metadata: {
        sessionId,
        tableId,
        customerName,
        customerEmail: customerEmail || '',
        customerPhone: body.customerPhone || '',
        flavors: JSON.stringify(flavors || []),
        totalAmount: totalAmount.toString(),
        dynamicPrice: dynamicPrice.toString(),
        isTestMode: isTestMode.toString(),
        membershipTier: membershipTier || '',
        isBundle: isBundle.toString(),
        specialInstructions,
        timestamp: now.toISOString()
      },
      payment_intent_data: {
        metadata: {
          sessionId,
          tableId,
          customerName,
          customerEmail: customerEmail || '',
          customerPhone: body.customerPhone || '',
          flavors: JSON.stringify(flavors || []),
          totalAmount: totalAmount.toString(),
          dynamicPrice: dynamicPrice.toString(),
          isTestMode: isTestMode.toString(),
          membershipTier: membershipTier || '',
          isBundle: isBundle.toString(),
          specialInstructions,
          timestamp: now.toISOString()
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US']
      }
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      amount: finalAmount,
      isTestMode,
      dynamicPrice,
      originalAmount: totalAmount
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Get checkout session status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      created: session.created
    });

  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve checkout session' },
      { status: 500 }
    );
  }
}
