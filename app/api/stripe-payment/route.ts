import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeConfig } from '@/lib/stripe-config';
import { calculateDynamicPrice } from '@/lib/stripe-catalog';
import { fireSessionWorkflow } from '@/lib/fire-session-workflow';
import { flagManager } from '@/lib/flag-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      tableId,
      customerName,
      customerEmail,
      customerPhone,
      flavors,
      totalAmount,
      isTestMode = false,
      membershipTier,
      isBundle = false,
      specialInstructions = ''
    } = body;

    // Validate required fields
    if (!sessionId || !tableId || !customerName || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate dynamic pricing
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0') + ':00';
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const dynamicPrice = calculateDynamicPrice(totalAmount, {
      hour,
      day,
      isMember: !!membershipTier,
      membershipTier,
      isBundle
    });

    // Apply test mode pricing
    const finalAmount = isTestMode ? 100 : dynamicPrice; // $1.00 for test mode

    console.log(`Processing payment: ${finalAmount} cents (${isTestMode ? 'TEST MODE' : 'LIVE'})`);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        sessionId,
        tableId,
        customerName,
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        flavors: JSON.stringify(flavors || []),
        totalAmount: totalAmount.toString(),
        dynamicPrice: dynamicPrice.toString(),
        isTestMode: isTestMode.toString(),
        membershipTier: membershipTier || '',
        isBundle: isBundle.toString(),
        specialInstructions,
        timestamp: now.toISOString()
      },
      description: `Hookah+ Session - ${customerName} (Table ${tableId})`,
      receipt_email: customerEmail || undefined,
    });

    // Update session status to payment pending
    await fireSessionWorkflow.pressButton(
      sessionId,
      'prep_started',
      'prep',
      'stripe_payment',
      {
        tableId,
        customerName,
        totalAmount: finalAmount,
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending'
      }
    );

    // Create flag for payment processing
    await flagManager.createFlag({
      sessionId,
      tableId,
      flagType: 'payment_issue',
      severity: 'medium',
      description: `Payment processing for session ${sessionId}`,
      reportedBy: 'stripe_payment',
      metadata: {
        paymentIntentId: paymentIntent.id,
        amount: finalAmount,
        isTestMode
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: finalAmount,
      isTestMode,
      dynamicPrice,
      originalAmount: totalAmount
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Create flag for payment error
    await flagManager.createFlag({
      sessionId: 'unknown',
      tableId: 'unknown',
      flagType: 'payment_issue',
      severity: 'high',
      description: `Payment error: ${error.message}`,
      reportedBy: 'stripe_payment',
      metadata: {
        error: error.message
      }
    });

    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// Get payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
      created: paymentIntent.created
    });

  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment status' },
      { status: 500 }
    );
  }
}
