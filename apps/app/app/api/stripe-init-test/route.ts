import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('[Stripe Init Test] 🧪 Testing Stripe initialization...');
  
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        ok: false,
        error: 'STRIPE_SECRET_KEY not found',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Just try to import and create Stripe instance
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });

    console.log('[Stripe Init Test] ✅ Stripe instance created successfully');

    return NextResponse.json({
      ok: true,
      message: 'Stripe initialization successful',
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Stripe Init Test] ❌ Initialization failed:', error);
    
    return NextResponse.json({
      ok: false,
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
