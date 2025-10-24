import { NextRequest, NextResponse } from 'next/server';
import { RewardsResponse, BadgeDefinition, LoyaltyEvent } from '../../../../../apps/guest/types/guest';
import { featureFlags } from './flags';
import { createGhostLogEntry } from './hash';

// Mock data stores
const guestProfiles = new Map<string, any>();
const loyaltyEvents = new Map<string, LoyaltyEvent>();

// Badge definitions
const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  'Regular': {
    badgeId: 'Regular',
    name: 'Regular',
    description: 'Visited the same lounge 3 times',
    icon: '🏆',
    category: 'loyalty',
    requirements: {
      type: 'sessions',
      count: 3,
      timeframe: 45
    },
    rewards: {
      points: 100,
      perks: ['Priority seating', 'Free add-ons']
    }
  },
  'Explorer': {
    badgeId: 'Explorer',
    name: 'Explorer',
    description: 'Visited 2 different lounges in 30 days',
    icon: '🗺️',
    category: 'exploration',
    requirements: {
      type: 'lounges',
      count: 2,
      timeframe: 30
    },
    rewards: {
      points: 200,
      perks: ['Cross-venue benefits', 'Exclusive flavors']
    }
  },
  'MixMaster': {
    badgeId: 'MixMaster',
    name: 'Mix Master',
    description: 'Saved 5 unique flavor combinations',
    icon: '🎨',
    category: 'achievement',
    requirements: {
      type: 'mixes',
      count: 5
    },
    rewards: {
      points: 150,
      perks: ['Custom mix creation', 'Flavor recommendations']
    }
  },
  'Loyalist': {
    badgeId: 'Loyalist',
    name: 'Loyalist',
    description: 'Completed 8 sessions lifetime',
    icon: '💎',
    category: 'loyalty',
    requirements: {
      type: 'sessions',
      count: 8
    },
    rewards: {
      points: 500,
      perks: ['VIP status', 'Exclusive events', 'Personal concierge']
    }
  }
};

/**
 * GET /api/guest/rewards
 * 
 * Gets rewards information for a guest
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');
    const loungeId = searchParams.get('loungeId');

    if (!guestId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing guestId parameter'
      }, { status: 400 });
    }

    // Get guest profile
    const guestProfile = guestProfiles.get(guestId);
    if (!guestProfile) {
      return NextResponse.json({
        ok: false,
        error: 'Guest not found'
      }, { status: 404 });
    }

    // Get feature flags
    const flags = loungeId ? featureFlags.getLoungeFlags(loungeId) : featureFlags.getLoungeFlags('default');

    // Check if rewards are enabled
    if (!flags.rewards.points && !flags.rewards.badges.v1) {
      return NextResponse.json({
        ok: false,
        error: 'Rewards are not enabled'
      }, { status: 403 });
    }

    const points = guestProfile.points || 0;
    const earnedBadges = guestProfile.badges || [];
    const sessions = guestProfile.sessions || [];

    // Get badge definitions for earned badges
    const badges = earnedBadges.map((badgeId: string) => BADGE_DEFINITIONS[badgeId]).filter(Boolean);

    // Calculate next badge
    const nextBadge = calculateNextBadge(guestProfile, earnedBadges);

    // Calculate level and progress
    const { level, progress } = calculateLevelAndProgress(points, sessions.length);

    // Log rewards view event
    if (flags.ghostlog.lite) {
      const eventPayload = {
        guestId,
        loungeId,
        points,
        badges: earnedBadges,
        level,
        timestamp: new Date().toISOString()
      };

      const ghostLogEntry = createGhostLogEntry({
        eventType: 'rewards.viewed',
        ...eventPayload
      });
      console.log('Rewards view logged:', ghostLogEntry);
    }

    const response: RewardsResponse = {
      points,
      badges,
      nextBadge,
      level,
      progress
    };

    return NextResponse.json({
      ok: true,
      ...response
    });

  } catch (error) {
    console.error('Get rewards error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Calculate the next badge a guest can earn
 */
