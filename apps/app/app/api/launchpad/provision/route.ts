import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../../lib/db';
import { createSetupSession } from '../../../../lib/launchpad/session-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

/**
 * GET /api/launchpad/provision?sid=cs_...
 *
 * Verifies Stripe checkout session, then creates/reuses a LaunchPad SetupSession
 * prefilled with the paid-tier intent (tier + businessName).
 *
 * Idempotent by Stripe checkout session id.
 */
export async function GET(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const sid = (searchParams.get('sid') || '').trim();
    if (!sid) {
      return NextResponse.json({ success: false, error: 'sid is required' }, { status: 400 });
    }

    // Best-effort: reuse if already provisioned
    let existing: any = null;
    try {
      existing = await (prisma as any).setupSession.findFirst({
        where: { stripeCheckoutSessionId: sid },
        select: { token: true, progress: true, expiresAt: true },
      });
    } catch {
      // Schema may not yet include stripeCheckoutSessionId; fallback to JSON path query.
      try {
        existing = await (prisma as any).setupSession.findFirst({
          where: { prefillData: { path: ['stripe_checkout_session_id'], equals: sid } },
          select: { token: true, progress: true, expiresAt: true },
        });
      } catch {
        existing = null;
      }
    }

    if (existing?.token) {
      return NextResponse.json({
        success: true,
        token: existing.token,
        expiresAt: existing.expiresAt?.toISOString?.() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        progress: existing.progress,
        mode: 'reuse',
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sid, { expand: ['subscription'] as any });

    const status = (session as any).status;
    if (status && status !== 'complete') {
      return NextResponse.json(
        { success: false, error: 'Checkout not complete', status },
        { status: 409 }
      );
    }

    const tier = String(session.metadata?.tier || '').trim() as any;
    const businessName = String((session.metadata as any)?.businessName || '').trim();

    const prefillData = {
      lounge_name: businessName || 'My Lounge',
      operator_type: 'brick_and_mortar',
      seats_tables: '12',
      tier: tier || undefined,
      stripe_checkout_session_id: sid,
      stripe_customer_id: session.customer ? String(session.customer) : undefined,
      stripe_subscription_id: (session as any).subscription ? String((session as any).subscription) : undefined,
      email: session.customer_details?.email || (session as any).customer_email || undefined,
    };

    const created = await createSetupSession('stripe', prefillData);

    // Best-effort: persist a direct idempotency anchor on SetupSession
    try {
      await (prisma as any).setupSession.update({
        where: { token: created.token },
        data: { stripeCheckoutSessionId: sid },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      token: created.token,
      expiresAt: created.expiresAt,
      progress: created.progress,
      mode: 'created',
    });
  } catch (error: any) {
    console.error('[LaunchPad Provision] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to provision LaunchPad session', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

