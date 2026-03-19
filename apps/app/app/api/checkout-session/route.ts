/**
 * POST /api/checkout-session
 * Create Stripe Checkout Session for pre-order or session payment.
 *
 * SECURITY: Accepts only opaque session ID (h_session). No PII in metadata.
 * Flow: Create Session first → POST here with sessionId → Redirect to Stripe.
 *
 * Body: {
 *   sessionId: string (required) - Database session ID
 *   flavors?: string[]
 *   tableId?: string
 *   loungeId?: string
 *   amount: number (cents)
 *   total?: number (dollars, for display)
 *   dollarTestMode?: boolean - Force $1.00 for smoke tests
 * }
 *
 * Response: { success, url } or { success, sessionUrl } for compatibility
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '../../../lib/stripeServer';
import { getAppUrl } from '../../../lib/env';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Stripe not configured',
        details:
          'STRIPE_SECRET_KEY is missing. Add sk_test_… to apps/app/.env.local, or set STRIPE_TEST_SECRET_KEY for local dev.',
        isConfigurationError: true,
        setupUrl: 'https://dashboard.stripe.com/apikeys',
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const {
      sessionId,
      flavors = [],
      addOns = [],
      tableId,
      loungeId = 'default-lounge',
      amount,
      total,
      dollarTestMode = false,
      partySize,
    } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Amount in cents; $1 test mode overrides
    const amountCents = dollarTestMode ? 100 : Math.round(Number(amount) || 0);
    if (amountCents <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const appUrl = getAppUrl();
    const flavorLabel = Array.isArray(flavors) && flavors.length > 0
      ? flavors.join(' + ')
      : 'Hookah Session';

    const pathTable = String(tableId || 'T-001').trim() || 'T-001';
    const cancelParams = new URLSearchParams();
    cancelParams.set('canceled', '1');
    if (loungeId && loungeId !== 'default-lounge') {
      cancelParams.set('lounge', String(loungeId));
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Hookah Session — ${flavorLabel}`,
              description: tableId ? `Table ${tableId}` : 'Pre-order session',
              metadata: {},
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/preorder/${encodeURIComponent(pathTable)}?${cancelParams.toString()}`,
      metadata: {
        h_session: sessionId,
        tableId: tableId || '',
        loungeId: loungeId || 'default-lounge',
        flavorMix: Array.isArray(flavors) ? flavors.join(',') : '',
        source: 'preorder',
        dollarTestMode: dollarTestMode ? '1' : '0',
        hp_preorder: '1',
        hp_party_size: String(
          typeof partySize === 'number' && partySize > 0 ? Math.min(partySize, 99) : 1
        ),
      },
      payment_intent_data: {
        metadata: {
          h_session: sessionId,
          source: 'preorder',
          hp_preorder: '1',
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
    });

    const url = checkoutSession.url;
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Stripe did not return checkout URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url,
      sessionUrl: url, // Compatibility with SimpleFSDDesign
      sessionId: checkoutSession.id,
    });
  } catch (error: unknown) {
    console.error('[Checkout Session API] Error:', error);
    const raw = error instanceof Error ? error.message : 'Unknown error';
    // Never echo full Stripe secret hints to the client; guide operators instead
    if (/expired api key/i.test(raw)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe key invalid or expired',
          details:
            'Update STRIPE_SECRET_KEY in your environment (rotate in Stripe Dashboard). For local dev, set STRIPE_TEST_SECRET_KEY=sk_test_… in apps/app/.env.local — see env.example.',
          isConfigurationError: true,
          setupUrl: 'https://dashboard.stripe.com/apikeys',
        },
        { status: 500 }
      );
    }
    const details =
      /sk_(live|test)_/i.test(raw)
        ? 'Stripe rejected the request. Check your Stripe secret key and dashboard.'
        : raw;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
        details,
      },
      { status: 500 }
    );
  }
}
