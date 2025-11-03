/**
 * Feature Flags Configuration
 * 
 * Centralized feature flags for Hookah+ swarm execution.
 * Guardrails and agent coordination depend on these flags.
 */

export interface FeatureFlags {
  // POS Sync Readiness - Must be true before QR-only changes allowed
  POS_SYNC_READY: boolean;
  
  // Reconciliation rate thresholds
  RECONCILIATION_RATE_TARGET: number; // 0.95 = 95%
  PRICING_PARITY_TARGET: number; // 0.99 = 99%
  
  // REM Schema Coverage
  REM_COVERAGE_TARGET: number; // 0.95 = 95%
  
  // Drift Alert Threshold
  REFLEX_UPLIFT_WOW_THRESHOLD: number; // -0.20 = -20% week-over-week
  
  // Ledger Settlement Timeout
  LEDGER_SETTLE_TIMEOUT_MS: number; // 60000 = 60 seconds
}

/**
 * Current feature flags state
 * 
 * POS_SYNC_READY: Set to false until Noor completes POS reconciliation
 *                 and achieves ≥95% reconciliation rate.
 */
export const FEATURE_FLAGS: FeatureFlags = {
  POS_SYNC_READY: false, // G1 Guardrail: Must be true for QR-only changes
  RECONCILIATION_RATE_TARGET: 0.95,
  PRICING_PARITY_TARGET: 0.99,
  REM_COVERAGE_TARGET: 0.95,
  REFLEX_UPLIFT_WOW_THRESHOLD: -0.20,
  LEDGER_SETTLE_TIMEOUT_MS: 60000,
};

/**
 * Check if POS sync is ready (Guardrail G1)
 * 
 * @returns true if POS sync is ready, false otherwise
 */
export function isPosSyncReady(): boolean {
  return FEATURE_FLAGS.POS_SYNC_READY;
}

/**
 * Check if QR-only changes are allowed
 * 
 * Guardrail G1: No QR-only changes unless POS_SYNC_READY == true
 * 
 * @param path - File path being modified
 * @returns true if QR-only changes are allowed, false otherwise
 */
export function canModifyQROnly(path: string): boolean {
  const isQRPath = path.includes('/qr/') || 
                   path.includes('qr') || 
                   path.includes('QR');
  
  if (!isQRPath) {
    return true; // Not a QR path, always allowed
  }
  
  return isPosSyncReady();
}

/**
 * Validate reconciliation rate
 * 
 * @param currentRate - Current reconciliation rate (0.0 - 1.0)
 * @returns true if rate meets target, false otherwise
 */
export function validateReconciliationRate(currentRate: number): boolean {
  return currentRate >= FEATURE_FLAGS.RECONCILIATION_RATE_TARGET;
}

/**
 * Validate REM coverage
 * 
 * @param coverage - Current REM coverage (0.0 - 1.0)
 * @returns true if coverage meets target, false otherwise
 */
export function validateREMCoverage(coverage: number): boolean {
  return coverage >= FEATURE_FLAGS.REM_COVERAGE_TARGET;
}

/**
 * Check for drift alert condition
 * 
 * @param reflexUpliftWoW - Week-over-week Reflex uplift (-1.0 to 1.0)
 * @returns true if drift alert should trigger, false otherwise
 */
export function shouldTriggerDriftAlert(reflexUpliftWoW: number): boolean {
  return reflexUpliftWoW < FEATURE_FLAGS.REFLEX_UPLIFT_WOW_THRESHOLD;
}

/**
 * Set POS sync ready flag (called by Noor when reconciliation complete)
 * 
 * @param ready - Whether POS sync is ready
 */
export function setPosSyncReady(ready: boolean): void {
  // In production, this would be persisted to database/config store
  // For now, we'll use environment variable override
  if (process.env.POS_SYNC_READY === 'true') {
    FEATURE_FLAGS.POS_SYNC_READY = true;
  } else {
    FEATURE_FLAGS.POS_SYNC_READY = ready;
  }
}

/**
 * Get all feature flags for debugging/admin
 */
export function getAllFlags(): FeatureFlags {
  return { ...FEATURE_FLAGS };
}

