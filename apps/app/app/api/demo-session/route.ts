import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'crypto';
import {
  DemoSessionRequest,
  DemoSessionResponse,
  DemoSessionMode,
  DemoSessionSource,
  DemoSessionMeta,
} from '../../../types/demoSession';
import { PrismaClient, SessionSource } from '@prisma/client';

const prisma = new PrismaClient();

// Trust signature generation (same pattern as sessions route)
const seal = (o: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

// Helper to get test Stripe instance for demo mode (always uses test keys)
function getTestStripeInstance(): Stripe | null {
  // Priority: STRIPE_TEST_SECRET_KEY (demo-specific) > STRIPE_SECRET_KEY (if test) > null
  const demoTestKey = process.env.STRIPE_TEST_SECRET_KEY;
  const mainKey = process.env.STRIPE_SECRET_KEY;
  
  // Use demo-specific test key if available
  if (demoTestKey && demoTestKey.startsWith('sk_test_')) {
    console.log('[Demo Session] ✅ Using STRIPE_TEST_SECRET_KEY for demo mode');
    return new Stripe(demoTestKey, {
      apiVersion: '2025-08-27.basil' as any,
    });
  }
  
  // Fallback to main key if it's a test key
  if (mainKey && mainKey.startsWith('sk_test_')) {
    console.log('[Demo Session] ✅ Using STRIPE_SECRET_KEY (test key) for demo mode');
    return new Stripe(mainKey, {
      apiVersion: '2025-08-27.basil' as any,
    });
  }
  
  // If main key is live, reject it for demo mode
  if (mainKey && mainKey.startsWith('sk_live_')) {
    console.warn('[Demo Session] ⚠️ STRIPE_SECRET_KEY is a live key. Demo mode requires sk_test_ keys.');
    return null;
  }
  
  // No key configured
  return null;
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

const stripeWebhookConfigured =
  !!(process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET_APP) &&
  process.env.STRIPE_WEBHOOK_SECRET !== 'whsec_placeholder';

function isStripeReady(): boolean {
  // For demo mode, only consider Stripe ready if we have test keys
  const testStripe = getTestStripeInstance();
  return !!testStripe && stripeWebhookConfigured;
}

function resolveDemoMode(
  requested?: DemoSessionMode,
  source?: DemoSessionSource
): DemoSessionMode {
  // Marketing/public demo always uses simulated
  if (source === 'marketing') {
    return 'simulated';
  }

  // If caller explicitly asks for simulated, respect it
  if (requested === 'simulated') {
    return 'simulated';
  }

  // If Stripe is ready and they didn't explicitly ask for simulated, use stripe_test
  if (isStripeReady()) {
    return 'stripe_test';
  }

  // Fallback to simulated
  return 'simulated';
}

async function createStripeTestSession(
  payload: DemoSessionRequest,
  sessionId: string
): Promise<string> {
  // SECURITY: Demo mode requires test keys only - get test instance
  const testStripe = getTestStripeInstance();
  if (!testStripe) {
    const currentKey = process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'not set';
    throw new Error(`Demo mode requires Stripe test keys (sk_test_...). Current key starts with: ${currentKey}. Live keys (sk_live_...) are not allowed in demo.`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  const successUrl = `${baseUrl}/checkout/success?session_id=${sessionId}&mode=demo&source=${payload.source || 'onboarding'}`;
  const cancelUrl = `${baseUrl}/checkout/cancel?session_id=${sessionId}&mode=demo&source=${payload.source || 'onboarding'}`;

  const sessionData = payload.sessionData || {};
  const flavors = sessionData.flavorMix || ['Custom Mix'];
  const amount = sessionData.amount ? Math.round(sessionData.amount * 100) : 3000;

  console.log('[Demo Session] 🎭 Creating Stripe TEST checkout session with test keys');
  const session = await testStripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Hookah Session - ${flavors.join(' + ')}`,
            description: `Demo Session - Flavor mix: ${flavors.join(', ')}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      h_session: sessionId,
      h_order: `H+ ${sessionId.substring(0, 8)}`,
      is_demo: 'true',
      demo_mode: 'stripe_test',
      demo_source: payload.source || 'onboarding',
    },
  });

  return session.url || '';
}

async function createSimulatedSession(
  payload: DemoSessionRequest,
  sessionId: string
): Promise<string> {
  // For simulated sessions, we'll create the session in the database
  // and return a simulated session ID
  const simulatedSessionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create session record (payment will be confirmed via /api/demo-session/complete)
  try {
    const sessionData = payload.sessionData || {};
    
    // Generate trust signature (required by Prisma schema)
    const trustSignature = seal({
      loungeId: payload.loungeId,
      source: SessionSource.QR,
      externalRef: simulatedSessionId,
      customerPhone: sessionData.customerPhone || null,
      flavorMix: sessionData.flavorMix || null,
    });
    
    await prisma.session.create({
      data: {
        id: sessionId,
        externalRef: simulatedSessionId,
        source: SessionSource.QR,
        state: 'PENDING' as any,
        trustSignature,
        tableId: sessionData.tableId || 'table-001',
        customerRef: sessionData.customerName || 'Demo Customer',
        customerPhone: sessionData.customerPhone || null,
        flavor: null,
        flavorMix: sessionData.flavorMix ? JSON.stringify(sessionData.flavorMix) : null,
        loungeId: payload.loungeId,
        priceCents: sessionData.amount ? Math.round(sessionData.amount * 100) : 3000,
        paymentStatus: null, // Will be confirmed via complete endpoint
        sessionType: sessionData.pricingModel || 'flat',
        durationSecs: (sessionData.timerDuration || 60) * 60,
      },
    });
  } catch (error) {
    console.error('[Demo Session] Failed to create session record:', error);
    // Continue anyway - session might already exist
  }

  return simulatedSessionId;
}

async function logDemoSessionMeta(meta: DemoSessionMeta) {
  try {
    await prisma.reflexEvent.create({
      data: {
        type: 'demo.session.created',
        source: 'demo',
        sessionId: meta.sessionId,
        payload: JSON.stringify({
          action: 'demo_session_created',
          mode: meta.mode,
          source: meta.source,
          loungeId: meta.loungeId,
          operatorId: meta.operatorId,
          createdAt: meta.createdAt,
          businessLogic: `Demo session created via ${meta.source} flow using ${meta.mode} mode`
        }),
        payloadHash: `demo_${meta.sessionId}_${Date.now()}`,
        tenantId: null, // Demo sessions don't have tenant
      },
    });
    console.log('[Demo Session] Analytics logged:', meta);
  } catch (error) {
    console.error('[Demo Session] Failed to log analytics (non-blocking):', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DemoSessionRequest;

    if (!body.loungeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: loungeId',
        },
        { status: 400 }
      );
    }

    const mode = resolveDemoMode(body.mode, body.source);
    const source = body.source || (body.loungeId ? 'onboarding' : 'marketing');

    // Generate session ID
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let response: DemoSessionResponse;

    if (mode === 'stripe_test') {
      try {
        const checkoutUrl = await createStripeTestSession(body, sessionId);
        response = {
          mode,
          status: 'ready',
          checkoutUrl,
          reason: 'Stripe test session created',
          message: 'This will run a real Stripe test payment using test card numbers – no real money moves.',
        };
      } catch (err: any) {
        console.error('[Demo Session] Stripe test failed, falling back to simulated:', err);
        // Soft-fail back to simulated
        const simulatedSessionId = await createSimulatedSession(body, sessionId);
        response = {
          mode: 'simulated',
          status: 'ready',
          simulatedSessionId,
          reason: `Stripe test failed: ${err.message || 'Unknown error'}. Using simulated flow.`,
          message: "We couldn't reach Stripe for a real test. We're running a simulated session and will help you fix Stripe setup next.",
        };
      }
    } else {
      const simulatedSessionId = await createSimulatedSession(body, sessionId);
      response = {
        mode,
        status: 'ready',
        simulatedSessionId,
        reason: source === 'marketing' 
          ? 'Marketing demo uses simulated flow only'
          : 'Stripe not ready, using simulated flow',
        message: source === 'marketing'
          ? "Simulated session (no real payment). This is a quick demo to get the feeling in 30 seconds without any setup."
          : "We're running a simulated session because Stripe is not fully configured yet. You'll still see the staff experience, but no payment is sent to Stripe.",
      };
    }

    // Log demo session meta for analytics
    await logDemoSessionMeta({
      createdAt: new Date().toISOString(),
      mode: response.mode,
      loungeId: body.loungeId,
      operatorId: body.operatorId,
      source: source as DemoSessionSource,
      sessionId,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Demo Session] Error:', error);
    const response: DemoSessionResponse = {
      mode: 'simulated',
      status: 'error',
      reason: error.message ?? 'Unknown error',
      message: 'Failed to create demo session. Please try again.',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

