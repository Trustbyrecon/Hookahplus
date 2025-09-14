import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeConfig, WEBHOOK_EVENTS } from '@/lib/stripe-config';
import { fireSessionWorkflow } from '@/lib/fire-session-workflow';
import { flagManager } from '@/lib/flag-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeConfig.webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Processing Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentSuccess(event.data.object);
        break;
        
      case WEBHOOK_EVENTS.PAYMENT_INTENT_FAILED:
        await handlePaymentFailure(event.data.object);
        break;
        
      case WEBHOOK_EVENTS.CUSTOMER_CREATED:
        await handleCustomerCreated(event.data.object);
        break;
        
      case WEBHOOK_EVENTS.PRODUCT_CREATED:
        await handleProductCreated(event.data.object);
        break;
        
      case WEBHOOK_EVENTS.PRICE_CREATED:
        await handlePriceCreated(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Payment success handler
async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const { metadata } = paymentIntent;
    const sessionId = metadata?.sessionId;
    const tableId = metadata?.tableId;
    const customerName = metadata?.customerName;
    const totalAmount = metadata?.totalAmount;

    if (sessionId) {
      // Update session status to payment confirmed
      await fireSessionWorkflow.pressButton('PAYMENT_CONFIRMED', {
        sessionId,
        tableId,
        customerName,
        totalAmount: parseInt(totalAmount),
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'succeeded'
      });

      console.log(`Payment confirmed for session ${sessionId}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
    await flagManager.createFlag('PAYMENT_PROCESSING_ERROR', {
      error: error.message,
      paymentIntentId: paymentIntent.id,
      severity: 'high'
    });
  }
}

// Payment failure handler
async function handlePaymentFailure(paymentIntent: any) {
  try {
    const { metadata } = paymentIntent;
    const sessionId = metadata?.sessionId;
    const tableId = metadata?.tableId;

    if (sessionId) {
      // Update session status to payment failed
      await fireSessionWorkflow.pressButton('PAYMENT_FAILED', {
        sessionId,
        tableId,
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'failed'
      });

      // Create flag for payment failure
      await flagManager.createFlag('PAYMENT_FAILED', {
        sessionId,
        tableId,
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
        severity: 'high'
      });

      console.log(`Payment failed for session ${sessionId}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Customer created handler
async function handleCustomerCreated(customer: any) {
  try {
    console.log(`New customer created: ${customer.id}`);
    // Could sync customer data to Supabase here
  } catch (error) {
    console.error('Error handling customer creation:', error);
  }
}

// Product created handler
async function handleProductCreated(product: any) {
  try {
    console.log(`New product created: ${product.id}`);
    // Could sync product data to local catalog here
  } catch (error) {
    console.error('Error handling product creation:', error);
  }
}

// Price created handler
async function handlePriceCreated(price: any) {
  try {
    console.log(`New price created: ${price.id}`);
    // Could sync pricing data to local system here
  } catch (error) {
    console.error('Error handling price creation:', error);
  }
}
