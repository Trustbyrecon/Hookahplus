// Trust Lock Verification API
// GET /api/trust-lock/verify/:customerId

import { NextRequest, NextResponse } from 'next/server';
import { ghostLogLite } from '../../../../../lib/ghostLogLite';

export async function GET(req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  try {
    const { customerId } = await params;
    
    const verification = await ghostLogLite.verifyTrustChain(customerId);
    const statistics = ghostLogLite.getTrustStatistics();
    
    return NextResponse.json({
      ok: true,
      verification,
      statistics
    });
  } catch (error) {
    console.error('Trust lock verification error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to verify trust chain' }, { status: 500 });
  }
}
