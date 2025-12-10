import { prisma } from "@/lib/prisma";

const STREAK_WINDOW_DAYS = 30; // Consecutive visits within 30 days
const UNLOCK_3_VISITS = "3 visits unlock X";
const UNLOCK_5_VISITS = "5 visits unlock Y";

/**
 * Calculate visit streak for a customer
 */
export async function calculateStreak(customerId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: Date | null;
  nextVisitTarget: Date | null;
}> {
  // Get all completed sessions for this customer, ordered by end date
  const sessions = await prisma.session.findMany({
    where: {
      customerId,
      state: "CLOSED",
      endedAt: { not: null },
    },
    orderBy: { endedAt: "desc" },
  });

  if (sessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastVisitDate: null,
      nextVisitTarget: null,
    };
  }

  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const now = new Date();
  const windowMs = STREAK_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (!session.endedAt) continue;

    const sessionDate = new Date(session.endedAt);
    const daysSince = (now.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000);

    if (i === 0) {
      // Most recent session
      if (daysSince <= STREAK_WINDOW_DAYS) {
        currentStreak = 1;
        tempStreak = 1;
      }
    } else {
      // Check if this session is within the streak window of the previous session
      const prevSession = sessions[i - 1];
      if (prevSession.endedAt) {
        const prevDate = new Date(prevSession.endedAt);
        const daysBetween = (prevDate.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000);

        if (daysBetween <= STREAK_WINDOW_DAYS) {
          if (i === 1 && currentStreak > 0) {
            // Continue current streak
            currentStreak++;
          }
          tempStreak++;
        } else {
          // Streak broken
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
          if (i === 1) {
            currentStreak = 0; // Current streak is broken
          }
        }
      }
    }
  }

  // Update longest streak if current streak is longer
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  // Calculate next visit target (30 days from last visit to maintain streak)
  const lastVisit = sessions[0]?.endedAt;
  let nextVisitTarget: Date | null = null;
  if (lastVisit && currentStreak > 0) {
    const lastVisitDate = new Date(lastVisit);
    nextVisitTarget = new Date(lastVisitDate.getTime() + windowMs);
  }

  return {
    currentStreak,
    longestStreak,
    lastVisitDate: lastVisit ? new Date(lastVisit) : null,
    nextVisitTarget,
  };
}

/**
 * Get streak status with unlock information
 */
export async function getStreakStatus(customerId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: Date | null;
  nextVisitTarget: Date | null;
  unlocks: {
    threeVisits: { unlocked: boolean; progress: number };
    fiveVisits: { unlocked: boolean; progress: number };
  };
}> {
  const streak = await calculateStreak(customerId);

  // Check unlock status
  const threeVisitsUnlocked = streak.currentStreak >= 3;
  const fiveVisitsUnlocked = streak.currentStreak >= 5;

  return {
    ...streak,
    unlocks: {
      threeVisits: {
        unlocked: threeVisitsUnlocked,
        progress: Math.min(streak.currentStreak, 3),
      },
      fiveVisits: {
        unlocked: fiveVisitsUnlocked,
        progress: Math.min(streak.currentStreak, 5),
      },
    },
  };
}

/**
 * Check if streak qualifies for unlock
 */
export function checkStreakUnlocks(currentStreak: number): {
  threeVisits: boolean;
  fiveVisits: boolean;
  nextUnlock: string | null;
} {
  const threeVisits = currentStreak >= 3;
  const fiveVisits = currentStreak >= 5;

  let nextUnlock: string | null = null;
  if (!threeVisits) {
    nextUnlock = `${3 - currentStreak} more visits for ${UNLOCK_3_VISITS}`;
  } else if (!fiveVisits) {
    nextUnlock = `${5 - currentStreak} more visits for ${UNLOCK_5_VISITS}`;
  }

  return {
    threeVisits,
    fiveVisits,
    nextUnlock,
  };
}

