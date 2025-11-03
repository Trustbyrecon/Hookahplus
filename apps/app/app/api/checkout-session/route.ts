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
      console.error('[Checkout API] Stripe not configured - STRIPE_SECRET_KEY missing');
      return NextResponse.json(
        { 
          success: false,
          error: 'Stripe not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { flavors, addOns, tableId, loungeId, amount, total, pricingModel, sessionDuration, dollarTestMode } = body;

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
    const amountInCents = dollarTestMode ? 100 : (total ? Math.round(total * 100) : amount);
    
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

    // Create Stripe checkout session
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
      metadata: {
        flavors: JSON.stringify(flavors),
        addOns: JSON.stringify(addOns || []),
        tableId: tableId || '',
        loungeId: loungeId || 'default-lounge',
        flavorMix: flavors.join(' + '),
        pricingModel: pricingModel || 'flat',
        sessionDuration: sessionDuration ? String(sessionDuration) : '',
        dollarTestMode: dollarTestMode ? 'true' : 'false', // Flag for webhook verification
        originalAmount: dollarTestMode ? String(total || amount) : '', // Store original amount for reference
      },
      customer_email: undefined, // Let Stripe collect email
      billing_address_collection: 'auto',
    });

    console.log('[Checkout API] Session created successfully:', session.id);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
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

