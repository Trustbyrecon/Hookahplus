import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get session ID from path parameter (route: /api/checkout-session/[sessionId])
    // Also support query parameter for backwards compatibility
    const { searchParams } = new URL(request.url);
    const { sessionId: sessionIdFromPath } = await params;
    const sessionId = sessionIdFromPath || searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('[Checkout Session API] Fetching session:', sessionId.substring(0, 20) + '...');

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        customer_details: session.customer_details,
        metadata: session.metadata,
      },
    });
  } catch (error) {
    console.error('[Checkout Session API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch session details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

