import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2023-10-16' 
});

/**
 * POST /api/subscribe
 * 
 * Creates a Stripe checkout session for subscription signup
 * 
 * Body:
 * - tier: 'starter' | 'pro' | 'trust_plus'
 * - billingCycle: 'monthly' | 'annual'
 * - email: (optional) customer email
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier = 'pro', billingCycle = 'monthly', email } = body;

    // Map tier names to price IDs
    const priceMap: Record<string, Record<string, string | undefined>> = {
      starter: {
        monthly: process.env.PRICE_TIER_STARTER,
        annual: process.env.PRICE_TIER_STARTER_ANNUAL,
      },
      pro: {
        monthly: process.env.PRICE_TIER_PRO,
        annual: process.env.PRICE_TIER_PRO_ANNUAL,
      },
      trust_plus: {
        monthly: process.env.PRICE_TIER_TRUST_PLUS,
        annual: process.env.PRICE_TIER_TRUST_PLUS_ANNUAL,
      },
    };

    const priceId = priceMap[tier]?.[billingCycle];
    
    if (!priceId) {
      // Fallback: try to use monthly price if annual not configured
      const fallbackPrice = priceMap[tier]?.monthly;
      if (!fallbackPrice) {
        return NextResponse.json(
          { error: `Price not configured for tier: ${tier} (${billingCycle})` },
          { status: 400 }
        );
      }
      console.warn(`[Subscribe] Annual price not configured for ${tier}, using monthly price`);
    }

    const finalPriceId = priceId || priceMap[tier]?.monthly!;

    // Get site URL for redirects
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   req.headers.get('origin') || 
                   'https://hookahplus.net';

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ 
        price: finalPriceId, 
        quantity: 1 
      }],
      success_url: `${siteUrl}/thank-you/subscription?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${siteUrl}/pricing?canceled=true`,
      metadata: {
        tier,
        billing_cycle: billingCycle,
        subscription_type: 'saas_tier',
        source: 'pricing_page'
      },
      subscription_data: {
        metadata: {
          tier,
          billing_cycle: billingCycle,
          subscription_type: 'saas_tier'
        }
      },
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({ 
      success: true,
      url: session.url,
      sessionId: session.id 
    });

  } catch (error: any) {
    console.error('[Subscribe API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create subscription checkout',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

