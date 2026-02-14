// apps/app/lib/trustScoring.ts

import { FireSession } from '../types/enhancedSession';

export interface TrustScoreFactors {
  sessionCompletionRate: number;    // 40% weight
  paymentSuccessRate: number;      // 30% weight
  staffSatisfactionAvg: number;    // 20% weight
  visitFrequencyConsistency: number; // 10% weight
}

export interface TrustScoreResult {
  score: number;
  factors: TrustScoreFactors;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  recommendations: string[];
}

/**
 * Calculates trust score based on session history and behavior patterns
 */
export function calculateTrustScore(sessions: FireSession[]): TrustScoreResult {
  if (!sessions || sessions.length === 0) {
    return {
      score: 50, // Default score for new customers
      factors: {
        sessionCompletionRate: 0,
        paymentSuccessRate: 0,
        staffSatisfactionAvg: 0,
        visitFrequencyConsistency: 0
      },
      tier: 'bronze',
      recommendations: ['Complete your first session to start building trust']
    };
  }

  // Calculate session completion rate (40% weight)
  const completedSessions = sessions.filter(s => 
    s.status === 'CLOSED' || s.status === 'ACTIVE'
  ).length;
  const sessionCompletionRate = (completedSessions / sessions.length) * 100;

  // Calculate payment success rate (30% weight)
  const paidSessions = sessions.filter(s => s.amount > 0).length;
  const paymentSuccessRate = (paidSessions / sessions.length) * 100;

  // Calculate staff satisfaction average (20% weight)
  // This would typically come from staff ratings, for now we'll use session duration as a proxy
  const avgSessionDuration = sessions.reduce((sum, s) => sum + s.sessionDuration, 0) / sessions.length;
  const staffSatisfactionAvg = Math.min(100, (avgSessionDuration / (60 * 60)) * 100); // Convert to percentage

  // Calculate visit frequency consistency (10% weight)
  const visitFrequencyConsistency = calculateVisitFrequencyConsistency(sessions);

  // Calculate weighted score
  const score = Math.round(
    (sessionCompletionRate * 0.4) +
    (paymentSuccessRate * 0.3) +
    (staffSatisfactionAvg * 0.2) +
    (visitFrequencyConsistency * 0.1)
  );

  const factors: TrustScoreFactors = {
    sessionCompletionRate,
    paymentSuccessRate,
    staffSatisfactionAvg,
    visitFrequencyConsistency
  };

  const tier = determineLoyaltyTier(score);
  const recommendations = generateRecommendations(factors, tier);

  return {
    score: Math.min(100, Math.max(0, score)),
    factors,
    tier,
    recommendations
  };
}

/**
 * Calculates visit frequency consistency based on session timestamps
 */
function calculateVisitFrequencyConsistency(sessions: FireSession[]): number {
  if (sessions.length < 2) return 50; // Default for single session

  // Sort sessions by creation time
  const sortedSessions = [...sessions].sort((a, b) => a.createdAt - b.createdAt);
  
  // Calculate intervals between visits
  const intervals: number[] = [];
  for (let i = 1; i < sortedSessions.length; i++) {
    const interval = sortedSessions[i].createdAt - sortedSessions[i - 1].createdAt;
    intervals.push(interval);
  }

  if (intervals.length === 0) return 50;

  // Calculate average interval
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  
  // Calculate consistency (lower variance = higher consistency)
  const variance = intervals.reduce((sum, interval) => {
    return sum + Math.pow(interval - avgInterval, 2);
  }, 0) / intervals.length;

  const standardDeviation = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - (standardDeviation / avgInterval) * 100);

  return Math.min(100, consistency);
}

/**
 * Determines loyalty tier based on trust score
 */
function determineLoyaltyTier(score: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (score >= 90) return 'platinum';
  if (score >= 75) return 'gold';
  if (score >= 60) return 'silver';
  return 'bronze';
}

/**
 * Generates recommendations based on trust factors and tier
 */
function generateRecommendations(factors: TrustScoreFactors, tier: string): string[] {
  const recommendations: string[] = [];

  if (factors.sessionCompletionRate < 80) {
    recommendations.push('Complete more sessions to improve your completion rate');
  }

  if (factors.paymentSuccessRate < 90) {
    recommendations.push('Ensure payment information is up to date');
  }

  if (factors.staffSatisfactionAvg < 70) {
    recommendations.push('Consider extending session duration for better experience');
  }

  if (factors.visitFrequencyConsistency < 60) {
    recommendations.push('Visit more regularly to build consistency');
  }

  // Tier-specific recommendations
  switch (tier) {
    case 'bronze':
      recommendations.push('Complete your first few sessions to unlock silver tier');
      break;
    case 'silver':
      recommendations.push('Maintain consistent visits to reach gold tier');
      break;
    case 'gold':
      recommendations.push('You\'re on track for platinum tier!');
      break;
    case 'platinum':
      recommendations.push('You\'re a VIP customer! Enjoy premium benefits');
      break;
  }

  return recommendations;
}

/**
 * Calculates trust score for a single session (for new customers)
 */
export function calculateSingleSessionTrustScore(session: FireSession): number {
  let score = 50; // Base score

  // Payment success bonus
  if (session.amount > 0) {
    score += 15;
  }

  // Workflow progress bonuses (incremental as session progresses)
  if (session.status === 'PAID_CONFIRMED') {
    score += 5; // Payment confirmed
  } else if (session.status === 'PREP_IN_PROGRESS') {
    score += 10; // BOH claimed prep
  } else if (session.status === 'HEAT_UP') {
    score += 15; // Coals heating
  } else if (session.status === 'READY_FOR_DELIVERY') {
    score += 20; // Ready for delivery
  } else if (session.status === 'OUT_FOR_DELIVERY') {
    score += 25; // Out for delivery
  } else if (session.status === 'DELIVERED') {
    score += 30; // Delivered to table
  } else if (session.status === 'ACTIVE') {
    score += 35; // Session active
  } else if (session.status === 'CLOSED') {
    score += 40; // Session completed
  }

  // Staff assignment bonuses (incremental)
  if (session.assignedStaff?.boh) {
    score += 3; // BOH assigned
  }
  if (session.assignedStaff?.foh) {
    score += 2; // FOH assigned
  }

  // Session duration bonus
  if (session.sessionDuration > 30 * 60) { // 30 minutes
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

/**
 * Gets the appropriate color class for loyalty tier display
 */
export function getLoyaltyTierColor(tier: string): string {
  switch (tier) {
    case 'platinum': return 'text-purple-400';
    case 'gold': return 'text-yellow-400';
    case 'silver': return 'text-gray-400';
    case 'bronze': return 'text-orange-400';
    default: return 'text-gray-400';
  }
}

/**
 * Gets the appropriate icon for loyalty tier display
 */
export function getLoyaltyTierIcon(tier: string): string {
  switch (tier) {
    case 'platinum': return '👑';
    case 'gold': return '🥇';
    case 'silver': return '🥈';
    case 'bronze': return '🥉';
    default: return '⭐';
  }
}
