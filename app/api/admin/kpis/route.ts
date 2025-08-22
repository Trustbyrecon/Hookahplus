import { NextRequest, NextResponse } from 'next/server';

// Types
export type KPIs = {
  sessions: number;
  revenue: number; // USD
  avgMarginPct: number; // 0..100
  trustScore: number; // 0..100
};

// Mock data
const MOCK_KPIS: KPIs = { 
  sessions: 182, 
  revenue: 5430, 
  avgMarginPct: 41.7, 
  trustScore: 83 
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lounge = searchParams.get('lounge');
    const range = searchParams.get('range');

    // TODO: Replace with actual database query
    // const kpis = await getKPIs(lounge, range);
    
    // For now, return mock data with some randomization
    const randomizedKPIs: KPIs = {
      sessions: MOCK_KPIS.sessions + Math.floor(Math.random() * 20) - 10,
      revenue: MOCK_KPIS.revenue + Math.floor(Math.random() * 200) - 100,
      avgMarginPct: Math.max(0, Math.min(100, MOCK_KPIS.avgMarginPct + (Math.random() * 10) - 5)),
      trustScore: Math.max(0, Math.min(100, MOCK_KPIS.trustScore + (Math.random() * 10) - 5)),
    };

    return NextResponse.json({
      success: true,
      data: randomizedKPIs,
      lounge,
      range,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch KPIs',
        fallback: MOCK_KPIS 
      },
      { status: 500 }
    );
  }
}
