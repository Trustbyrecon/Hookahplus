// app/api/reflex/health/route.ts
// Reflex System Health API

import { NextRequest, NextResponse } from 'next/server';
import { getSystemHealth } from '../../../../lib/reflex/ghostLog';

export async function GET(request: NextRequest) {
  try {
    const health = getSystemHealth();
    
    return NextResponse.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reflex health API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system health',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
