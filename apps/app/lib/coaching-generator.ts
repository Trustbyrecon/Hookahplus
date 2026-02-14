import { prisma } from './db';

export interface CoachingData {
  role: 'prep' | 'foh' | 'runner';
  bullets: Array<{ type: 'highlight' | 'improvement' | 'tip'; text: string }>;
  performanceScore: number;
  timestamp: string;
}

interface StaffPerformanceMetrics {
  totalSessions: number;
  completedSessions: number;
  avgPrepTime: number; // minutes
  avgDeliveryTime: number; // minutes
  edgeCaseCount: number;
  edgeCaseTypes: Record<string, number>;
  missedHandoffs: number;
  longDwells: number; // sessions with duration > 90min
  refillRequests: number;
}

/**
 * Generate coaching tips for staff member or role
 */
export async function generateCoachingTips(
  role: 'prep' | 'foh' | 'runner',
  staffId?: string,
  loungeId?: string
): Promise<CoachingData> {
  // Calculate time window (last 7 days)
  const now = new Date();
  const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Build query based on role and staffId
  const whereClause: any = {
    createdAt: {
      gte: startTime,
      lte: now,
    },
    ...(loungeId && { loungeId }),
  };

  // Filter by staff assignment based on role
  if (staffId) {
    if (role === 'prep') {
      whereClause.assignedBOHId = staffId;
    } else if (role === 'foh' || role === 'runner') {
      whereClause.assignedFOHId = staffId;
    }
  } else {
    // If no staffId, filter by role pattern (this is approximate)
    if (role === 'prep') {
      whereClause.assignedBOHId = { not: null };
    } else {
      whereClause.assignedFOHId = { not: null };
    }
  }

  // Query sessions
  const sessions = await prisma.session.findMany({
    where: whereClause,
    select: {
      id: true,
      state: true,
      assignedBOHId: true,
      assignedFOHId: true,
      startedAt: true,
      endedAt: true,
      durationSecs: true,
      edgeCase: true,
      edgeNote: true,
      tableNotes: true,
      createdAt: true,
    },
  });

  // Filter sessions to only those assigned to the specific staff member if provided
  const relevantSessions = staffId
    ? sessions.filter(s => 
        (role === 'prep' && s.assignedBOHId === staffId) ||
        ((role === 'foh' || role === 'runner') && s.assignedFOHId === staffId)
      )
    : sessions;

  // Calculate performance metrics
  const metrics = calculateStaffMetrics(relevantSessions, role);

  // Generate coaching bullets
  const bullets = generateCoachingBullets(metrics, role);

  // Calculate performance score (0-100)
  const performanceScore = calculatePerformanceScore(metrics, role);

  return {
    role,
    bullets,
    performanceScore,
    timestamp: now.toISOString(),
  };
}

/**
 * Calculate staff performance metrics
 */
function calculateStaffMetrics(sessions: any[], role: string): StaffPerformanceMetrics {
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.state === 'COMPLETED').length;

  // Calculate prep time (time from creation to ACTIVE state)
  const prepSessions = sessions.filter(s => s.startedAt && s.createdAt);
  const prepTimes = prepSessions.map(s => {
    const prepTime = (new Date(s.startedAt!).getTime() - new Date(s.createdAt).getTime()) / (1000 * 60); // minutes
    return prepTime;
  });
  const avgPrepTime = prepTimes.length > 0
    ? prepTimes.reduce((sum, t) => sum + t, 0) / prepTimes.length
    : 0;

  // Calculate delivery time (time from ACTIVE to COMPLETED)
  const deliverySessions = sessions.filter(s => s.startedAt && s.endedAt && s.state === 'COMPLETED');
  const deliveryTimes = deliverySessions.map(s => {
    const deliveryTime = (new Date(s.endedAt!).getTime() - new Date(s.startedAt!).getTime()) / (1000 * 60); // minutes
    return deliveryTime;
  });
  const avgDeliveryTime = deliveryTimes.length > 0
    ? deliveryTimes.reduce((sum, t) => sum + t, 0) / deliveryTimes.length
    : 0;

  // Count edge cases
  const edgeCaseCount = sessions.filter(s => s.edgeCase).length;
  const edgeCaseTypes: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.edgeCase) {
      edgeCaseTypes[s.edgeCase] = (edgeCaseTypes[s.edgeCase] || 0) + 1;
    }
  });

  // Count missed handoffs (sessions with long prep time > 15min)
  const missedHandoffs = prepTimes.filter(t => t > 15).length;

  // Count long dwells (sessions > 90 minutes)
  const longDwells = sessions.filter(s => {
    if (!s.durationSecs) return false;
    return s.durationSecs / 60 > 90;
  }).length;

  // Count refill requests (from tableNotes or edgeNote)
  const refillRequests = sessions.filter(s => {
    const notes = (s.tableNotes || s.edgeNote || '').toLowerCase();
    return notes.includes('refill') || notes.includes('coal');
  }).length;

  return {
    totalSessions,
    completedSessions,
    avgPrepTime,
    avgDeliveryTime,
    edgeCaseCount,
    edgeCaseTypes,
    missedHandoffs,
    longDwells,
    refillRequests,
  };
}

