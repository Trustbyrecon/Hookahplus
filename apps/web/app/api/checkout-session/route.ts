import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPriceId, getSessionTierConfig } from '../../../lib/stripe-catalog';
import { signTrust, generateClientReference } from '../../../lib/trustlock';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Rate limiting: 3 requests per IP per 30s
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 30000 }); // 30 seconds
    return true;
  }
  
  if (limit.count >= 3) {
    return false;
  }
  
  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Debug: Log environment status
    console.log('Stripe Secret Key available:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Stripe Secret Key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));
    
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in 30 seconds.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { tableId, flavor, amount, sessionTier = 'base' } = body;

    // Validate required fields
    if (!tableId || !flavor || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: tableId, flavor, amount' },
        { status: 400 }
      );
    }

    // Get Stripe price ID based on session tier
    const sessionConfig = getSessionTierConfig(sessionTier as 'base' | 'premium' | 'vip');
    const priceId = sessionConfig?.priceId;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Product not found. Please try again.' },
        { status: 400 }
      );
    }

    // Generate order ID and Trust-Lock signature
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const trustResult = signTrust(orderId, amount, {
      tableId,
      flavor,
      sessionTier
    });
    const clientRef = generateClientReference(orderId, trustResult.signature);

    // Create Stripe checkout session
    console.log('Creating Stripe session with:', { tableId, flavor, amount, sessionTier, priceId });
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}/checkout?cancelled=true`,
      client_reference_id: clientRef,
      metadata: {
        tableId,
        flavor,
        sessionTier,
        trustSignature: trustResult.signature,
        orderId,
        loungeId: 'default'
      },
      customer_email: undefined, // Let Stripe collect email
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
    });
    
    console.log('Stripe session created successfully:', session.id);

    return NextResponse.json({
      id: session.id,
      url: session.url,
      amount: amount,
      currency: 'usd',
      tableId,
      flavor,
      sessionTier,
      status: 'open'
    });

  } catch (error: any) {
    console.error('Checkout session error:', error);
    console.error('Error details:', {
      type: error.type,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode
    });

    // Handle Stripe-specific errors
    if (error.type?.startsWith('Stripe')) {
      return NextResponse.json(
        { error: `Payment processing error: ${error.message} (Code: ${error.code})` },
        { status: 400 }
      );
    }

    // Handle network/connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Network error: Unable to connect to Stripe. Please check your internet connection.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Failed to create checkout session: ${error.message}` },
      { status: 500 }
    );
  }
}
