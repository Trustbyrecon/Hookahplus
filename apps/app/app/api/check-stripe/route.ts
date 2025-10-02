import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  let stripeAccountId = 'not_available';
  
  // Try to get Stripe account ID if keys are available
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = require('stripe');
      // Clean the Stripe key to remove any invalid characters
      const cleanStripeKey = process.env.STRIPE_SECRET_KEY.trim().replace(/[^\x20-\x7E]/g, '');
      
      const stripe = new Stripe(cleanStripeKey, {
        apiVersion: '2025-08-27.basil',
        timeout: 10000, // 10 second timeout
      });
      
      // Try to retrieve account with shorter timeout
      const accountPromise = stripe.accounts.retrieve();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 3 seconds')), 3000)
      );
      
      const account = await Promise.race([accountPromise, timeoutPromise]) as any;
      stripeAccountId = account.id;
    } catch (error: any) {
      console.error('Stripe account retrieval error:', error.message);
      
      // Try to extract account ID from secret key as fallback
      if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
        stripeAccountId = 'acct_test_fallback';
      } else if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
        stripeAccountId = 'acct_live_fallback';
      } else {
        stripeAccountId = `error: ${error.message.substring(0, 15)}...`;
      }
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
