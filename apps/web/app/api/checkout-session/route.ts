import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, flavor, amount } = body;

    // Validate required fields
    if (!tableId || !flavor || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: tableId, flavor, amount' },
        { status: 400 }
      );
    }

    // For demo purposes, create a mock Stripe session
    // In production, this would integrate with Stripe API
    const mockSession = {
      id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      currency: 'usd',
      tableId,
      flavor,
      status: 'open'
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(mockSession);
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