/**
 * Generate coaching bullets based on metrics and role
 */
function generateCoachingBullets(metrics: StaffPerformanceMetrics, role: string): Array<{ type: 'highlight' | 'improvement' | 'tip'; text: string }> {
  const bullets: Array<{ type: 'highlight' | 'improvement' | 'tip'; text: string }> = [];

  if (role === 'prep') {
    // BOH/Prep coaching
    if (metrics.avgPrepTime <= 8) {
      bullets.push({
        type: 'highlight',
        text: `Excellent prep time: ${metrics.avgPrepTime.toFixed(1)}min average (target: 8min)`,
      });
    } else if (metrics.avgPrepTime > 10) {
      bullets.push({
        type: 'improvement',
        text: `Prep time averaging ${metrics.avgPrepTime.toFixed(1)}min (target: 8min) - consider batch prep for efficiency`,
      });
    }

    if (metrics.completedSessions > 0) {
      const completionRate = (metrics.completedSessions / metrics.totalSessions) * 100;
      if (completionRate >= 95) {
        bullets.push({
          type: 'highlight',
          text: `Strong completion rate: ${completionRate.toFixed(0)}% of sessions completed successfully`,
        });
      }
    }

    if (metrics.edgeCaseCount > 2) {
      const topIssue = Object.entries(metrics.edgeCaseTypes)
        .sort(([, a], [, b]) => b - a)[0];
      if (topIssue) {
        bullets.push({
          type: 'improvement',
          text: `${topIssue[0]} occurred ${topIssue[1]} time${topIssue[1] > 1 ? 's' : ''} - review process and equipment`,
        });
      }
    }

    if (metrics.missedHandoffs > 0) {
      bullets.push({
        type: 'tip',
        text: `${metrics.missedHandoffs} session${metrics.missedHandoffs > 1 ? 's' : ''} with delayed handoff - coordinate with FOH for smoother transitions`,
      });
    }

    if (bullets.length === 0) {
      bullets.push({
        type: 'highlight',
        text: 'Consistent performance - keep up the great work!',
      });
    }
  } else if (role === 'foh') {
    // FOH/Service coaching
    if (metrics.avgDeliveryTime <= 5 && metrics.avgDeliveryTime > 0) {
      bullets.push({
        type: 'highlight',
        text: `Fast delivery time: ${metrics.avgDeliveryTime.toFixed(1)}min average - excellent service speed`,
      });
    } else if (metrics.avgDeliveryTime > 5) {
      bullets.push({
        type: 'improvement',
        text: `Delivery time averaging ${metrics.avgDeliveryTime.toFixed(1)}min - optimize routing paths for faster service`,
      });
    }

    if (metrics.refillRequests > 0) {
      bullets.push({
        type: 'tip',
        text: `${metrics.refillRequests} refill request${metrics.refillRequests > 1 ? 's' : ''} handled - proactive refill checks improve customer satisfaction`,
      });
    }

    if (metrics.longDwells > 0) {
      bullets.push({
        type: 'tip',
        text: `${metrics.longDwells} extended session${metrics.longDwells > 1 ? 's' : ''} - consider offering time extensions or premium upgrades`,
      });
    }

    if (metrics.completedSessions > 10) {
      bullets.push({
        type: 'highlight',
        text: `Handled ${metrics.completedSessions} session${metrics.completedSessions > 1 ? 's' : ''} this week - strong performance`,
      });
    }

    if (metrics.edgeCaseCount > 2) {
      bullets.push({
        type: 'improvement',
        text: `${metrics.edgeCaseCount} edge case${metrics.edgeCaseCount > 1 ? 's' : ''} recorded - review customer interaction protocols`,
      });
    }

    if (bullets.length === 0) {
      bullets.push({
        type: 'highlight',
        text: 'Maintaining high service standards - continue excellent work!',
      });
    }
  } else if (role === 'runner') {
    // Runner coaching (similar to FOH but focus on handoffs and communication)
    if (metrics.missedHandoffs === 0 && metrics.totalSessions > 0) {
      bullets.push({
        type: 'highlight',
        text: 'Perfect handoff record - all sessions transitioned smoothly',
      });
    } else if (metrics.missedHandoffs > 0) {
      bullets.push({
        type: 'improvement',
        text: `${metrics.missedHandoffs} missed handoff${metrics.missedHandoffs > 1 ? 's' : ''} - improve communication protocol with prep team`,
      });
    }

    if (metrics.avgDeliveryTime <= 3 && metrics.avgDeliveryTime > 0) {
      bullets.push({
        type: 'highlight',
        text: `Quick table turnover: ${metrics.avgDeliveryTime.toFixed(1)}min average delivery time`,
      });
    }

    if (metrics.refillRequests > 0) {
      bullets.push({
        type: 'tip',
        text: `Monitor ${metrics.refillRequests} active session${metrics.refillRequests > 1 ? 's' : ''} for refill opportunities - proactive service increases revenue`,
      });
    }

    if (metrics.completedSessions > 15) {
      bullets.push({
        type: 'highlight',
        text: `Managed ${metrics.completedSessions} session${metrics.completedSessions > 1 ? 's' : ''} this week - excellent coordination`,
      });
    }

    if (bullets.length === 0) {
      bullets.push({
        type: 'highlight',
        text: 'Efficient coordination - keep maintaining smooth operations!',
      });
    }
  }

  // Ensure we have at least 3 bullets, max 5
  while (bullets.length < 3) {
    bullets.push({
      type: 'tip',
      text: 'Continue following standard operating procedures for consistent results',
    });
  }

  return bullets.slice(0, 5);
}

/**
 * Calculate performance score (0-100)
 */
function calculatePerformanceScore(metrics: StaffPerformanceMetrics, role: string): number {
  let score = 100;

  // Deduct points for issues
  if (role === 'prep') {
    // Prep time penalty
    if (metrics.avgPrepTime > 10) {
      score -= Math.min(20, (metrics.avgPrepTime - 10) * 2);
    }
    // Edge case penalty
    score -= metrics.edgeCaseCount * 5;
    // Missed handoff penalty
    score -= metrics.missedHandoffs * 3;
  } else if (role === 'foh') {
    // Delivery time penalty
    if (metrics.avgDeliveryTime > 5) {
      score -= Math.min(15, (metrics.avgDeliveryTime - 5) * 2);
    }
    // Edge case penalty
    score -= metrics.edgeCaseCount * 5;
  } else if (role === 'runner') {
    // Missed handoff penalty
    score -= metrics.missedHandoffs * 5;
    // Edge case penalty
    score -= metrics.edgeCaseCount * 3;
  }

  // Bonus for high completion rate
  if (metrics.totalSessions > 0) {
    const completionRate = (metrics.completedSessions / metrics.totalSessions) * 100;
    if (completionRate >= 95) {
      score += 5;
    }
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

