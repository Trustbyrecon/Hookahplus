import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  console.log('[Stripe Test] 🧪 Testing Stripe connection...');
  
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        ok: false,
        error: 'STRIPE_SECRET_KEY not found',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Clean the Stripe key to remove any invalid characters
    const cleanStripeKey = process.env.STRIPE_SECRET_KEY.trim().replace(/[^\x20-\x7E]/g, '');
    
    const stripe = new Stripe(cleanStripeKey, {
      apiVersion: '2025-08-27.basil',
    });

    // Test basic connection
    const balance = await stripe.balance.retrieve();
    console.log('[Stripe Test] ✅ Balance retrieved successfully');

    // Test account retrieval
    let accountId = 'unknown';
    try {
      const account = await stripe.accounts.retrieve();
      accountId = account.id;
      console.log('[Stripe Test] ✅ Account retrieved:', accountId);
    } catch (accountError: any) {
      console.warn('[Stripe Test] ⚠️ Account retrieval failed:', accountError.message);
      accountId = `error: ${accountError.message.substring(0, 20)}...`;
    }

    return NextResponse.json({
      ok: true,
      message: 'Stripe connection successful',
      balance: {
        available: balance.available[0]?.amount || 0,
        currency: balance.available[0]?.currency || 'usd'
      },
      accountId: accountId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Stripe Test] ❌ Connection failed:', error);
    
    return NextResponse.json({
      ok: false,
      error: error.message || 'Unknown error',
      code: error.code,
      type: error.type,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
