import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * GET /api/checkout-session/[sessionId]
 * Fetches Stripe checkout session details by session ID
 * Used by checkout success page to extract session data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing'
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil' as any,
    });

    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session ID required',
          details: 'Checkout session ID must be provided'
        },
        { status: 400 }
      );
    }

    // Fetch Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        customer_details: session.customer_details,
        created: session.created
      }
    });
  } catch (error: any) {
    console.error('[Checkout Session API] Error:', error);
    
    if (error?.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
          details: error.message
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch checkout session',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

