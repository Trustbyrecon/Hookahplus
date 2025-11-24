import { prisma } from './db';

export interface PulseData {
  summary: string;
  metrics: {
    sessions: number;
    revenue: number;
    avgDuration: number;
    edgeCases: number;
  };
  topFlavors: Array<{ name: string; count: number }>;
  recommendations: string[];
  timestamp: string;
  window: '24h' | '12h';
}

interface SessionMetrics {
  totalSessions: number;
  totalRevenue: number;
  avgDuration: number;
  edgeCaseCount: number;
  flavorCounts: Record<string, number>;
  edgeCaseTypes: Record<string, number>;
}

/**
 * Generate daily pulse briefing from session data
 */
export async function generateDailyPulse(
  window: '24h' | 'pm' = '24h',
  loungeId?: string
): Promise<PulseData> {
  // Calculate time window
  const now = new Date();
  const windowHours = window === 'pm' ? 12 : 24;
  const startTime = new Date(now.getTime() - windowHours * 60 * 60 * 1000);

  // Try to query sessions from database, fallback to demo data on error
  let sessions;
  try {
    sessions = await prisma.session.findMany({
    where: {
      ...(loungeId && { loungeId }),
      createdAt: {
        gte: startTime,
        lte: now,
      },
    },
    select: {
      id: true,
      priceCents: true,
      durationSecs: true,
      flavor: true,
      flavorMix: true,
      edgeCase: true,
      state: true,
      createdAt: true,
      startedAt: true,
      endedAt: true,
    },
  });
  } catch (dbError) {
    // Database connection failed - use demo data
    console.warn('[Pulse Generator] Database unavailable, using demo data:', dbError instanceof Error ? dbError.message : 'Unknown error');
    const USE_DEMO_MODE = process.env.NEXT_PUBLIC_USE_DEMO_MODE === 'true';
    const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
    
    if (USE_DEMO_MODE && IS_DEVELOPMENT) {
      return generateDemoPulse(window);
    } else {
      // Production: return empty pulse
      return {
        summary: `No data available for ${window === 'pm' ? '12-hour' : '24-hour'} period`,
        metrics: { sessions: 0, revenue: 0, avgDuration: 0, edgeCases: 0 },
        topFlavors: [],
        recommendations: ['Database connection unavailable - please check configuration'],
        timestamp: now.toISOString(),
        window: window === 'pm' ? '12h' : '24h',
      };
    }
  }

  // Calculate metrics
  const metrics = calculateSessionMetrics(sessions);

  // Generate insights
  const summary = generateSummary(metrics, window);
  const recommendations = generateRecommendations(metrics, sessions);

  // Get top flavors
  const topFlavors = Object.entries(metrics.flavorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  return {
    summary,
    metrics: {
      sessions: metrics.totalSessions,
      revenue: metrics.totalRevenue / 100, // Convert cents to dollars
      avgDuration: metrics.avgDuration,
      edgeCases: metrics.edgeCaseCount,
    },
    topFlavors,
    recommendations,
    timestamp: now.toISOString(),
    window: window === 'pm' ? '12h' : '24h',
  };
}

/**
 * Calculate metrics from session data
 */
function calculateSessionMetrics(sessions: any[]): SessionMetrics {
  const totalSessions = sessions.length;
  
  // Calculate revenue (sum of priceCents)
  const totalRevenue = sessions.reduce((sum, s) => sum + (s.priceCents || 0), 0);

  // Calculate average duration
  const sessionsWithDuration = sessions.filter(s => s.durationSecs);
  const avgDuration = sessionsWithDuration.length > 0
    ? sessionsWithDuration.reduce((sum, s) => sum + (s.durationSecs || 0), 0) / sessionsWithDuration.length / 60 // Convert to minutes
    : 0;

  // Count edge cases
  const edgeCaseCount = sessions.filter(s => s.edgeCase).length;
  const edgeCaseTypes: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.edgeCase) {
      edgeCaseTypes[s.edgeCase] = (edgeCaseTypes[s.edgeCase] || 0) + 1;
    }
  });

  // Count flavors
  const flavorCounts: Record<string, number> = {};
  sessions.forEach(s => {
    const flavor = s.flavor || s.flavorMix || 'Unknown';
    // Handle JSON string flavorMix
    let flavorName = flavor;
    if (typeof flavor === 'string' && flavor.startsWith('[')) {
      try {
        const parsed = JSON.parse(flavor);
        flavorName = Array.isArray(parsed) ? parsed.join(' + ') : flavor;
      } catch {
        flavorName = flavor;
      }
    }
    flavorCounts[flavorName] = (flavorCounts[flavorName] || 0) + 1;
  });

  return {
    totalSessions,
    totalRevenue,
    avgDuration,
    edgeCaseCount,
    flavorCounts,
    edgeCaseTypes,
  };
}

/**
 * Generate summary text from metrics
 */
