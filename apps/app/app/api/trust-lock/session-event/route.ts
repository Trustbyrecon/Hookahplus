// Trust Lock Session Event API
import { NextRequest, NextResponse } from 'next/server';
import { trustLockService } from '../../../../lib/trustLockService';
import { ghostLogLite } from '../../../../lib/ghostLogLite';
import { reflexiveBadgeEngine } from '../../../../lib/reflexiveBadgeEngine';

export async function POST(req: NextRequest) {
  try {
    const { customerId, eventType, eventData, venueId, sessionId } = await req.json();
    
    // Create trust stamp
    const trustStamp = await ghostLogLite.appendTrustEvent(
      customerId,
      eventType,
      eventData,
      venueId,
      sessionId
    );
    
    // Update badge progress
    const badgeProgress = await reflexiveBadgeEngine.updateBadgeProgress(
      customerId,
      eventType,
      eventData
    );
    
    // Update cross-venue identity
    const identity = await trustLockService.getOrCreateIdentity(customerId, venueId);
    
    return NextResponse.json({
      ok: true,
      trustStamp,
      badgeProgress,
      identity
    });
  } catch (error) {
    console.error('Trust lock session event error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to process session event' }, { status: 500 });
  }
}
