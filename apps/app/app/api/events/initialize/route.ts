import { NextRequest, NextResponse } from 'next/server';
import { initializeWorkers } from '../../../../lib/events';

/**
 * POST /api/events/initialize
 * Initialize event workers (call on server startup)
 */
export async function POST(req: NextRequest) {
  try {
    initializeWorkers();
    
    return NextResponse.json({
      success: true,
      message: 'Event workers initialized'
    });
  } catch (error) {
    console.error('Error initializing event workers:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize event workers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

