/**
 * POS Reconciliation Job
 * 
 * Agent: Noor (Builder)
 * Mission: Match Stripe charges ↔ POS tickets and achieve ≥95% reconciliation rate
 * 
 * This module exports the reconciliation functions for use in API routes.
 * The full job implementation is in jobs/settle.ts
 */

export { runReconciliationJob, reconcilePosSettlements } from '../jobs/settle';

