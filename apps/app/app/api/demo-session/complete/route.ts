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

    if (!simulatedSessionId || !sessionId || !loungeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: simulatedSessionId, sessionId, loungeId',
        },
        { status: 400 }
      );
    }

    console.log('[Demo Session Complete] Processing simulated payment completion:', {
      simulatedSessionId,
      sessionId,
      loungeId,
    });

    // Call shared payment completion handler
    await handlePaymentCompleted({
      source: 'simulated',
      externalSessionId: simulatedSessionId,
      sessionId,
      loungeId,
      operatorId,
      demoMode: 'simulated',
      isDemo: true,
      amountCents: amountCents || 3000,
      paymentIntentId: `sim_${simulatedSessionId}`,
      flavorMix,
      tableId,
      customerPhone,
    });

    return NextResponse.json({
      success: true,
      message: 'Simulated payment completed successfully',
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