function calculateNextBadge(guestProfile: any, earnedBadges: string[]): BadgeDefinition | undefined {
  const sessions = guestProfile.sessions || [];
  const savedMixes = guestProfile.preferences?.savedMixes || [];
  const points = guestProfile.points || 0;

  // Check each badge definition
  for (const [badgeId, definition] of Object.entries(BADGE_DEFINITIONS)) {
    if (earnedBadges.includes(badgeId)) {
      continue; // Already earned
    }

    const { requirements } = definition;
    let canEarn = false;

    switch (requirements.type) {
      case 'sessions':
        if (requirements.timeframe) {
          // Check sessions within timeframe
          const cutoffDate = new Date(Date.now() - requirements.timeframe * 24 * 60 * 60 * 1000);
          const recentSessions = sessions.filter((sessionId: string) => {
            const session = sessions.get(sessionId);
            return session && new Date(session.ts.startedAt) > cutoffDate;
          });
          canEarn = recentSessions.length >= requirements.count;
        } else {
          // Check total sessions
          canEarn = sessions.length >= requirements.count;
        }
        break;

      case 'lounges':
        if (requirements.timeframe) {
          const cutoffDate = new Date(Date.now() - requirements.timeframe * 24 * 60 * 60 * 1000);
          const recentSessions = sessions.filter((sessionId: string) => {
            const session = sessions.get(sessionId);
            return session && new Date(session.ts.startedAt) > cutoffDate;
          });
          const uniqueLounges = new Set(recentSessions.map((sessionId: string) => {
            const session = sessions.get(sessionId);
            return session?.loungeId;
          }).filter(Boolean));
          canEarn = uniqueLounges.size >= requirements.count;
        }
        break;

      case 'mixes':
        canEarn = savedMixes.length >= requirements.count;
        break;

      case 'points':
        canEarn = points >= requirements.count;
        break;
    }

    if (canEarn) {
      return definition;
    }
  }

  return undefined;
}

/**
 * Calculate guest level and progress
 */
function calculateLevelAndProgress(points: number, sessionCount: number): { level: string; progress: number } {
  // Level calculation based on points and sessions
  let level = 'Bronze';
  let progress = 0;

  if (points >= 2000 || sessionCount >= 15) {
    level = 'Platinum';
    progress = 100;
  } else if (points >= 1000 || sessionCount >= 10) {
    level = 'Gold';
    progress = Math.min(100, Math.round(((points - 1000) / 1000) * 100));
  } else if (points >= 500 || sessionCount >= 5) {
    level = 'Silver';
    progress = Math.min(100, Math.round(((points - 500) / 500) * 100));
  } else {
    level = 'Bronze';
    progress = Math.min(100, Math.round((points / 500) * 100));
  }

  return { level, progress };
}

/**
 * POST /api/guest/rewards
 * 
 * Redeem points for rewards
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestId, rewardType, value } = body;

    if (!guestId || !rewardType || !value) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required fields: guestId, rewardType, value'
      }, { status: 400 });
    }

    const guestProfile = guestProfiles.get(guestId);
    if (!guestProfile) {
      return NextResponse.json({
        ok: false,
        error: 'Guest not found'
      }, { status: 404 });
    }

    const currentPoints = guestProfile.points || 0;
    if (currentPoints < value) {
      return NextResponse.json({
        ok: false,
        error: 'Insufficient points'
      }, { status: 400 });
    }

    // Deduct points
    guestProfile.points -= value;
    guestProfile.updatedAt = new Date().toISOString();
    guestProfiles.set(guestId, guestProfile);

    // Create loyalty event
    const loyaltyEvent: LoyaltyEvent = {
      eventId: `event_${Date.now()}`,
      guestId,
      loungeId: guestProfile.lastLoungeId || 'unknown',
      type: 'REDEEM',
      value: -value,
      description: `Redeemed ${value} points for ${rewardType}`,
      ts: new Date().toISOString(),
      ghostHash: `hash_${Date.now()}`
    };
    loyaltyEvents.set(loyaltyEvent.eventId, loyaltyEvent);

    return NextResponse.json({
      ok: true,
      message: 'Points redeemed successfully',
      remainingPoints: guestProfile.points
    });

  } catch (error) {
    console.error('Redeem points error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
