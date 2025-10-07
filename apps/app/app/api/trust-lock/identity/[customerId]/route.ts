// Trust Lock Identity API
// GET /api/trust-lock/identity/:customerId

import { NextRequest, NextResponse } from 'next/server';
import { trustLockService } from '@/lib/trustLockService';
import { sessionNotesLoyaltyBinding } from '@/lib/sessionNotesLoyaltyBinding';
import { ghostLogLite } from '@/lib/ghostLogLite';
import { reflexiveBadgeEngine } from '@/lib/reflexiveBadgeEngine';

export async function GET(req: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    const { customerId } = params;
    const venueId = req.nextUrl.searchParams.get('venueId') || 'default';
    
    const identity = await trustLockService.getOrCreateIdentity(customerId, venueId);
    const loyaltyProfile = await trustLockService.getLoyaltyProfile(customerId, venueId);
    const badgeProgress = reflexiveBadgeEngine.getCustomerBadgeProgress(customerId);
    const trustHistory = ghostLogLite.getCustomerTrustHistory(customerId, 10);
    
    return NextResponse.json({
      ok: true,
      identity,
      loyaltyProfile,
      badgeProgress,
      trustHistory
    });
  } catch (error) {
    console.error('Trust lock identity fetch error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch identity' }, { status: 500 });
  }
}
