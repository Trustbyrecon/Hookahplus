import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { convertPrismaSessionToFireSession } from '../../../../../lib/session-utils-prisma';
import { canExtendSession, calculateExtensionCost } from '../../../../../lib/session-utils';
import { calculateRemainingTime } from '../../../../../lib/sessionStateMachine';
import Stripe from 'stripe';

/**
 * POST /api/sessions/[id]/extend
 * 
 * Extends an active session by adding time to the timer.
 * 
 * Flow:
 * 1. Validate session can be extended
 * 2. Calculate extension cost
 * 3. Create Stripe checkout for extension payment
 * 4. Return checkout URL
 * 5. Webhook will process payment and extend session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { 
      extensionMinutes, 
      pricingModel = 'time-based',
      paymentConfirmed = false, // For internal lounges that don't need payment
      userRole = 'MANAGER'
    } = body;

    // Validate extension minutes
    if (!extensionMinutes || extensionMinutes <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid extension',
          details: 'extensionMinutes must be greater than 0'
        },
        { status: 400 }
      );
    }

    // Find session
    const dbSession = await prisma.session.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { externalRef: sessionId },
          { tableId: sessionId }
        ]
      }
    });

    if (!dbSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
          details: `Session ${sessionId} not found`
        },
        { status: 404 }
      );
    }

    // Convert to FireSession format
    const fireSession = convertPrismaSessionToFireSession(dbSession);

    // Validate session can be extended
    const validation = canExtendSession(fireSession);
    if (!validation.canExtend) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot extend session',
          details: validation.reason || 'Session cannot be extended'
        },
        { status: 400 }
      );
    }

    // Calculate extension cost
    const currentDuration = fireSession.sessionDuration || 45 * 60; // Default 45 minutes
    const extensionCost = calculateExtensionCost(
      currentDuration,
      extensionMinutes,
      pricingModel
    );

    // If payment is already confirmed (internal lounge), extend immediately
    if (paymentConfirmed || userRole === 'ADMIN') {
      return await extendSessionImmediately(
        dbSession,
        fireSession,
        extensionMinutes,
        extensionCost
      );
    }

    // Otherwise, create Stripe checkout for extension payment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe not configured',
          details: 'STRIPE_SECRET_KEY environment variable is missing'
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil' as any,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const extensionAmountCents = Math.round(extensionCost * 100);

    // Create Stripe checkout session for extension
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Session Extension',
              description: `Extend session by ${extensionMinutes} minutes`
            },
            unit_amount: extensionAmountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/fire-session-dashboard?session=${sessionId}&extended=true`,
      cancel_url: `${appUrl}/fire-session-dashboard?session=${sessionId}&extended=canceled`,
      // SECURITY: Only send opaque session ID to Stripe
      metadata: {
        h_session: sessionId,
        h_action: 'extend',
        h_extension_minutes: extensionMinutes.toString(),
        h_extension_cost: extensionCost.toString(),
        h_pricing_model: pricingModel
      },
      payment_intent_data: {
        description: `Session Extension - ${extensionMinutes} minutes`,
        metadata: {
          h_session: sessionId,
          h_action: 'extend'
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      extensionMinutes,
      extensionCost,
      message: 'Extension checkout created. Complete payment to extend session.'
    });

  } catch (error: any) {
    console.error('[Session Extension API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extend session',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Extend session immediately (for internal lounges or admin)
 */
async function extendSessionImmediately(
  dbSession: any,
  fireSession: any,
  extensionMinutes: number,
  extensionCost: number
) {
  try {
    // Calculate new timer duration
    const currentTimerDuration = dbSession.timerDuration || 45 * 60;
    const extensionSeconds = extensionMinutes * 60;
    const newTimerDuration = currentTimerDuration + extensionSeconds;

    // Update session with extended duration
    const updatedSession = await prisma.session.update({
      where: { id: dbSession.id },
      data: {
        timerDuration: newTimerDuration,
        durationSecs: (dbSession.durationSecs || 45 * 60) + extensionSeconds,
        // Update price to include extension cost
        priceCents: (dbSession.priceCents || 3000) + Math.round(extensionCost * 100),
        updatedAt: new Date()
      }
    });

    // Log extension event
    try {
      await prisma.reflexEvent.create({
        data: {
          type: 'session.extended',
          source: 'api',
          sessionId: dbSession.id,
          payload: JSON.stringify({
            action: 'extend_session',
            extensionMinutes,
            extensionCost,
            newDuration: newTimerDuration,
            businessLogic: 'Session extended - timer duration increased'
          }),
          payloadHash: 'extend_' + Date.now() // Simple hash for extension events
        }
      });
    } catch (eventError) {
      console.warn('[Session Extension] Failed to create analytics event:', eventError);
    }

    const extendedFireSession = convertPrismaSessionToFireSession(updatedSession);

    return NextResponse.json({
      success: true,
      session: extendedFireSession,
      extensionMinutes,
      extensionCost,
      newDuration: newTimerDuration,
      message: `Session extended by ${extensionMinutes} minutes`,
      businessLogic: 'Session extended - timer duration increased, payment confirmed'
    });

  } catch (error: any) {
    console.error('[Session Extension] Error extending session:', error);
    throw error;
  }
}

/**
 * GET /api/sessions/[id]/extend
 * 
 * Get extension options and cost for a session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const extensionMinutes = parseInt(searchParams.get('minutes') || '30', 10);
    const pricingModel = (searchParams.get('pricingModel') || 'time-based') as 'flat' | 'time-based';

    // Find session
    const dbSession = await prisma.session.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { externalRef: sessionId },
          { tableId: sessionId }
        ]
      }
    });

    if (!dbSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found'
        },
        { status: 404 }
      );
    }

    const fireSession = convertPrismaSessionToFireSession(dbSession);

    // Validate session can be extended
    const validation = canExtendSession(fireSession);
    if (!validation.canExtend) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot extend session',
          details: validation.reason
        },
        { status: 400 }
      );
    }

    // Calculate extension cost
    const currentDuration = fireSession.sessionDuration || 45 * 60;
    const extensionCost = calculateExtensionCost(
      currentDuration,
      extensionMinutes,
      pricingModel
    );

    // Get current remaining time
    const remaining = calculateRemainingTime(fireSession);

    return NextResponse.json({
      success: true,
      sessionId: dbSession.id,
      currentDuration: currentDuration / 60, // minutes
      remainingTime: remaining / 60, // minutes
      extensionMinutes,
      extensionCost,
      newDuration: (currentDuration + (extensionMinutes * 60)) / 60, // minutes
      pricingModel,
      canExtend: true
    });

  } catch (error: any) {
    console.error('[Session Extension GET] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get extension options',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

