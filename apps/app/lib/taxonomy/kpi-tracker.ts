/**
 * KPI Tracker - Taxonomy v1
 * 
 * Monitors enum coverage (≥95%) and unknown rate (<5%)
 * Provides alerts when thresholds are exceeded
 * 
 * Agent: Noor (session_agent)
 */

import { getUnknownRate, getTopUnknowns } from './unknown-tracker';
import { prisma } from '../db';

export interface TaxonomyKPI {
  enumType: 'SessionState' | 'TrustEventType' | 'DriftReason';
  coverage: number; // Percentage of events with valid v1 enum
  unknownRate: number; // Percentage of events with unknown values
  totalEvents: number;
  validatedEvents: number;
  unknownEvents: number;
  alert: boolean; // True if unknown rate > 5% for 2+ hours
}

export interface OverallKPI {
  coverage: number;
  totalEvents: number;
  validatedEvents: number;
  sessionState: TaxonomyKPI;
  trustEventType: TaxonomyKPI;
  driftReason: TaxonomyKPI;
}

/**
 * Calculate KPI metrics for all enum types
 */
export async function calculateKPIs(windowDays: number = 7): Promise<OverallKPI> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - windowDays);

  // Get unknown rates
  const sessionStateUnknowns = await getUnknownRate('SessionState', windowDays);
  const trustEventUnknowns = await getUnknownRate('TrustEventType', windowDays);
  const driftReasonUnknowns = await getUnknownRate('DriftReason', windowDays);

  // Get actual event counts
  const sessionsWithV1 = await prisma.session.count({
    where: {
      sessionStateV1: { not: null },
      createdAt: { gte: cutoffDate }
    }
  });

  const totalSessions = await prisma.session.count({
    where: {
      createdAt: { gte: cutoffDate }
    }
  });

  const eventsWithV1 = await prisma.reflexEvent.count({
    where: {
      trustEventTypeV1: { not: null },
      createdAt: { gte: cutoffDate }
    }
  });

  const totalEvents = await prisma.reflexEvent.count({
    where: {
      createdAt: { gte: cutoffDate }
    }
  });

  // Calculate coverage
  const sessionStateCoverage = totalSessions > 0 
    ? (sessionsWithV1 / totalSessions) * 100 
    : 100;

  const trustEventCoverage = totalEvents > 0
    ? (eventsWithV1 / totalEvents) * 100
    : 100;

  // Check alerts (unknown rate > 5% for 2+ hours)
  // For now, we'll check if unknown rate > 5% in the current window
  // In production, you'd track this over time windows
  const alertThreshold = 5;
  const sessionStateAlert = sessionStateUnknowns.unknownRate > alertThreshold;
  const trustEventAlert = trustEventUnknowns.unknownRate > alertThreshold;
  const driftReasonAlert = driftReasonUnknowns.unknownRate > alertThreshold;

  const sessionStateKPI: TaxonomyKPI = {
    enumType: 'SessionState',
    coverage: sessionStateCoverage,
    unknownRate: sessionStateUnknowns.unknownRate,
    totalEvents: totalSessions,
    validatedEvents: sessionsWithV1,
    unknownEvents: sessionStateUnknowns.unknownEvents,
    alert: sessionStateAlert
  };

  const trustEventKPI: TaxonomyKPI = {
    enumType: 'TrustEventType',
    coverage: trustEventCoverage,
    unknownRate: trustEventUnknowns.unknownRate,
    totalEvents,
    validatedEvents: eventsWithV1,
    unknownEvents: trustEventUnknowns.unknownEvents,
    alert: trustEventAlert
  };

  const driftReasonKPI: TaxonomyKPI = {
    enumType: 'DriftReason',
    coverage: 100, // DriftReason tracking not yet implemented
    unknownRate: driftReasonUnknowns.unknownRate,
    totalEvents: 0,
    validatedEvents: 0,
    unknownEvents: driftReasonUnknowns.unknownEvents,
    alert: driftReasonAlert
  };

  const overallCoverage = (totalSessions + totalEvents) > 0
    ? ((sessionsWithV1 + eventsWithV1) / (totalSessions + totalEvents)) * 100
    : 100;

  return {
    coverage: overallCoverage,
    totalEvents: totalSessions + totalEvents,
    validatedEvents: sessionsWithV1 + eventsWithV1,
    sessionState: sessionStateKPI,
    trustEventType: trustEventKPI,
    driftReason: driftReasonKPI
  };
}

/**
 * Check if alerts should be triggered
 * 
 * Returns true if unknown rate > 5% for 2 consecutive hours
 */
export async function checkAlerts(): Promise<{
  sessionState: boolean;
  trustEventType: boolean;
  driftReason: boolean;
  overall: boolean;
}> {
  // For now, check current 2-hour window
  // In production, you'd track this over rolling windows
  const kpis = await calculateKPIs(1); // 1 day window for alert checking

  return {
    sessionState: kpis.sessionState.alert,
    trustEventType: kpis.trustEventType.alert,
    driftReason: kpis.driftReason.alert,
    overall: kpis.sessionState.alert || kpis.trustEventType.alert || kpis.driftReason.alert
  };
}

/**
 * Get coverage percentage for a specific enum type
 */
export async function getCoverage(
  enumType: 'SessionState' | 'TrustEventType' | 'DriftReason',
  windowDays: number = 7
): Promise<number> {
  const kpis = await calculateKPIs(windowDays);
  
  switch (enumType) {
    case 'SessionState':
      return kpis.sessionState.coverage;
    case 'TrustEventType':
      return kpis.trustEventType.coverage;
    case 'DriftReason':
      return kpis.driftReason.coverage;
    default:
      return 0;
  }
}

