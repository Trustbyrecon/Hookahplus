import { NextRequest, NextResponse } from 'next/server';
import { CheckoutRequest, CheckoutResponse, LoyaltyEvent } from "@guest-types";
import { featureFlags } from './flags';
import { createGhostLogEntry, hashGuestEvent } from './hash';
import { v4 as uuidv4 } from 'uuid';
import { getGuestProfile, setGuestProfile, sharedSessions, sharedLoyaltyEvents, sharedReceipts } from './shared-storage';

/**
 * POST /api/guest/checkout
 * 
 * Processes checkout for a session
 */
export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequest = await req.json();
    const { sessionId, method, promoCode } = body;

    // Validate required fields
    if (!sessionId || !method) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required fields: sessionId, method'
      }, { status: 400 });
    }

    // Get session from shared storage
    const session = sharedSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({
        ok: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Check if session is already completed
    if (session.status === 'closed') {
      return NextResponse.json({
        ok: false,
        error: 'Session already completed'
      }, { status: 400 });
    }

    // Get feature flags
    const flags = featureFlags.getLoungeFlags(session.loungeId);

    // Calculate points earned (3% of total)
    const pointsEarned = Math.round(session.price.total * 0.03);

    // Process payment based on method
    let transactionId: string | undefined;
    let totalPaid = session.price.total;

    switch (method) {
      case 'card':
        // Mock card payment processing
        transactionId = `txn_${uuidv4()}`;
        break;
      case 'cash':
        // Cash payment - no transaction ID needed
        break;
      case 'points':
        // Points payment - check if guest has enough points
        const guestProfile = getGuestProfile(session.guestId);
        if (!guestProfile || guestProfile.points < session.price.total) {
          return NextResponse.json({
            ok: false,
            error: 'Insufficient points'
          }, { status: 400 });
        }
        // Deduct points
        guestProfile.points -= session.price.total;
        setGuestProfile(session.guestId, guestProfile);
        break;
      default:
        return NextResponse.json({
          ok: false,
          error: 'Invalid payment method'
        }, { status: 400 });
    }

    // Update session status to 'in_progress' after successful payment
    session.status = 'in_progress';
    session.ts.startedAt = new Date().toISOString();

    // Generate receipt
    const receiptId = `receipt_${uuidv4()}`;
    const receipt = {
      receiptId,
      sessionId,
      guestId: session.guestId,
      loungeId: session.loungeId,
      total: session.price.total,
      method,
      transactionId,
      timestamp: new Date().toISOString(),
      items: session.mix.flavors,
      promoCode
    };
    sharedReceipts.set(receiptId, receipt);

    // Update guest profile with points
    if (pointsEarned > 0) {
      const guestProfile = getGuestProfile(session.guestId);
      if (guestProfile) {
        guestProfile.points += pointsEarned;
        guestProfile.updatedAt = new Date().toISOString();
        setGuestProfile(session.guestId, guestProfile);

        // Create loyalty event
        const loyaltyEvent: LoyaltyEvent = {
          eventId: `event_${uuidv4()}`,
          guestId: session.guestId,
          loungeId: session.loungeId,
          type: 'EARN',
          value: pointsEarned,
          sessionId,
          description: `Earned ${pointsEarned} points for session`,
          ts: new Date().toISOString(),
          ghostHash: hashGuestEvent('loyalty.earn', session.guestId, session.loungeId, sessionId, {
            points: pointsEarned,
            total: session.price.total
          }).ghostHash
        };
        sharedLoyaltyEvents.set(loyaltyEvent.eventId, loyaltyEvent);
      }
    }

    // Check for badge awards
    if (flags.rewards.badges.v1) {
      await checkAndAwardBadges(session.guestId, session.loungeId, sessionId);
    }

    // Log checkout completion event
    if (flags.ghostlog.lite) {
      const eventPayload = {
        sessionId,
        guestId: session.guestId,
        total: session.price.total,
        method,
        pointsEarned,
        transactionId,
        timestamp: new Date().toISOString()
      };

      const ghostLogEntry = createGhostLogEntry(eventPayload);
      console.log('Checkout completed logged:', ghostLogEntry);
    }

    const response: CheckoutResponse = {
      receiptId,
      pointsEarned,
      totalPaid: session.price.total,
      transactionId
    };

    return NextResponse.json({
      ok: true,
      ...response
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Check and award badges based on guest activity
 */
async function checkAndAwardBadges(guestId: string, loungeId: string, sessionId: string): Promise<void> {
  const guestProfile = getGuestProfile(guestId);
  if (!guestProfile) return;

  const badges = guestProfile.badges || [];
  const sessions = guestProfile.sessions || [];
  const points = guestProfile.points || 0;

  // Regular badge: 3 sessions at same lounge
  if (!badges.includes('Regular') && sessions.length >= 3) {
    const recentSessions = sessions.slice(0, 3);
    const sameLoungeSessions = recentSessions.filter((s: string) => {
      const session = sharedSessions.get(s);
      return session && session.loungeId === loungeId;
    });
    
    if (sameLoungeSessions.length >= 3) {
      await awardBadge(guestId, loungeId, 'Regular', sessionId);
    }
  }

  // Mix Master badge: 5 unique mixes saved
  if (!badges.includes('MixMaster') && guestProfile.preferences?.savedMixes?.length >= 5) {
    await awardBadge(guestId, loungeId, 'MixMaster', sessionId);
  }

  // Loyalist badge: 8 sessions lifetime
  if (!badges.includes('Loyalist') && sessions.length >= 8) {
    await awardBadge(guestId, loungeId, 'Loyalist', sessionId);
  }

  // Explorer badge: 2 different lounges in 30 days
  if (!badges.includes('Explorer')) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.slice(0, 10).filter((s: string) => {
      const session = sharedSessions.get(s);
      return session && new Date(session.ts.startedAt) > thirtyDaysAgo;
    });
    
    const uniqueLounges = new Set(recentSessions.map((s: string) => {
      const session = sharedSessions.get(s);
      return session?.loungeId;
    }).filter(Boolean));
    
    if (uniqueLounges.size >= 2) {
      await awardBadge(guestId, loungeId, 'Explorer', sessionId);
    }
  }
}

/**
 * Award a badge to a guest
 */
async function awardBadge(guestId: string, loungeId: string, badgeId: string, sessionId: string): Promise<void> {
  const guestProfile = getGuestProfile(guestId);
  if (!guestProfile) return;

  // Add badge to profile
  if (!guestProfile.badges) {
    guestProfile.badges = [];
  }
  guestProfile.badges.push(badgeId);
  guestProfile.updatedAt = new Date().toISOString();
  setGuestProfile(guestId, guestProfile);

  // Create loyalty event
  const loyaltyEvent: LoyaltyEvent = {
    eventId: `event_${uuidv4()}`,
    guestId,
    loungeId,
    type: 'BADGE_AWARDED',
    value: 0,
    badgeId,
    sessionId,
    description: `Awarded ${badgeId} badge`,
    ts: new Date().toISOString(),
    ghostHash: hashGuestEvent('badge.awarded', guestId, loungeId, sessionId, {
      badgeId
    }).ghostHash
  };
    sharedLoyaltyEvents.set(loyaltyEvent.eventId, loyaltyEvent);

  console.log(`Badge awarded: ${badgeId} to guest ${guestId}`);
}
