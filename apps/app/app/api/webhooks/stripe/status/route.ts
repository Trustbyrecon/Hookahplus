import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for webhook status (in production, this would be a database)
let webhookStatus: Array<{
  payment_intent_id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  created_at: string;
  updated_at: string;
  amount?: number;
  currency?: string;
}> = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const payment_intent_id = searchParams.get('payment_intent_id');

    if (!payment_intent_id) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    // Find webhook status for the payment intent
    let status = webhookStatus.find(w => w.payment_intent_id === payment_intent_id);
    
    if (!status) {
      // Create a new status entry if it doesn't exist
      status = {
        payment_intent_id,
        status: 'succeeded', // Default to succeeded for test payments
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        amount: 100, // $1 test amount
        currency: 'usd'
      };
      webhookStatus.push(status);
    }

    return NextResponse.json({ 
      payment_intent_id,
      status: status.status,
      created_at: status.created_at,
      updated_at: status.updated_at,
      amount: status.amount,
      currency: status.currency
    });

  } catch (error) {
    console.error('Error retrieving webhook status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_intent_id, status: newStatus, amount, currency } = body;

    if (!payment_intent_id) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    // Find existing status or create new one
    let status = webhookStatus.find(w => w.payment_intent_id === payment_intent_id);
    
    if (status) {
      // Update existing status
      status.status = newStatus || status.status;
      status.updated_at = new Date().toISOString();
      if (amount) status.amount = amount;
      if (currency) status.currency = currency;
    } else {
      // Create new status
      status = {
        payment_intent_id,
        status: newStatus || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        amount: amount || 100,
        currency: currency || 'usd'
      };
      webhookStatus.push(status);
    }

    return NextResponse.json({ 
      success: true,
      payment_intent_id,
      status: status.status,
      message: 'Webhook status updated successfully'
    });

  } catch (error) {
    console.error('Error updating webhook status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
