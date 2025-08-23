// app/api/checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
<<<<<<< HEAD
  apiVersion: '2024-12-18.acacia',
=======
  apiVersion: "2024-06-20",
>>>>>>> stripe-integration-clean
});

export async function POST(request: NextRequest) {
  try {
    const { lineItems, successUrl, cancelUrl } = await request.json();

    if (!lineItems || !Array.isArray(lineItems)) {
      return NextResponse.json(
        { error: 'Invalid line items' },
        { status: 400 }
      );
    }
<<<<<<< HEAD
=======
    
    const userRequests = recentRequests.get(clientIP);
    const validRequests = userRequests.filter((timestamp: number) => now - timestamp < 30000);
    
    if (validRequests.length >= 3) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait before creating another order." }, { status: 429 });
    }
    
    validRequests.push(now);
    recentRequests.set(clientIP, validRequests);
    (global as any).rateLimitRequests = recentRequests;

    const body = await req.json().catch(() => ({}));
    const { tableId = "T-001", flavor = "Blue Mist + Mint", addons = 0 } = body;

    // Create a local order id for trust binding
    const orderId = `ord_${Math.random().toString(36).slice(2, 10)}`;
    const trustSig = signTrust(orderId);

    // Record order (demo, ephemeral)
    addOrder({
      id: orderId,
      tableId,
      flavor,
      amount: 3000 + (addons * 150), // $30 base + $1.50 per addon
      currency: "usd",
      status: "created",
      createdAt: Date.now(),
    });
    
    // Audit log (MVP)
    console.log(`audit.order.created: ${new Date().toISOString()} | orderId: ${orderId} | tableId: ${tableId} | trustSig: ${trustSig} | addons: ${addons}`);

    // Build line items using the new product structure
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { 
        price: process.env.PRICE_SESSION_30!, 
        quantity: 1 
      }
    ];
    
    // Add flavor add-ons if requested
    if (addons > 0) {
      line_items.push({ 
        price: process.env.PRICE_FLAVOR_150!, 
        quantity: addons 
      });
    }
>>>>>>> stripe-integration-clean

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
<<<<<<< HEAD
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      metadata: {
        source: 'hookahplus-web',
        session_type: 'hookah_session',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
=======
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      line_items,
      metadata: {
        orderId,
        trustSig,
        tableId,
        flavor,
        addons: addons.toString(),
      },
    });

    return NextResponse.json({ url: session.url, orderId });
  } catch (e: any) {
    console.error('Checkout session creation error:', e);
    return NextResponse.json({ error: e.message ?? "Failed to create checkout session" }, { status: 500 });
>>>>>>> stripe-integration-clean
  }
}
