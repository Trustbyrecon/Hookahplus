/**
 * EP Gates Framework
 * 
 * Agent: EchoPrime (Sentinel)
 * Mission: Enforce EP trust gates and guardrails
 * 
 * EP Gates:
 * - EP.POS.Ready: pos_sync_ready == true before QR-only changes
 * - EP.REM.Coverage: ≥95% coverage for order.*, payment.settled, loyalty.*, session.*
 * - EP.Drift.Alert: Reflex uplift WoW < -20% triggers alert
 */

import { isPosSyncReady, canModifyQROnly, validateREMCoverage, shouldTriggerDriftAlert } from '../config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EPGateResult {
  gateId: string;
  passed: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface EPGateRunnerResult {
  allPassed: boolean;
  gates: EPGateResult[];
  failedGates: string[];
}

/**
 * EP.POS.Ready Gate
 * 
 * Rule: pos_sync_ready == true
 * Fail on: qr_only_change == true when POS not ready
 */
export async function checkPosReady(
  changedFiles: string[] = []
): Promise<EPGateResult> {
  const posReady = isPosSyncReady();

  // Check for QR-only changes
  const qrOnlyChanges = changedFiles.filter((file) => {
    return file.includes('/qr/') || 
           file.includes('qr') || 
           file.includes('QR');
  });

  const hasQROnlyChanges = qrOnlyChanges.length > 0 && changedFiles.length === qrOnlyChanges.length;

  if (hasQROnlyChanges && !posReady) {
    return {
      gateId: 'EP.POS.Ready',
      passed: false,
      message: 'QR-only changes blocked: POS_SYNC_READY is false',
      details: {
        posSyncReady: posReady,
        qrOnlyChanges: qrOnlyChanges,
        guardrail: 'G1',
      },
    };
  }

  return {
    gateId: 'EP.POS.Ready',
    passed: true,
    message: posReady 
      ? 'POS sync ready - QR changes allowed' 
      : 'No QR-only changes detected',
    details: {
      posSyncReady: posReady,
      qrOnlyChanges: qrOnlyChanges.length,
    },
  };
}

/**
 * EP.REM.Coverage Gate
 * 
 * Rule: coverage(order.*, payment.settled, loyalty.*, session.*) >= 0.95
 */
export async function checkREMCoverage(): Promise<EPGateResult> {
  // Get all ReflexEvent records from last 24 hours
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const allEvents = await prisma.reflexEvent.findMany({
    where: {
      createdAt: {
        gte: last24Hours,
      },
    },
  });

  // Categorize events
  const eventTypes = {
    order: ['order.created', 'order.completed', 'order.cancelled'],
    payment: ['payment.settled', 'payment.refunded', 'payment.failed'],
    loyalty: ['loyalty.issued', 'loyalty.redeemed', 'loyalty.expired'],
    session: ['session.started', 'session.completed', 'session.cancelled', 'session.extended'],
  };

  const categorized = {
    order: allEvents.filter((e) => 
      eventTypes.order.some((type) => e.type.startsWith(type.split('.')[0]))
    ),
    payment: allEvents.filter((e) => 
      eventTypes.payment.some((type) => e.type.startsWith(type.split('.')[0]))
    ),
    loyalty: allEvents.filter((e) => 
      eventTypes.loyalty.some((type) => e.type.startsWith(type.split('.')[0]))
    ),
    session: allEvents.filter((e) => 
      eventTypes.session.some((type) => e.type.startsWith(type.split('.')[0]))
    ),
  };

  // Check REM compliance (must have actor.anon_hash and effect.loyalty_delta in payload)
  const remCompliant = allEvents.filter((event) => {
    if (!event.payload) return false;
    try {
      const payload = JSON.parse(event.payload);
      return payload.actor?.anon_hash && payload.effect?.loyalty_delta !== undefined;
    } catch {
      return false;
    }
  });

  const coverage = allEvents.length > 0 ? remCompliant.length / allEvents.length : 1.0;

  const passed = validateREMCoverage(coverage);

  return {
    gateId: 'EP.REM.Coverage',
    passed,
    message: passed
      ? `REM coverage ${(coverage * 100).toFixed(2)}% meets target (≥95%)`
      : `REM coverage ${(coverage * 100).toFixed(2)}% below target (≥95%)`,
    details: {
      coverage,
      totalEvents: allEvents.length,
      remCompliant: remCompliant.length,
      categorized: {
        order: categorized.order.length,
        payment: categorized.payment.length,
        loyalty: categorized.loyalty.length,
        session: categorized.session.length,
      },
    },
  };
}

