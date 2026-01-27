import { NextRequest, NextResponse } from 'next/server';
import { processSquareRawEvents } from '../../../../lib/square/processor';

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

async function handle(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Missing/invalid cron authorization' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  const result = await processSquareRawEvents(limit);

  return NextResponse.json({
    success: true,
    processed: result.processed,
    failed: result.failed,
  });
}

/**
 * POST /api/square/process
 * Process unprocessed Square raw events.
 * Query params:
 * - limit: number of events to process (default: 100)
 */
export async function POST(req: NextRequest) {
  try {
    return await handle(req);
  } catch (error: any) {
    console.error('[Square Process] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Square events', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/square/process
 * Vercel Cron invokes cron paths via GET.
 */
export async function GET(req: NextRequest) {
  try {
    return await handle(req);
  } catch (error: any) {
    console.error('[Square Process] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Square events', details: error.message },
      { status: 500 }
    );
  }
}