function generateSummary(metrics: SessionMetrics, window: '24h' | 'pm'): string {
  const parts: string[] = [];
  const windowLabel = window === 'pm' ? '12-hour' : '24-hour';

  // Revenue insights
  if (metrics.totalRevenue >= 100000) { // $1000+
    parts.push(`Strong revenue day: $${(metrics.totalRevenue / 100).toFixed(2)}`);
  } else if (metrics.totalRevenue >= 50000) { // $500+
    parts.push(`Solid revenue: $${(metrics.totalRevenue / 100).toFixed(2)}`);
  } else if (metrics.totalRevenue > 0) {
    parts.push(`Revenue: $${(metrics.totalRevenue / 100).toFixed(2)} (below target)`);
  }

  // Session volume
  if (metrics.totalSessions > 20) {
    parts.push(`High session volume: ${metrics.totalSessions} sessions`);
  } else if (metrics.totalSessions > 10) {
    parts.push(`${metrics.totalSessions} sessions completed`);
  } else if (metrics.totalSessions > 0) {
    parts.push(`Slow day: ${metrics.totalSessions} sessions`);
  } else {
    parts.push(`No sessions in ${windowLabel} period`);
  }

  // Duration patterns
  if (metrics.avgDuration > 90) {
    parts.push(`Longer sessions (${metrics.avgDuration.toFixed(0)}min avg) - consider upsell opportunities`);
  } else if (metrics.avgDuration > 60 && metrics.avgDuration <= 90) {
    parts.push(`Average session duration: ${metrics.avgDuration.toFixed(0)} minutes`);
  } else if (metrics.avgDuration > 0 && metrics.avgDuration < 60) {
    parts.push(`Quick turnover (${metrics.avgDuration.toFixed(0)}min avg) - efficient operations`);
  }

  // Edge case alerts
  if (metrics.edgeCaseCount > 3) {
    parts.push(`⚠️ Multiple edge cases (${metrics.edgeCaseCount}) - review operations`);
  } else if (metrics.edgeCaseCount > 0) {
    parts.push(`${metrics.edgeCaseCount} edge case${metrics.edgeCaseCount > 1 ? 's' : ''} recorded`);
  }

  return parts.length > 0 ? parts.join(' • ') : `No activity in ${windowLabel} period`;
}

/**
 * Generate recommendations based on metrics
 */
function generateRecommendations(metrics: SessionMetrics, sessions: any[]): string[] {
  const recommendations: string[] = [];

  // Revenue recommendations
  if (metrics.totalRevenue < 50000 && metrics.totalSessions > 0) {
    recommendations.push('Consider upselling premium flavors or session extensions to boost revenue');
  }

  // Session volume recommendations
  if (metrics.totalSessions > 20) {
    recommendations.push('High traffic day - ensure adequate staff coverage for peak hours');
  } else if (metrics.totalSessions < 10 && metrics.totalSessions > 0) {
    recommendations.push('Lower session volume - focus on customer experience and retention');
  }

  // Duration recommendations
  if (metrics.avgDuration > 90) {
    recommendations.push('Longer sessions detected - consider offering time extensions or premium upgrades');
  } else if (metrics.avgDuration < 60 && metrics.avgDuration > 0) {
    recommendations.push('Quick turnover - optimize table preparation for faster service');
  }

  // Edge case recommendations
  if (metrics.edgeCaseCount > 3) {
    const topEdgeCase = Object.entries(metrics.edgeCaseTypes)
      .sort(([, a], [, b]) => b - a)[0];
    if (topEdgeCase) {
      recommendations.push(`Review ${topEdgeCase[0]} process - ${topEdgeCase[1]} occurrence${topEdgeCase[1] > 1 ? 's' : ''} today`);
    }
  }

  // Flavor recommendations
  const topFlavor = Object.entries(metrics.flavorCounts)
    .sort(([, a], [, b]) => b - a)[0];
  if (topFlavor && topFlavor[1] > 5) {
    recommendations.push(`"${topFlavor[0]}" is trending - ensure adequate stock`);
  }

  // Default recommendation if none generated
  if (recommendations.length === 0 && metrics.totalSessions > 0) {
    recommendations.push('Operations running smoothly - maintain current service levels');
  }

  return recommendations;
}

/**
 * Generate demo pulse data when database is unavailable or in demo mode
 */
export function generateDemoPulse(window: '24h' | 'pm' = '24h'): PulseData {
  const now = new Date();
  const windowLabel = window === 'pm' ? '12-hour' : '24-hour';
  
  // Generate realistic demo metrics for Night After Night trial
  const sessions = 12; // Fixed for consistent demo experience
  const revenue = 387.50; // Realistic revenue for demo
  const avgDuration = 58; // Average session duration
  
  const flavors = [
    { name: 'Blue Mist', count: 5 },
    { name: 'Mint Fresh', count: 4 },
    { name: 'Double Apple', count: 3 }
  ];
  
  const recommendations = [
    'Operations running smoothly - maintain current service levels',
    'Blue Mist is trending - ensure adequate stock for peak hours',
    'Consider upselling session extensions - customers staying longer'
  ];
  
  return {
    summary: `Strong ${windowLabel} performance: ${sessions} sessions completed • Revenue: $${revenue.toFixed(2)} • Average duration: ${avgDuration} minutes • Smooth operations with minimal edge cases`,
    metrics: {
      sessions,
      revenue,
      avgDuration,
      edgeCases: 1, // Minimal edge cases for positive demo
    },
    topFlavors: flavors,
    recommendations,
    timestamp: now.toISOString(),
    window: window === 'pm' ? '12h' : '24h',
  };
}

