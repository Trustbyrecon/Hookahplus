export type ReconcilePolicyDefaults = {
  sinceMinutes: number;
  orderLimit: number;
  processLimit: number;
  graceWindowMinutes: number;
  cadenceMinutes: number;
  suppressionWindowMinutes: number;
  unassignedTicketAlertAfterRuns: number;
  reconcileDeltaAlertMin: number;
  reconcileDeltaPctAlertMin: number;
  widenWindowMinutes: number;
};

function parseNumber(raw: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/**
 * Org-level policy defaults for Square reconcile/heal.
 * These defaults apply across locations unless a route-level override is passed.
 */
export function getReconcilePolicyDefaults(): ReconcilePolicyDefaults {
  return {
    sinceMinutes: parseNumber(process.env.RECON_SINCE_MINUTES_DEFAULT, 120, 5, 60 * 24 * 14),
    orderLimit: parseNumber(process.env.RECON_ORDER_LIMIT_DEFAULT, 50, 1, 200),
    processLimit: parseNumber(process.env.RECON_PROCESS_LIMIT_DEFAULT, 200, 10, 1000),
    graceWindowMinutes: parseNumber(process.env.RECON_GRACE_WINDOW_MINUTES, 10, 0, 24 * 60),
    cadenceMinutes: parseNumber(process.env.RECON_CADENCE_MINUTES, 15, 1, 24 * 60),
    suppressionWindowMinutes: parseNumber(process.env.RECON_SUPPRESSION_WINDOW_MINUTES, 60, 0, 24 * 60),
    unassignedTicketAlertAfterRuns: parseNumber(process.env.RECON_UNASSIGNED_ALERT_AFTER_RUNS, 2, 1, 10),
    reconcileDeltaAlertMin: parseNumber(process.env.RECON_DELTA_ALERT_MIN, 2, 0, 1_000_000),
    reconcileDeltaPctAlertMin: parseNumber(process.env.RECON_DELTA_PCT_ALERT_MIN, 1, 0, 100),
    widenWindowMinutes: parseNumber(process.env.RECON_WIDEN_WINDOW_MINUTES, 30, 0, 24 * 60),
  };
}

