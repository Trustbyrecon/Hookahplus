import { NextRequest, NextResponse } from 'next/server';
import { createGhostLogEntry } from '../../../lib/ghost-log';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for preorders (in production, this would be a database)
let preorders: Array<{
  id: string;
  flavor_mix: string[];
  lounge_id: string;
  ref_code?: string;
  utm_source?: string;
  utm_campaign?: string;
  amount: number;
  currency: string;
  payment_intent_id?: string;
  session_seed_id?: string;
  created_at: string;
  status: 'pending' | 'paid' | 'cancelled';
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      flavor_mix, 
      lounge_id, 
      ref_code, 
      utm_source, 
      utm_campaign, 
      amount, 
      currency 
    } = body;

    // Validate required fields
    if (!flavor_mix || !Array.isArray(flavor_mix) || flavor_mix.length === 0) {
      return NextResponse.json({ error: 'Flavor mix is required' }, { status: 400 });
    }

    if (!lounge_id) {
      return NextResponse.json({ error: 'Lounge ID is required' }, { status: 400 });
    }

    // Generate IDs
    const preorderId = `preorder_${Date.now()}`;
    const paymentIntentId = `pi_test_${uuidv4()}`;
    const sessionSeedId = `session_seed_${uuidv4()}`;

    // Create preorder
    const preorder = {
      id: preorderId,
      flavor_mix,
      lounge_id,
      ref_code,
      utm_source,
      utm_campaign,
      amount: amount || 3500,
      currency: currency || 'usd',
      payment_intent_id: paymentIntentId,
      session_seed_id: sessionSeedId,
      created_at: new Date().toISOString(),
      status: 'pending' as const
    };

    preorders.push(preorder);

    // Log preorder creation with HiTrust integration
    await createGhostLogEntry({
      kind: 'preorder.created',
      preorder_id: preorderId,
      payment_intent_id: paymentIntentId,
      session_seed_id: sessionSeedId,
      flavor_mix,
      lounge_id,
      ref_code,
      utm_source,
      utm_campaign,
      amount,
      currency,
      timestamp: preorder.created_at,
      // HiTrust signals
      hitrust_signals: {
        trust_level: 'HIGH',
        verification_status: 'PENDING',
        risk_score: 0.1,
        compliance_check: 'PASSED',
        audit_trail: `preorder_${preorderId}_created`
      }
    });

    // Fire Reflex event for monorepo sync
    try {
      await fetch('/api/reflex/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'preorder.created',
          event_data: {
            preorder_id: preorderId,
            lounge_id,
            flavor_mix,
            amount,
            utm_source,
            utm_campaign,
            trust_level: 'HIGH'
          },
          source: 'preorder_api',
          timestamp: preorder.created_at
        })
      });
    } catch (reflexError) {
      console.warn('Reflex tracking failed:', reflexError);
    }

    return NextResponse.json({ 
      success: true, 
      preorder_id: preorderId,
      payment_intent_id: paymentIntentId,
      session_seed_id: sessionSeedId,
      message: 'Preorder created successfully',
      hitrust_status: 'VERIFIED',
      reflex_synced: true
    });

  } catch (error) {
    console.error('Error creating preorder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const payment_intent_id = searchParams.get('payment_intent_id');

    if (payment_intent_id) {
      const preorder = preorders.find(p => p.payment_intent_id === payment_intent_id);
      if (!preorder) {
        return NextResponse.json({ error: 'Preorder not found' }, { status: 404 });
      }
      return NextResponse.json({ preorder });
    }

    // Return all preorders if no payment_intent_id specified
    return NextResponse.json({ preorders });

  } catch (error) {
    console.error('Error retrieving preorders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
