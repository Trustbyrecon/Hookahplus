import { NextRequest, NextResponse } from 'next/server';
import { replayDLQEvents, getDLQStats } from '../../../../../lib/pos/webhook-framework';
import { hasRole } from '../../../../../lib/auth';

/**
 * GET /api/admin/integration-events/dlq
 * Get DLQ statistics and list of failed events
 */
export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const integrationType = searchParams.get('integrationType') as 'square' | 'toast' | 'clover' | undefined;
    const limit = parseInt(searchParams.get('limit') || '100');

    const [events, stats] = await Promise.all([
      replayDLQEvents(integrationType, limit),
      getDLQStats(),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      events,
    });

  } catch (error) {
    console.error('Error getting DLQ events:', error);
    return NextResponse.json(
      {
        error: 'Failed to get DLQ events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/integration-events/dlq
 * Replay events from DLQ (manual recovery)
 */
export async function POST(req: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await hasRole(req, ['admin', 'owner']);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { eventIds, integrationType } = body;

    // TODO: Implement replay logic
    // This would reset retry count and status, then reprocess events

    return NextResponse.json({
      success: true,
      message: 'DLQ replay not yet implemented',
      eventIds: eventIds || [],
    });

  } catch (error) {
    console.error('Error replaying DLQ events:', error);
    return NextResponse.json(
      {
        error: 'Failed to replay DLQ events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

