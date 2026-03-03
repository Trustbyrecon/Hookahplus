// apps/site/lib/trustScoring.ts

import { FireSession } from '../types/enhancedSession';

/**
 * Calculates trust score for a single session (for new customers)
 */
export function calculateSingleSessionTrustScore(session: FireSession): number {
  let score = 50; // Base score

  // Session completion bonus
  if (session.status === 'CLOSED' || session.status === 'ACTIVE') {
    score += 20;
  }

  // Payment success bonus
  if (session.amount > 0) {
    score += 15;
  }

  // Session duration bonus
  if (session.sessionDuration > 30 * 60) { // 30 minutes
    score += 10;
  }

  // Staff assignment bonus
  if (session.assignedStaff?.boh && session.assignedStaff?.foh) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Gets the appropriate color class for trust score display
 */
export function getTrustScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

