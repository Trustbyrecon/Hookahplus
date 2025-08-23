import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lounge } = body;

    // TODO: Replace with actual calibration stop trigger
    // await stopCalibration(lounge);
    
    console.log('🛑 Reflex calibration stopped:', { lounge, timestamp: new Date().toISOString() });

    // Simulate calibration stop
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Reflex calibration stopped successfully',
      data: {
        status: 'stopped',
        lounge,
        timestamp: new Date().toISOString(),
        finalResults: {
          consensusAchieved: 0.82,
          targetConsensus: 0.85,
          agentsCalibrated: 4,
          totalDuration: '3 minutes 45 seconds',
          finalAgentScores: {
            EP: 0.89,
            Navigator: 0.84,
            Sentinel: 0.87,
            Aliethia: 0.81
          }
        }
      }
    });

  } catch (error) {
    console.error('Error stopping reflex calibration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to stop reflex calibration' 
      },
      { status: 500 }
    );
  }
}
