import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { tableId, customerInfo } = await req.json();

    // Always return successful test session for development
    // This simulates a $1 test payment without requiring Stripe
    const testSessionData = {
      success: true,
      clientSecret: 'pi_test_simulation_client_secret_' + Date.now(),
      paymentIntentId: 'pi_test_simulation_' + Date.now(),
      amount: 100, // $1.00 in cents
      currency: 'usd',
      metadata: {
        type: 'test_hookah_session',
        tableId: tableId || 'T-TEST',
        customerName: customerInfo?.name || 'Test Customer',
        customerPhone: customerInfo?.phone || '(555) 123-4567',
        flavor: 'Test Flavor Mix',
        testMode: 'true',
        simulated: 'true'
      },
      simulated: true,
      message: 'Test session created successfully! This is a simulation for development purposes.'
    };

    console.log('✅ Test session created:', testSessionData);

    return NextResponse.json(testSessionData, { status: 200 });

  } catch (error: any) {
    console.error('❌ Test session creation error:', error);
    
    // Return a fallback response even on error
    return NextResponse.json({
      success: true,
      clientSecret: 'pi_fallback_test_secret',
      paymentIntentId: 'pi_fallback_test_' + Date.now(),
      amount: 100,
      currency: 'usd',
      metadata: {
        type: 'test_hookah_session',
        tableId: 'T-FALLBACK',
        customerName: 'Fallback Test Customer',
        customerPhone: '(555) 000-0000',
        flavor: 'Fallback Test Flavor',
        testMode: 'true',
        simulated: 'true',
        fallback: 'true'
      },
      simulated: true,
      fallback: true,
      message: 'Test session created with fallback data due to error'
    }, { status: 200 });
  }
}
