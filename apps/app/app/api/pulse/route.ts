import { NextRequest, NextResponse } from 'next/server';
import { generateDailyPulse } from '../../../lib/pulse-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const window = (searchParams.get('window') as '24h' | 'pm') || '24h';
    const loungeId = searchParams.get('loungeId') || undefined;

    // Generate pulse data
    const pulseData = await generateDailyPulse(window, loungeId);

    return NextResponse.json({
      success: true,
      pulse: pulseData,
    });
  } catch (error) {
    console.error('[Pulse API] Error generating pulse:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate pulse',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

