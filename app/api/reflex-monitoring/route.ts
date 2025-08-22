import { NextRequest, NextResponse } from 'next/server';

// Types
export type TrustPoint = { 
  t: string; 
  score: number;
  timestamp: string;
  lounge: string;
  range: string;
};

// Mock data
const MOCK_TRUST: TrustPoint[] = [
  { t: "Mon", score: 78, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), lounge: "Pilot #001", range: "Last 7 days" },
  { t: "Tue", score: 81, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), lounge: "Pilot #001", range: "Last 7 days" },
  { t: "Wed", score: 79, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), lounge: "Pilot #001", range: "Last 7 days" },
  { t: "Thu", score: 85, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), lounge: "Pilot #001", range: "Last 7 days" },
  { t: "Fri", score: 88, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), lounge: "Pilot #001", range: "Last 7 days" },
  { t: "Sat", score: 84, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), lounge: "Pilot #001", range: "Last 7 days" },
  { t: "Sun", score: 83, timestamp: new Date().toISOString(), lounge: "Pilot #001", range: "Last 7 days" },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lounge = searchParams.get('lounge') || 'Pilot #001';
    const range = searchParams.get('range') || 'Last 7 days';

    // TODO: Replace with actual database query
    // const trustData = await getTrustData(lounge, range);
    
    // For now, return mock data with some randomization and current timestamp
    const currentTime = new Date();
    const randomizedTrust: TrustPoint[] = MOCK_TRUST.map((item, index) => ({
      ...item,
      lounge,
      range,
      score: Math.max(60, Math.min(100, item.score + (Math.random() * 10) - 5)),
      timestamp: new Date(currentTime.getTime() - (6 - index) * 24 * 60 * 60 * 1000).toISOString(),
    }));

    // Add current real-time score
    const currentScore = Math.max(60, Math.min(100, 83 + (Math.random() * 10) - 5));
    randomizedTrust.push({
      t: "Now",
      score: currentScore,
      timestamp: currentTime.toISOString(),
      lounge,
      range,
    });

    return NextResponse.json({
      success: true,
      data: randomizedTrust,
      lounge,
      range,
      timestamp: currentTime.toISOString(),
      summary: {
        currentScore,
        avgScore: randomizedTrust.reduce((sum, item) => sum + item.score, 0) / randomizedTrust.length,
        trend: currentScore > randomizedTrust[randomizedTrust.length - 2]?.score ? 'up' : 'down',
        dataPoints: randomizedTrust.length
      }
    });

  } catch (error) {
    console.error('Error fetching reflex monitoring data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reflex monitoring data',
        fallback: MOCK_TRUST 
      },
      { status: 500 }
    );
  }
}
