import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/analytics/gmv
 *
 * Hookah-only Contract v1: Expose GMV_hookah_stripe, GMV_hookah_square, and total
 * for the period (billing/analytics). Uses paymentGateway on Session and Payment table.
 *
 * Query params:
 *   windowDays — number of days back (default 30, max 366)
 *   loungeId   — optional filter by lounge
 *   tenantId   — optional filter by tenant
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const windowDays = Math.min(
      Math.max(1, parseInt(searchParams.get('windowDays') || '30', 10)),
      366
    );
    const loungeId = searchParams.get('loungeId') || undefined;
    const tenantId = searchParams.get('tenantId') || undefined;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - windowDays);

    // GMV Stripe: sum of Payment.amountCents where Stripe charge (hookah sessions)
    const stripeWhere: Record<string, unknown> = {
      stripeChargeId: { not: null },
      status: 'succeeded',
      paidAt: { not: null, gte: cutoff },
    };
    if (tenantId) stripeWhere.tenantId = tenantId;
    if (loungeId) stripeWhere.session = { loungeId };

    const [stripeAgg, squareAgg] = await Promise.all([
      prisma.payment.aggregate({
        where: stripeWhere,
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      prisma.session.aggregate({
        where: {
          paymentGateway: 'square',
          paymentStatus: 'succeeded',
          updatedAt: { gte: cutoff },
          ...(loungeId ? { loungeId } : {}),
          ...(tenantId ? { tenantId } : {}),
          priceCents: { not: null, gt: 0 },
        },
        _sum: { priceCents: true },
        _count: { id: true },
      }),
    ]);

    const gmvHookahStripeCents = stripeAgg._sum.amountCents ?? 0;
    const gmvHookahSquareCents = squareAgg._sum.priceCents ?? 0;
    const gmvHookahTotalCents = gmvHookahStripeCents + gmvHookahSquareCents;

    return NextResponse.json({
      success: true,
      period: {
        windowDays,
        from: cutoff.toISOString(),
        to: new Date().toISOString(),
      },
      filter: { loungeId: loungeId ?? null, tenantId: tenantId ?? null },
      gmv_hookah_stripe_cents: gmvHookahStripeCents,
      gmv_hookah_square_cents: gmvHookahSquareCents,
      gmv_hookah_total_cents: gmvHookahTotalCents,
      gmv_hookah_stripe: gmvHookahStripeCents / 100,
      gmv_hookah_square: gmvHookahSquareCents / 100,
      gmv_hookah_total: gmvHookahTotalCents / 100,
      count_stripe: stripeAgg._count.id,
      count_square: squareAgg._count.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Analytics GMV] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get GMV analytics', details: message },
      { status: 500 }
    );
  }
}
