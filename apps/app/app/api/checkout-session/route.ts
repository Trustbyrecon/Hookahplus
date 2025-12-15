import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      console.error('[Checkout API] ❌ STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { 
          success: false,
          error: 'Stripe not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing',
          hint: 'Add STRIPE_SECRET_KEY=sk_test_... to apps/app/.env.local and restart the dev server',
          setupUrl: 'https://dashboard.stripe.com/apikeys',
          isConfigurationError: true
        },
        { status: 503 } // Service Unavailable - more appropriate than 500 for missing config
      );
    }

    const body = await request.json();
    const { flavors, addOns, tableId, loungeId, amount, total, pricingModel, sessionDuration, dollarTestMode, sessionId, isDemo } = body;
    
    // Check for demo mode - route through Stripe test workflow
    const isDemoMode = isDemo === true || isDemo === 'true';
    
    if (isDemoMode) {
      console.log('[Checkout API] 🎭 Demo Mode: Routing through Stripe test workflow');
      
      // SECURITY: In demo mode, ensure we're using test keys only
      const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ?? false;
      if (stripe && !isTestMode) {
        console.error('[Checkout API] ❌ Demo mode requires test Stripe keys (sk_test_...)');
        return NextResponse.json({
          success: false,
          error: 'Demo mode requires Stripe test keys',
          details: 'STRIPE_SECRET_KEY must start with sk_test_ for demo mode. Live keys (sk_live_...) are not allowed in demo.',
          hint: 'Update STRIPE_SECRET_KEY to a test key (sk_test_...) in your environment variables'
        }, { status: 400 });
      }
      
      // In demo mode, create a Stripe test checkout session
      // This allows users to experience the full payment flow with test cards
      if (!stripe) {
        // If Stripe not configured, return demo confirmation
        return NextResponse.json({
          success: true,
          demo: true,
          sessionId: sessionId,
          paymentIntent: 'demo_payment_intent_' + Date.now(),
          clientSecret: null,
          message: 'Demo payment confirmed - no real charges',
          checkoutUrl: null,
          redirectUrl: `/fire-session-dashboard?mode=demo&session=${sessionId}&payment=confirmed`
        });
      }
      
      // Create Stripe test checkout session for demo
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const successUrl = `${baseUrl}/checkout/success?session_id=${sessionId}&mode=demo`;
      const cancelUrl = `${baseUrl}/checkout/cancel?session_id=${sessionId}&mode=demo`;
      
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Hookah Session - ${flavors.join(' + ')}`,
                  description: `Demo Session - Flavor mix: ${flavors.join(', ')}`,
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            h_session: sessionId,
            h_order: `H+ ${sessionId.substring(0, 8)}`,
            is_demo: 'true'
          },
        });
        
        return NextResponse.json({
          success: true,
          demo: true,
          sessionId: sessionId,
          url: session.url,
          checkoutUrl: session.url,
          redirectUrl: session.url,
          message: 'Demo Stripe test checkout created - use test card: 4242 4242 4242 4242'
        });
      } catch (stripeError: any) {
        console.error('[Checkout API] Demo Stripe error:', stripeError);
        // Fallback to demo confirmation if Stripe fails
        return NextResponse.json({
          success: true,
          demo: true,
          sessionId: sessionId,
          paymentIntent: 'demo_payment_intent_' + Date.now(),
          clientSecret: null,
          message: 'Demo payment confirmed - no real charges',
          checkoutUrl: null,
          redirectUrl: `/fire-session-dashboard?mode=demo&session=${sessionId}&payment=confirmed`
        });
      }
    }
    
    // SECURITY: sessionId is required - we only send opaque IDs to Stripe
    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Session ID required',
          details: 'sessionId must be provided to link payment to session'
        },
        { status: 400 }
      );
    }

    console.log('[Checkout API] Request:', { 
      flavors, 
      addOns, 
      tableId, 
      total, 
      amount,
      pricingModel,
      dollarTestMode: dollarTestMode ? 'ENABLED - Amount will be $1.00' : 'disabled'
    });

    // Validate required fields
    if (!flavors || !Array.isArray(flavors) || flavors.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'At least one flavor is required' 
        },
        { status: 400 }
      );
    }

    if (!amount && !total) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Amount is required' 
        },
        { status: 400 }
      );
    }

    // Use total if provided, otherwise use amount (convert to cents)
    // If $1 test mode is enabled, force amount to $1.00 (100 cents)
    // If amount is provided and >= 100, assume it's already in cents
    // If amount is provided and < 100, assume it's in dollars and convert
    let amountInCents: number;
    if (dollarTestMode) {
      amountInCents = 100;
    } else if (total) {
      // total is always in dollars, convert to cents
      amountInCents = Math.round(total * 100);
    } else if (amount >= 100) {
      // amount >= 100, assume it's already in cents
      amountInCents = Math.round(amount);
    } else {
      // amount < 100, assume it's in dollars, convert to cents
      amountInCents = Math.round(amount * 100);
    }
    
    if (dollarTestMode) {
      console.log('[Checkout API] $1 Test Mode ENABLED - Original amount:', total || amount, '→ Forced to $1.00 (100 cents)');
    }

    // Validate amount is positive and valid
    if (isNaN(amountInCents) || amountInCents <= 0) {
      console.error('[Checkout API] Invalid amount:', { total, amount, amountInCents });
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid amount',
          details: `Amount must be a positive number. Received: total=${total}, amount=${amount}, cents=${amountInCents}`
        },
        { status: 400 }
      );
    }

    console.log('[Checkout API] Creating Stripe session with amount:', amountInCents);

    // Get base URL from request headers or environment variable
    const getBaseUrl = () => {
      // Try environment variable first
      const envUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (envUrl) {
        // Clean up any whitespace, backticks, quotes, or other unwanted characters
        let cleanUrl = envUrl.trim().replace(/[`'"]/g, '');
        // Remove any leading/trailing whitespace that might remain
        cleanUrl = cleanUrl.trim();
        
        console.log('[Checkout API] Environment URL:', { 
          original: envUrl, 
          cleaned: cleanUrl,
          length: cleanUrl.length 
        });
        
        if (cleanUrl && cleanUrl.length > 0) {
          return cleanUrl;
        }
      }
      
      // Fallback to request origin
      const origin = request.headers.get('origin') || request.headers.get('host');
      if (origin) {
        // Handle both cases: full URL or just host
        if (origin.startsWith('http')) {
          return origin;
        }
        // Check if it's HTTPS or HTTP based on headers
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        return `${protocol}://${origin}`;
      }
      
      // Last resort: localhost
      return 'http://localhost:3002';
    };

    let baseUrl = getBaseUrl();
    const originalBaseUrl = baseUrl; // Keep for error message
    
    // Ensure URL doesn't end with a slash
    baseUrl = baseUrl.replace(/\/$/, '');
    
    // Validate URL format
    let isValidUrl = false;
    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(baseUrl);
      isValidUrl = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      if (isValidUrl) {
        baseUrl = parsedUrl.origin; // Normalize to just origin
      }
    } catch (e) {
      isValidUrl = false;
      console.error('[Checkout API] URL parsing error:', e);
    }
    
    if (!isValidUrl || !parsedUrl) {
      console.error('[Checkout API] Invalid base URL:', { 
        original: originalBaseUrl,
        cleaned: baseUrl,
        envVar: process.env.NEXT_PUBLIC_APP_URL 
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL configuration',
          details: `Base URL "${baseUrl}" is not a valid URL. Please ensure NEXT_PUBLIC_APP_URL is set to a valid URL without quotes or backticks (e.g., https://app.hookahplus.net). Current value: "${process.env.NEXT_PUBLIC_APP_URL || 'not set'}"`,
        },
        { status: 500 }
      );
    }

    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout/cancel`;

    console.log('[Checkout API] URLs:', { baseUrl, successUrl, cancelUrl });

    // Generate idempotency key for retry safety
    const idempotencyKey = `checkout_${tableId || 'default'}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Determine if we're in test or live mode
    const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ?? false;
    
    // Log mode for debugging
    const stripeKeyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'not set';
    console.log('[Checkout API] Stripe Mode:', {
      isTestMode,
      keyPrefix: stripeKeyPrefix,
      mode: isTestMode ? 'TEST (Sandbox)' : 'LIVE (Production)',
      warning: !isTestMode ? '⚠️ Using LIVE mode - ensure you want to process real payments!' : '✅ Using TEST mode - safe for testing'
    });
    
    // Warn if trying to use test card in live mode
    if (!isTestMode) {
      console.warn('[Checkout API] ⚠️ LIVE MODE DETECTED - Test cards will be declined!');
      console.warn('[Checkout API] To use test mode, set STRIPE_SECRET_KEY=sk_test_... in environment variables');
    }
    
    // Create Stripe checkout session with production optimizations
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Hookah Session - ${flavors.join(' + ')}`,
              description: `Flavor mix: ${flavors.join(', ')}${addOns && addOns.length > 0 ? ` | Add-ons: ${addOns.join(', ')}` : ''}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // SECURITY: Only send opaque session ID to Stripe (protects behavioral memory)
      // All business logic (flavorMix, tableId, loungeId) stays in our DB
      metadata: {
        h_session: sessionId, // Opaque UUID - Stripe can't reverse engineer business logic
        h_order: `H+ ${sessionId.substring(0, 8)}`, // Optional: human-friendly for support lookups
      },
      // Customer email collection - let Stripe handle it securely
      customer_email: undefined,
      // Collect billing address for fraud prevention and receipts
      billing_address_collection: 'auto',
      // Enable automatic tax calculation if configured
      automatic_tax: {
        enabled: false, // Set to true if you have Stripe Tax configured
      },
      // Collect customer phone number for SMS notifications
      phone_number_collection: {
        enabled: true,
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Configure receipt email
      payment_intent_data: {
        description: `Hookah Plus Session ${sessionId.substring(0, 8)}`, // Generic description
        // SECURITY: Only opaque session ID in PaymentIntent metadata
        metadata: {
          h_session: sessionId, // Opaque UUID only
        },
      },
      // Expire checkout sessions after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
    }, {
      // Idempotency key for retry safety
      idempotencyKey: idempotencyKey,
    });

    console.log('[Checkout API] Session created successfully:', {
      sessionId: session.id,
      url: session.url,
      amount: amountInCents,
      mode: isTestMode ? 'test' : 'live',
      expiresAt: new Date(session.expires_at * 1000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      expiresAt: session.expires_at,
      mode: isTestMode ? 'test' : 'live',
    });
  } catch (error: any) {
    console.error('[Checkout API] Error:', error);
    
    // Handle Stripe-specific errors
    if (error?.type === 'StripeCardError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Card error',
          details: error.message || 'Your card was declined',
        },
        { status: 400 }
      );
    }
    
    if (error?.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: error.message || 'Invalid Stripe request',
        },
        { status: 400 }
      );
    }
    
    // Handle Stripe API errors
    if (error?.code) {
      console.error('[Checkout API] Stripe error code:', error.code);
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe API error',
          details: error.message || `Stripe error: ${error.code}`,
          code: error.code,
        },
        { status: 500 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

