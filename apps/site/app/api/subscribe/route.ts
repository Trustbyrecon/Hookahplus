import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '../../../lib/stripeServer';

/**
 * POST /api/subscribe
 * 
 * Creates a Stripe checkout session for subscription signup
 * 
 * Body:
 * - tier: 'starter' | 'pro' | 'trust_plus'
 * - billingCycle: 'monthly' | 'annual'
 * - email: (optional) customer email
 * - addons: Array<{ key: string; name?: string }> (optional)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, billingCycle, email, addons = [] } = body ?? {};

    const normalizedTier = tier === 'starter' || tier === 'pro' || tier === 'trust_plus' ? tier : 'pro';
    const normalizedBillingCycle = billingCycle === 'annual' ? 'annual' : 'monthly';

    // Require email for subscription
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Stripe client (supports STRIPE_SECRET_KEY or STRIPE_TEST_SECRET_KEY)
    const stripe = getStripe();

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

    const priceId = priceMap[normalizedTier]?.[normalizedBillingCycle];
    
    if (!priceId) {
      // Fallback: try to use monthly price if annual not configured
      const fallbackPrice = priceMap[normalizedTier]?.monthly;
      if (!fallbackPrice) {
        const missingVars: string[] = [];
        if (normalizedTier === 'starter') {
          if (!process.env.PRICE_TIER_STARTER) missingVars.push('PRICE_TIER_STARTER');
          if (normalizedBillingCycle === 'annual' && !process.env.PRICE_TIER_STARTER_ANNUAL) missingVars.push('PRICE_TIER_STARTER_ANNUAL');
        } else if (normalizedTier === 'pro') {
          if (!process.env.PRICE_TIER_PRO) missingVars.push('PRICE_TIER_PRO');
          if (normalizedBillingCycle === 'annual' && !process.env.PRICE_TIER_PRO_ANNUAL) missingVars.push('PRICE_TIER_PRO_ANNUAL');
        } else if (normalizedTier === 'trust_plus') {
          if (!process.env.PRICE_TIER_TRUST_PLUS) missingVars.push('PRICE_TIER_TRUST_PLUS');
          if (normalizedBillingCycle === 'annual' && !process.env.PRICE_TIER_TRUST_PLUS_ANNUAL) missingVars.push('PRICE_TIER_TRUST_PLUS_ANNUAL');
        }

        return NextResponse.json(
          {
            error: 'Stripe pricing is not configured for this tier',
            details: `Missing price env var(s) for tier=${normalizedTier} billingCycle=${normalizedBillingCycle}`,
            missing: missingVars,
          },
          { status: 500 }
        );
      }
      console.warn(`[Subscribe] Annual price not configured for ${normalizedTier}, using monthly price`);
    }

    const finalPriceId = priceId || priceMap[normalizedTier]?.monthly;
    if (!finalPriceId || typeof finalPriceId !== 'string') {
      return NextResponse.json(
        {
          error: 'Stripe pricing is not configured for this tier',
          details: `PRICE_TIER_${normalizedTier.toUpperCase()} (and optionally _ANNUAL) must be set. Run: node scripts/seed-stripe-saas-tiers.js`,
          missing: [
            `PRICE_TIER_${normalizedTier === 'trust_plus' ? 'TRUST_PLUS' : normalizedTier.toUpperCase()}`,
            normalizedBillingCycle === 'annual' ? `PRICE_TIER_${normalizedTier === 'trust_plus' ? 'TRUST_PLUS' : normalizedTier.toUpperCase()}_ANNUAL` : null,
          ].filter(Boolean),
        },
        { status: 500 }
      );
    }

    // Get site URL for redirects
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   req.headers.get('origin') || 
                   'https://hookahplus.net';

    // Map add-on keys to Stripe price IDs
    const addonPriceMap: Record<string, Record<string, string | undefined>> = {
      flavor_intelligence: {
        monthly: process.env.PRICE_ADDON_FLAVOR_INTELLIGENCE,
        annual: process.env.PRICE_ADDON_FLAVOR_INTELLIGENCE_ANNUAL,
      },
      advanced_analytics: {
        monthly: process.env.PRICE_ADDON_ADVANCED_ANALYTICS,
        annual: process.env.PRICE_ADDON_ADVANCED_ANALYTICS_ANNUAL,
      },
      staff_performance: {
        monthly: process.env.PRICE_ADDON_STAFF_PERFORMANCE,
        annual: process.env.PRICE_ADDON_STAFF_PERFORMANCE_ANNUAL,
      },
      custom_integrations: {
        monthly: process.env.PRICE_ADDON_CUSTOM_INTEGRATIONS,
        annual: process.env.PRICE_ADDON_CUSTOM_INTEGRATIONS_ANNUAL,
      },
      // Agentic Commerce: $49/mo add-on (or annual equivalent) + optional metered usage line item
      agentic_commerce: {
        monthly: process.env.PRICE_ADDON_AGENTIC_COMMERCE,
        annual: process.env.PRICE_ADDON_AGENTIC_COMMERCE_ANNUAL,
      },
      // Usage: $0.25 per agentic checkout (metered). Keep interval aligned to billing cycle.
      agentic_commerce_usage: {
        monthly: process.env.PRICE_ADDON_AGENTIC_COMMERCE_USAGE,
        annual: process.env.PRICE_ADDON_AGENTIC_COMMERCE_USAGE_ANNUAL,
      },
      priority_support: {
        monthly: process.env.PRICE_ADDON_PRIORITY_SUPPORT,
        annual: process.env.PRICE_ADDON_PRIORITY_SUPPORT_ANNUAL,
      },
    };

    // Build line items: base subscription + add-ons
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { 
        price: finalPriceId, 
        quantity: 1 
      }
    ];

    // Add add-ons as actual line items using Stripe price IDs
    const addonMetadata: string[] = [];
    addons.forEach((addon: any) => {
      const addonKey = addon.key; // e.g., 'flavor_intelligence'
      // Special case: Agentic Commerce bundles a base add-on + metered usage item
      if (addonKey === 'agentic_commerce') {
        const basePriceId = addonPriceMap.agentic_commerce?.[normalizedBillingCycle];
        const usagePriceId = addonPriceMap.agentic_commerce_usage?.[normalizedBillingCycle];

        if (basePriceId) {
          lineItems.push({ price: basePriceId, quantity: 1 });
          addonMetadata.push('agentic_commerce');
        } else {
          console.warn(`[Subscribe] Add-on price not found for: agentic_commerce (${billingCycle})`);
        }

        if (usagePriceId) {
          // Metered usage is tracked separately; Stripe will invoice based on usage records.
          // This line item adds the metered price to the subscription.
          lineItems.push({ price: usagePriceId, quantity: 1 });
          addonMetadata.push('agentic_commerce_usage');
        } else {
          console.warn(`[Subscribe] Add-on usage price not found for: agentic_commerce_usage (${billingCycle})`);
        }

        return;
      }

      const addonPriceId = addonPriceMap[addonKey]?.[normalizedBillingCycle];
      if (addonPriceId) {
        lineItems.push({ price: addonPriceId, quantity: 1 });
        addonMetadata.push(addonKey);
      } else {
        console.warn(`[Subscribe] Add-on price not found for: ${addonKey} (${normalizedBillingCycle})`);
      }
    });

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: lineItems,
      success_url: `${siteUrl}/thank-you/subscription?session_id={CHECKOUT_SESSION_ID}&tier=${normalizedTier}`,
      cancel_url: `${siteUrl}/pricing?canceled=true`,
      metadata: {
        tier: normalizedTier,
        billing_cycle: normalizedBillingCycle,
        subscription_type: 'saas_tier',
        source: 'pricing_page',
        customer_email: email,
        addons: addonMetadata.join(';')
      },
      subscription_data: {
        metadata: {
          tier: normalizedTier,
          billing_cycle: normalizedBillingCycle,
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
    const details = error?.message || String(error);
    const stripeCode = error?.code || error?.type;
    return NextResponse.json(
      { 
        error: 'Failed to create subscription checkout',
        details,
        ...(stripeCode && { stripeCode }),
      },
      { status: 500 }
    );
  }
}

