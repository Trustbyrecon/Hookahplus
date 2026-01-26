import { NextRequest, NextResponse } from 'next/server';
import { processSquareRawEvents } from '../../../../lib/square/processor';

/**
 * POST /api/square/process
 * Process unprocessed Square raw events.
 * Query params:
 * - limit: number of events to process (default: 100)
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const result = await processSquareRawEvents(limit);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
    });
  } catch (error: any) {
    console.error('[Square Process] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Square events', details: error.message },
      { status: 500 }
    );
  }
}

