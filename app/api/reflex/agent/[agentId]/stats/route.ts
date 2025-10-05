// app/api/reflex/agent/[agentId]/stats/route.ts
// Agent Statistics API

import { NextRequest, NextResponse } from 'next/server';
import { getAgentStats } from '../../../../../../lib/reflex/ghostLog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const timeWindow = request.nextUrl.searchParams.get('timeWindow');
    const windowMs = timeWindow ? parseInt(timeWindow) * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    const stats = getAgentStats(agentId, windowMs);
    
    return NextResponse.json({
      success: true,
      data: stats,
      agentId,
      timeWindow: windowMs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Agent stats API error:', error);
    const { agentId } = await params;
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch agent statistics',
        agentId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
