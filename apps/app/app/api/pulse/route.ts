import { NextRequest, NextResponse } from 'next/server';
import { generateDailyPulse } from '../../../lib/pulse-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const window = (searchParams.get('window') as '24h' | 'pm') || '24h';
    const loungeId = searchParams.get('loungeId') || undefined;

    // Generate pulse data (includes demo fallback if DB unavailable)
    const pulseData = await generateDailyPulse(window, loungeId);

    return NextResponse.json({
      success: true,
      pulse: pulseData,
    });
  } catch (error) {
    console.error('[Pulse API] Error generating pulse:', error);
    
    // Final fallback: return demo data even if generateDailyPulse throws
    const USE_DEMO_MODE = process.env.NEXT_PUBLIC_USE_DEMO_MODE === 'true';
    const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
    
    if (USE_DEMO_MODE && IS_DEVELOPMENT) {
      // Re-extract searchParams in catch block
      const { searchParams: catchSearchParams } = new URL(request.url);
      const { generateDemoPulse } = await import('../../../lib/pulse-generator');
      const demoPulse = generateDemoPulse((catchSearchParams.get('window') as '24h' | 'pm') || '24h');
      return NextResponse.json({
        success: true,
        pulse: demoPulse,
        demo: true, // Flag to indicate this is demo data
      });
    }
    
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

