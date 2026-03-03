/**
 * Automated Reconciliation Job
 * Runs nightly to compare session ledger with POS events and detect missing events
 */

import { prisma } from '../db';
import { runReconciliationJob } from '../reconciliation';
import { logger } from '../logger';

export interface ReconciliationRun {
  id: string;
  loungeId: string;
  runAt: Date;
  status: 'success' | 'failed' | 'partial';
  reconciliationRate: number;
  pricingParity: number;
  matched: number;
  orphanedStripeCharges: number;
  orphanedPosTickets: number;
  findings: Array<{
    type: 'missing_event' | 'amount_mismatch' | 'orphaned_charge' | 'orphaned_ticket';
    sessionId?: string;
    chargeId?: string;
    ticketId?: string;
    details: string;
  }>;
  errorMessage?: string;
}

/**
 * Run nightly reconciliation for a lounge
 */
export async function runNightlyReconciliation(
  loungeId: string
): Promise<ReconciliationRun> {
  const runId = `recon_${Date.now()}`;
  const runAt = new Date();

  try {
    // Run reconciliation
    const result = await runReconciliationJob();

    // Detect missing events and mismatches
    const findings: ReconciliationRun['findings'] = [];

    // Check for orphaned Stripe charges (no matching POS ticket)
    if (result.orphanedStripeCharges > 0) {
      findings.push({
        type: 'orphaned_charge',
        details: `${result.orphanedStripeCharges} Stripe charges without matching POS tickets`,
      });
    }

    // Check for orphaned POS tickets (no matching Stripe charge)
    if (result.orphanedPosTickets > 0) {
      findings.push({
        type: 'orphaned_ticket',
        details: `${result.orphanedPosTickets} POS tickets without matching Stripe charges`,
      });
    }

    // Determine status
    let status: 'success' | 'failed' | 'partial' = 'success';
    if (result.reconciliationRate < 0.95) {
      status = 'partial';
    }
    if (result.reconciliationRate < 0.80) {
      status = 'failed';
    }

    const reconciliationRun: ReconciliationRun = {
      id: runId,
      loungeId,
      runAt,
      status,
      reconciliationRate: result.reconciliationRate,
      pricingParity: result.pricingParity,
      matched: result.matched,
      orphanedStripeCharges: result.orphanedStripeCharges,
      orphanedPosTickets: result.orphanedPosTickets,
      findings,
    };

    // Store reconciliation run (if table exists)
    try {
      await prisma.$executeRaw`
        INSERT INTO reconciliation_runs (id, lounge_id, run_at, status, reconciliation_rate, pricing_parity, matched, orphaned_stripe_charges, orphaned_pos_tickets, findings, created_at)
        VALUES (${runId}, ${loungeId}, ${runAt}, ${status}, ${result.reconciliationRate}, ${result.pricingParity}, ${result.matched}, ${result.orphanedStripeCharges}, ${result.orphanedPosTickets}, ${JSON.stringify(findings)}::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          reconciliation_rate = EXCLUDED.reconciliation_rate,
          findings = EXCLUDED.findings
      `;
    } catch (dbError) {
      // Table might not exist yet, log but don't fail
      logger.warn('Could not store reconciliation run (table may not exist)', {
        component: 'reconciliation',
        error: dbError instanceof Error ? dbError.message : String(dbError),
      });
    }

    logger.info('Nightly reconciliation completed', {
      component: 'reconciliation',
      loungeId,
      reconciliationRate: result.reconciliationRate,
      status,
    });

    return reconciliationRun;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Nightly reconciliation failed', {
      component: 'reconciliation',
      loungeId,
      error: errorMessage,
    });

    return {
      id: runId,
      loungeId,
      runAt,
      status: 'failed',
      reconciliationRate: 0,
      pricingParity: 0,
      matched: 0,
      orphanedStripeCharges: 0,
      orphanedPosTickets: 0,
      findings: [],
      errorMessage,
    };
  }
}

/**
 * Get reconciliation history for a lounge
 */
export async function getReconciliationHistory(
  loungeId: string,
  limit: number = 30
): Promise<ReconciliationRun[]> {
  try {
    const runs = await prisma.$queryRaw<Array<{
      id: string;
      lounge_id: string;
      run_at: Date;
      status: string;
      reconciliation_rate: number;
      pricing_parity: number;
      matched: number;
      orphaned_stripe_charges: number;
      orphaned_pos_tickets: number;
      findings: any;
      error_message?: string;
    }>>`
      SELECT * FROM reconciliation_runs
      WHERE lounge_id = ${loungeId}
      ORDER BY run_at DESC
      LIMIT ${limit}
    `;

    return runs.map(run => ({
      id: run.id,
      loungeId: run.lounge_id,
      runAt: run.run_at,
      status: run.status as 'success' | 'failed' | 'partial',
      reconciliationRate: run.reconciliation_rate,
      pricingParity: run.pricing_parity,
      matched: run.matched,
      orphanedStripeCharges: run.orphaned_stripe_charges,
      orphanedPosTickets: run.orphaned_pos_tickets,
      findings: run.findings || [],
      errorMessage: run.error_message,
    }));
  } catch (error) {
    logger.warn('Could not fetch reconciliation history (table may not exist)', {
      component: 'reconciliation',
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

