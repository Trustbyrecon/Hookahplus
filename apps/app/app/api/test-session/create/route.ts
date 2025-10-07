import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with proper error handling
let stripe: Stripe | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil', // Use current API version
    });
    console.log('✅ Stripe initialized successfully');
  } else {
    console.warn('⚠️ STRIPE_SECRET_KEY not found, using fallback mode');
  }
} catch (error) {
  console.error('❌ Stripe initialization error:', error);
}

export async function POST(req: NextRequest) {
  try {
    const { tableId, customerInfo } = await req.json();

    console.log('🔄 Creating test session for table:', tableId);

    // If Stripe is not available, return fallback
    if (!stripe) {
      console.log('📝 Using fallback mode - Stripe not configured');
      return NextResponse.json({
        success: true,
        clientSecret: 'pi_test_simulation_client_secret_' + Date.now(),
        paymentIntentId: 'pi_test_simulation_' + Date.now(),
        amount: 100,
        currency: 'usd',
        metadata: {
          type: 'test_hookah_session',
          tableId: tableId || 'T-TEST',
          customerName: customerInfo?.name || 'Test Customer',
          customerPhone: customerInfo?.phone || '(555) 123-4567',
          flavor: 'Test Flavor Mix',
          testMode: 'true',
          simulated: 'true'
        },
        simulated: true,
        message: 'Test session created in fallback mode (Stripe not configured)'
      });
    }

    // Create a real $1 test payment intent with Stripe
    console.log('💳 Creating real Stripe payment intent...');
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 in cents
      currency: 'usd',
      metadata: {
        type: 'test_hookah_session',
        tableId: tableId || 'T-TEST',
        customerName: customerInfo?.name || 'Test Customer',
        customerPhone: customerInfo?.phone || '(555) 123-4567',
        flavor: 'Test Flavor Mix',
        testMode: 'true',
        source: 'hookahplus_test_session'
      },
      description: 'Test Hookah Session - $1',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/payment/return`,
    });

    console.log('✅ Stripe payment intent created:', paymentIntent.id);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: 100,
      currency: 'usd',
      metadata: paymentIntent.metadata,
      realStripe: true,
      message: 'Real Stripe payment intent created successfully!'
    });

  } catch (error: any) {
    console.error('❌ Test session creation error:', error);
    
    // Return fallback response on error
    return NextResponse.json({
      success: true,
      clientSecret: 'pi_fallback_test_secret',
      paymentIntentId: 'pi_fallback_test_' + Date.now(),
      amount: 100,
      currency: 'usd',
      metadata: {
        type: 'test_hookah_session',
        tableId: 'T-FALLBACK',
        customerName: 'Fallback Test Customer',
        customerPhone: '(555) 000-0000',
        flavor: 'Fallback Test Flavor',
        testMode: 'true',
        simulated: 'true',
        fallback: 'true',
        error: error.message
      },
      simulated: true,
      fallback: true,
      message: 'Test session created with fallback data due to error: ' + error.message
    }, { status: 200 });
  }
}
