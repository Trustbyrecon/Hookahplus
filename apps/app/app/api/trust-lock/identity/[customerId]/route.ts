// Trust Lock Integration API
// This connects all the trust lock components and provides a unified interface

import { NextRequest, NextResponse } from 'next/server';
import { trustLockService } from '../lib/trustLockService';
import { sessionNotesLoyaltyBinding } from '../lib/sessionNotesLoyaltyBinding';
import { ghostLogLite } from '../lib/ghostLogLite';
import { reflexiveBadgeEngine } from '../lib/reflexiveBadgeEngine';

// GET /api/trust-lock/identity/:customerId
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

// POST /api/trust-lock/session-event
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

// POST /api/trust-lock/bind-notes
export async function POST(req: NextRequest) {
  try {
    const { customerId, sessionId, notes, noteType, createdBy, venueId } = await req.json();
    
    const binding = await sessionNotesLoyaltyBinding.bindNoteToLoyalty(
      customerId,
      sessionId,
      `note_${Date.now()}`,
      notes,
      noteType,
      createdBy,
      venueId
    );
    
    const loyaltyProgression = await sessionNotesLoyaltyBinding.getLoyaltyProgression(customerId, venueId);
    const behavioralInsights = sessionNotesLoyaltyBinding.getBehavioralInsights(customerId);
    
    return NextResponse.json({
      ok: true,
      binding,
      loyaltyProgression,
      behavioralInsights
    });
  } catch (error) {
    console.error('Trust lock notes binding error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to bind notes' }, { status: 500 });
  }
}

// GET /api/trust-lock/verify/:customerId
export async function GET(req: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    const { customerId } = params;
    
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
