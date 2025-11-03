import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutSessionId = searchParams.get('checkoutSessionId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!checkoutSessionId) {
      return NextResponse.json(
        { error: 'checkoutSessionId required' },
        { status: 400 }
      );
    }

    // Retrieve checkout session
    const cs = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    const piId = cs.payment_intent as string;

    if (!piId) {
      return NextResponse.json(
        { error: 'payment_intent not found for checkout session' },
        { status: 404 }
      );
    }

    // Retrieve payment intent
    const pi = await stripe.paymentIntents.retrieve(piId);

    // Get session notes from metadata
    const notes = pi.metadata?.hp_notes || cs.metadata?.hp_notes || '';
    const flavorMix = cs.metadata?.hp_flavor_mix || '';
    const sessionId = cs.metadata?.hp_session_id || '';

    return NextResponse.json({
      checkoutSessionId,
      paymentIntentId: piId,
      sessionId,
      flavorMix: flavorMix.split('|').filter(Boolean),
      notes,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      metadata: {
        ...cs.metadata,
        ...pi.metadata
      }
    });
  } catch (err: any) {
    console.error('Error fetching session notes:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch session notes' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const {
      sessionId,
      checkoutSessionId,
      loungeId = 'demo-lounge-001',
      notes
    } = await req.json();

    let paymentIntentId: string | null = null;

    if (checkoutSessionId) {
      const cs = await stripe.checkout.sessions.retrieve(checkoutSessionId);
      paymentIntentId = cs.payment_intent as string;
    } else if (sessionId) {
      // Search for payment intent by session ID in metadata
      const res = await stripe.paymentIntents.search({
        query: `metadata['hp_session_id']:'${sessionId}'`,
        limit: 1
      });
      if (res.data.length > 0) {
        paymentIntentId = res.data[0].id;
      }
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'provide sessionId or checkoutSessionId' },
        { status: 400 }
      );
    }

    // Update payment intent metadata with notes
    const updated = await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        hp_notes: notes || '',
        hp_lounge_id: loungeId
      }
    });

    return NextResponse.json({
      success: true,
      paymentIntentId: updated.id,
      metadata: updated.metadata
    });
  } catch (err: any) {
    console.error('Error updating session notes:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update session notes' },
      { status: 500 }
    );
  }
}
