import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for orders (in production, this would be a database)
let orders: Array<{
  id: string;
  payment_intent_id: string;
  lounge_id: string;
  flavor_mix: string[];
  amount: number;
  currency: string;
  ref_source?: string;
  ref_campaign?: string;
  ref_code?: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  created_at: string;
  paid_at?: string;
}> = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const payment_intent_id = searchParams.get('payment_intent_id');

    if (payment_intent_id) {
      const order = orders.find(o => o.payment_intent_id === payment_intent_id);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    // Return all orders if no payment_intent_id specified
    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error retrieving orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      payment_intent_id, 
      lounge_id, 
      flavor_mix, 
      amount, 
      currency,
      ref_source,
      ref_campaign,
      ref_code
    } = body;

    // Validate required fields
    if (!payment_intent_id) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    // Check if order already exists
    const existingOrder = orders.find(o => o.payment_intent_id === payment_intent_id);
    if (existingOrder) {
      return NextResponse.json({ 
        order: existingOrder,
        dupe: true,
        message: 'Order already exists'
      });
    }

    // Create new order
    const order = {
      id: `order_${Date.now()}`,
      payment_intent_id,
      lounge_id,
      flavor_mix,
      amount,
      currency,
      ref_source,
      ref_campaign,
      ref_code,
      status: 'paid' as const,
      created_at: new Date().toISOString(),
      paid_at: new Date().toISOString()
    };

    orders.push(order);

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
