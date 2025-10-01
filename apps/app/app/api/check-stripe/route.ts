import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  let stripeAccountId = 'not_available';
  
  // Try to get Stripe account ID if keys are available
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-08-27.basil',
      });
      const account = await stripe.accounts.retrieve();
      stripeAccountId = account.id;
    } catch (error) {
      stripeAccountId = 'error_retrieving';
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      region: process.env.VERCEL_REGION
    },
    stripe: {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...',
      hasPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      publicKeyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.length || 0,
      publicKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.substring(0, 12) + '...',
      accountId: stripeAccountId
    },
    app: {
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      prettyTheme: process.env.NEXT_PUBLIC_PRETTY_THEME
    }
  });
}