/**
 * EP.Drift.Alert Gate
 * 
 * Rule: reflex_uplift_wow < -0.20
 * Fail on: Weekly Reflex uplift dips >20%
 */
export async function checkDriftAlert(): Promise<EPGateResult> {
  // Calculate Reflex score for current week vs last week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week
  weekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(weekStart);

  // Get events for current week and last week
  const currentWeekEvents = await prisma.reflexEvent.findMany({
    where: {
      createdAt: {
        gte: weekStart,
      },
    },
  });

  const lastWeekEvents = await prisma.reflexEvent.findMany({
    where: {
      createdAt: {
        gte: lastWeekStart,
        lt: weekStart,
      },
    },
  });

  // Calculate average Reflex score (simplified - would use actual Reflex scoring logic)
  const calculateAvgScore = (events: typeof currentWeekEvents) => {
    if (events.length === 0) return 0;
    let totalScore = 0;
    let count = 0;
    
    for (const event of events) {
      if (event.payload) {
        try {
          const payload = JSON.parse(event.payload);
          if (payload.effect?.reflex_delta !== undefined) {
            totalScore += payload.effect.reflex_delta;
            count++;
          }
        } catch {
          // Skip invalid payloads
        }
      }
    }
    
    return count > 0 ? totalScore / count : 0;
  };

  const currentWeekScore = calculateAvgScore(currentWeekEvents);
  const lastWeekScore = calculateAvgScore(lastWeekEvents);

  // Calculate week-over-week uplift
  const reflexUpliftWoW = lastWeekScore !== 0
    ? (currentWeekScore - lastWeekScore) / lastWeekScore
    : 0;

  const shouldAlert = shouldTriggerDriftAlert(reflexUpliftWoW);

  return {
    gateId: 'EP.Drift.Alert',
    passed: !shouldAlert,
    message: shouldAlert
      ? `Reflex uplift WoW ${(reflexUpliftWoW * 100).toFixed(2)}% below threshold (-20%)`
      : `Reflex uplift WoW ${(reflexUpliftWoW * 100).toFixed(2)}% within acceptable range`,
    details: {
      reflexUpliftWoW,
      currentWeekScore,
      lastWeekScore,
      currentWeekEvents: currentWeekEvents.length,
      lastWeekEvents: lastWeekEvents.length,
      threshold: -0.20,
    },
  };
}

/**
 * Run all EP gates
 */
export async function runEPGates(
  changedFiles: string[] = []
): Promise<EPGateRunnerResult> {
  console.log('[EchoPrime] Running EP gates...');

  const gates: EPGateResult[] = [];

  // Run EP.POS.Ready gate
  const posReadyResult = await checkPosReady(changedFiles);
  gates.push(posReadyResult);

  // Run EP.REM.Coverage gate
  const remCoverageResult = await checkREMCoverage();
  gates.push(remCoverageResult);

  // Run EP.Drift.Alert gate
  const driftAlertResult = await checkDriftAlert();
  gates.push(driftAlertResult);

  const failedGates = gates.filter((g) => !g.passed).map((g) => g.gateId);
  const allPassed = failedGates.length === 0;

  console.log('[EchoPrime] EP gates complete:', {
    allPassed,
    passed: gates.filter((g) => g.passed).length,
    failed: failedGates.length,
    failedGates,
  });

  return {
    allPassed,
    gates,
    failedGates,
  };
}

/**
 * Check if a specific guardrail is violated
 */
export async function checkGuardrail(
  guardrailId: 'G1' | 'G2' | 'G3' | 'G4' | 'G5',
  context?: Record<string, any>
): Promise<EPGateResult> {
  switch (guardrailId) {
    case 'G1':
      return checkPosReady(context?.changedFiles || []);
    case 'G3':
      return checkREMCoverage();
    case 'G5':
      return checkDriftAlert();
    default:
      return {
        gateId: `EP.${guardrailId}`,
        passed: true,
        message: `Guardrail ${guardrailId} not yet enforced via EP gates`,
      };
  }
}

