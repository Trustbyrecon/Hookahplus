import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  try {
    // Check if Stripe key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        ok: false,
        error: 'STRIPE_SECRET_KEY not found',
        debug: {
          hasStripeKey: false,
          nodeEnv: process.env.NODE_ENV
        }
      }, { status: 500 });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });

    // Test Stripe connection by retrieving account info
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({
      ok: true,
      stripe: {
        accountId: account.id,
        country: account.country,
        type: account.type,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL
      }
    });

  } catch (error: any) {
    console.error('[Debug] Stripe test failed:', error);
    
    return NextResponse.json({
      ok: false,
      error: error.message,
      debug: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
        nodeEnv: process.env.NODE_ENV,
        errorCode: error.code,
        errorType: error.type
      }
    }, { status: 500 });
  }
}
