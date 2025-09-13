// app/api/test-stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Stripe connection...');
    
    // Check environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    console.log('Environment check:');
    console.log('- STRIPE_SECRET_KEY exists:', !!stripeSecretKey);
    console.log('- STRIPE_SECRET_KEY starts with:', stripeSecretKey?.substring(0, 7));
    console.log('- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY exists:', !!stripePublishableKey);
    console.log('- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY starts with:', stripePublishableKey?.substring(0, 7));
    console.log('- STRIPE_WEBHOOK_SECRET exists:', !!webhookSecret);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
    
    if (!stripeSecretKey) {
      return NextResponse.json({
        error: 'STRIPE_SECRET_KEY not found',
        environment: process.env.NODE_ENV,
        availableKeys: Object.keys(process.env).filter(key => key.includes('STRIPE'))
      }, { status: 500 });
    }
    
    // Test Stripe connection
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    });
    
    // Try to retrieve account info (this will test the connection)
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({
      success: true,
      message: 'Stripe connection successful',
      account: {
        id: account.id,
        country: account.country,
        type: account.type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      },
      environment: process.env.NODE_ENV,
      keys: {
        secretKeyPrefix: stripeSecretKey.substring(0, 7),
        publishableKeyPrefix: stripePublishableKey?.substring(0, 7),
        webhookSecretExists: !!webhookSecret
      }
    });
    
  } catch (error: any) {
    console.error('Stripe test error:', error);
    
    return NextResponse.json({
      error: 'Stripe connection failed',
      details: error.message,
      type: error.type,
      code: error.code,
      environment: process.env.NODE_ENV,
      availableKeys: Object.keys(process.env).filter(key => key.includes('STRIPE'))
    }, { status: 500 });
  }
}
