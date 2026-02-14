import { NextRequest, NextResponse } from 'next/server';
import { eventQueue } from '../../../../lib/events';

/**
 * POST /api/events/process
 * Process unprocessed events (for catch-up or manual trigger)
 * 
 * Query params:
 *   - limit: Number of events to process (default: 100)
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    await eventQueue.processEvents(limit);

    return NextResponse.json({
      success: true,
      message: `Processed up to ${limit} events`
    });
  } catch (error) {
    console.error('Error processing events:', error);
    return NextResponse.json(
      {
        error: 'Failed to process events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

