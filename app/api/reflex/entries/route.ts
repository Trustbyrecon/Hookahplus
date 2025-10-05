// app/api/reflex/entries/route.ts
// GhostLog Entries API

import { NextRequest, NextResponse } from 'next/server';
import { getEntries } from '../../../../lib/reflex/ghostLog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const route = searchParams.get('route');
    const outcome = searchParams.get('outcome');
    const limit = searchParams.get('limit');
    const since = searchParams.get('since');
    
    const options = {
      agentId: agentId || undefined,
      route: route || undefined,
      outcome: outcome || undefined,
      limit: limit ? parseInt(limit) : undefined,
      since: since ? parseInt(since) : undefined
    };
    
    const entries = getEntries(options);
    
    return NextResponse.json({
      success: true,
      data: entries,
      count: entries.length,
      filters: options,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('GhostLog entries API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch GhostLog entries',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
