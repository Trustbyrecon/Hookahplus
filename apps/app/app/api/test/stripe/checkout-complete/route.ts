import { NextRequest, NextResponse } from 'next/server';
import { createGhostLogEntry } from '../../../ghost-log/route';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { card } = body;

    // Validate test card
    if (!card || !card.includes('4242')) {
      return NextResponse.json({ 
        error: 'Invalid test card. Use 4242 4242 4242 4242' 
      }, { status: 400 });
    }

    // Simulate successful Stripe test payment
    const paymentIntentId = `pi_test_${Date.now()}`;
    const sessionId = `session_${Date.now()}`;

    // Log successful test payment
    await createGhostLogEntry({
      kind: 'stripe.test.payment_completed',
      payment_intent_id: paymentIntentId,
      session_id: sessionId,
      card: card,
      amount: 100, // $1 test amount
      currency: 'usd',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      payment_intent_id: paymentIntentId,
      session_id: sessionId,
      message: 'Test payment completed successfully',
      amount: 100,
      currency: 'usd'
    });

  } catch (error) {
    console.error('Error processing test payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
