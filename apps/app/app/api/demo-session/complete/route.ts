import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentCompleted } from '../../../../core/handlePaymentCompleted';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      simulatedSessionId,
      sessionId,
      loungeId,
      operatorId,
      amountCents,
      flavorMix,
      tableId,
      customerPhone,
    } = body;

    // sessionId is required, but simulatedSessionId and loungeId can be derived
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: sessionId',
        },
        { status: 400 }
      );
    }

    // For existing sessions (like "Sarah & Friends"), use sessionId as externalSessionId if not provided
    const externalSessionId = simulatedSessionId || `demo_${sessionId}`;
    const effectiveLoungeId = loungeId || 'demo-lounge';

    console.log('[Demo Session Complete] Processing simulated payment completion:', {
      simulatedSessionId: externalSessionId,
      sessionId,
      loungeId: effectiveLoungeId,
    });

    // Call shared payment completion handler
    await handlePaymentCompleted({
      source: 'simulated',
      externalSessionId,
      sessionId,
      loungeId: effectiveLoungeId,
      operatorId,
      demoMode: 'simulated',
      isDemo: true,
      amountCents: amountCents || 3000,
      paymentIntentId: `sim_${externalSessionId}`,
      flavorMix,
      tableId,
      customerPhone,
    });

    return NextResponse.json({
      success: true,
      message: 'Simulated payment completed successfully - session ready for NAN workflow',
      sessionId,
    });
  } catch (error: any) {
    console.error('[Demo Session Complete] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to complete simulated payment',
      },
      { status: 500 }
    );
  }
}

