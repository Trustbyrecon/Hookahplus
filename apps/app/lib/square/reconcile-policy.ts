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

type ReconcilePolicyOverride = Partial<ReconcilePolicyDefaults>;

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

function parseLocationOverrides(): Record<string, ReconcilePolicyOverride> {
  const raw = (process.env.RECON_LOCATION_POLICY_OVERRIDES_JSON || "").trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, ReconcilePolicyOverride>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function toEffectivePolicy(
  base: ReconcilePolicyDefaults,
  override: ReconcilePolicyOverride | undefined,
): ReconcilePolicyDefaults {
  return {
    sinceMinutes: parseNumber(
      override?.sinceMinutes != null ? String(override.sinceMinutes) : undefined,
      base.sinceMinutes,
      5,
      60 * 24 * 14,
    ),
    orderLimit: parseNumber(
      override?.orderLimit != null ? String(override.orderLimit) : undefined,
      base.orderLimit,
      1,
      200,
    ),
    processLimit: parseNumber(
      override?.processLimit != null ? String(override.processLimit) : undefined,
      base.processLimit,
      10,
      1000,
    ),
    graceWindowMinutes: parseNumber(
      override?.graceWindowMinutes != null ? String(override.graceWindowMinutes) : undefined,
      base.graceWindowMinutes,
      0,
      24 * 60,
    ),
    cadenceMinutes: parseNumber(
      override?.cadenceMinutes != null ? String(override.cadenceMinutes) : undefined,
      base.cadenceMinutes,
      1,
      24 * 60,
    ),
    suppressionWindowMinutes: parseNumber(
      override?.suppressionWindowMinutes != null ? String(override.suppressionWindowMinutes) : undefined,
      base.suppressionWindowMinutes,
      0,
      24 * 60,
    ),
    unassignedTicketAlertAfterRuns: parseNumber(
      override?.unassignedTicketAlertAfterRuns != null ? String(override.unassignedTicketAlertAfterRuns) : undefined,
      base.unassignedTicketAlertAfterRuns,
      1,
      10,
    ),
    reconcileDeltaAlertMin: parseNumber(
      override?.reconcileDeltaAlertMin != null ? String(override.reconcileDeltaAlertMin) : undefined,
      base.reconcileDeltaAlertMin,
      0,
      1_000_000,
    ),
    reconcileDeltaPctAlertMin: parseNumber(
      override?.reconcileDeltaPctAlertMin != null ? String(override.reconcileDeltaPctAlertMin) : undefined,
      base.reconcileDeltaPctAlertMin,
      0,
      100,
    ),
    widenWindowMinutes: parseNumber(
      override?.widenWindowMinutes != null ? String(override.widenWindowMinutes) : undefined,
      base.widenWindowMinutes,
      0,
      24 * 60,
    ),
  };
}

export function getEffectiveReconcilePolicy(loungeId: string): {
  policy: ReconcilePolicyDefaults;
  hasOverride: boolean;
} {
  const defaults = getReconcilePolicyDefaults();
  const overrides = parseLocationOverrides();
  const override = overrides[loungeId];
  if (!override) return { policy: defaults, hasOverride: false };
  return {
    policy: toEffectivePolicy(defaults, override),
    hasOverride: true,
  };
}

