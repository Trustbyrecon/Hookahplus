import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function isCronAuthorized(req: NextRequest): boolean {
  const token = getBearerToken(req);
  if (!token) return false;

  const cronSecret = process.env.CRON_SECRET;
  const processorToken = process.env.SQUARE_PROCESSOR_TOKEN;

  // Fail-closed if no secret configured.
  if (!cronSecret && !processorToken) return false;

  return token === cronSecret || token === processorToken;
}

/**
 * GET /api/square/diagnostics
 * Token-gated, server-to-server diagnostics for Square ingest/processing.
 *
 * Query params:
 * - minutes: lookback window (default 60)
 */
export async function GET(req: NextRequest) {
  try {
    if (!isCronAuthorized(req)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing/invalid cron authorization' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const minutes = Math.max(1, Math.min(24 * 60, parseInt(searchParams.get('minutes') || '60', 10)));
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const [
      rawTotal,
      rawUnprocessed,
      rawFailed,
      latestRawErrors,
      paymentsTotal,
      paymentsCompleted,
      latestPayments,
      merchantsTotal,
    ] = await Promise.all([
      prisma.squareEventRaw.count({ where: { receivedAt: { gte: since } } }),
      prisma.squareEventRaw.count({ where: { processedAt: null } }),
      prisma.squareEventRaw.count({ where: { processedAt: { not: null }, errorMessage: { not: null } } }),
      prisma.squareEventRaw.findMany({
        where: { processedAt: { not: null }, errorMessage: { not: null } },
        orderBy: { processedAt: 'desc' },
        take: 5,
        select: {
          eventId: true,
          eventType: true,
          merchantId: true,
          locationId: true,
          receivedAt: true,
          processedAt: true,
          errorMessage: true,
        },
      }),
      prisma.squarePayment.count({ where: { createdAt: { gte: since } } }),
      prisma.squarePayment.count({ where: { status: 'COMPLETED' } }),
      prisma.squarePayment.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          paymentId: true,
          orderId: true,
          merchantId: true,
          locationId: true,
          status: true,
          amountCents: true,
          currency: true,
          updatedAt: true,
        },
      }),
      prisma.squareMerchant.count(),
    ]);

    return NextResponse.json({
      ok: true,
      window: { minutes, since: since.toISOString() },
      squareMerchants: { total: merchantsTotal },
      squareEventsRaw: {
        totalInWindow: rawTotal,
        unprocessed: rawUnprocessed,
        failedTotal: rawFailed,
        latestErrors: latestRawErrors,
      },
      squarePayments: {
        totalInWindow: paymentsTotal,
        completedTotal: paymentsCompleted,
        latest: latestPayments,
      },
    });
  } catch (error: any) {
    console.error('[Square Diagnostics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load diagnostics', details: error.message },
      { status: 500 }
    );
  }
}

