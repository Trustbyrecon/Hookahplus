// app/api/sessions/extend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession, putSession } from '@/lib/sessionState';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId, extensionMinutes = 20, tableId } = await request.json();
    
    if (!sessionId || !tableId) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, tableId' },
        { status: 400 }
      );
    }

    // Get current session
    const currentSession = getSession(sessionId);
    if (!currentSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check extension limits
    const maxExtensions = 3;
    const currentExtensions = currentSession.extensions || 0;
    
    if (currentExtensions >= maxExtensions) {
      return NextResponse.json(
        { error: `Maximum ${maxExtensions} extensions allowed per session` },
        { status: 400 }
      );
    }

    // Calculate extension cost ($0.50 per minute)
    const extensionCost = Math.round(extensionMinutes * 50); // $0.50 per minute in cents
    
    // Create Stripe checkout session for extension
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Session Extension - ${extensionMinutes} minutes`,
              description: `Extend your hookah session at ${tableId} by ${extensionMinutes} minutes`,
            },
            unit_amount: extensionCost,
          },
          quantity: 1,
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}/success?session_id={CHECKOUT_SESSION_ID}&type=extension`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net'}/sessions?cancelled=true`,
      metadata: {
        sessionId,
        tableId,
        extensionMinutes: extensionMinutes.toString(),
        type: 'session_extension'
      },
      client_reference_id: `ext_${sessionId}_${Date.now()}`,
    });

    // Update session with pending extension
    const updatedSession = {
      ...currentSession,
      pendingExtension: {
        minutes: extensionMinutes,
        cost: extensionCost,
        checkoutSessionId: checkoutSession.id,
        requestedAt: Date.now()
      }
    };
    
    putSession(updatedSession);

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      extensionMinutes,
      cost: extensionCost,
      sessionId: checkoutSession.id
    });

  } catch (error: any) {
    console.error('Session extension error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create extension checkout',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
