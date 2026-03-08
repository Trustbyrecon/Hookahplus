/**
 * H+ Onboarding Engine - Validators
 * Each validator returns { status, errors, warnings }
 */

export type ValidationResult = {
  status: "complete" | "needs_input" | "needs_review";
  errors: string[];
  warnings: string[];
};

export function validateLoungeIdentity(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.loungeName || String(data.loungeName).trim() === "") {
    errors.push("Lounge name is required.");
  }

  if (!data.ownerName || String(data.ownerName).trim() === "") {
    warnings.push("Owner name is recommended.");
  }

  if (!data.address || String(data.address).trim() === "") {
    warnings.push("Address is recommended for location features.");
  }

  return {
    status: errors.length > 0 ? "needs_input" : "complete",
    errors,
    warnings,
  };
}

export function validatePricingLock(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.baseSessionPrice == null || Number(data.baseSessionPrice) < 20) {
    errors.push("Base session price must be at least 20.");
  }

  if (!data.pricingMode) {
    errors.push("Pricing mode is required.");
  }

  if (data.premiumFlavorEnabled && (data.marginAmount == null || Number(data.marginAmount) < 0)) {
    warnings.push("Premium flavors are enabled but no margin amount is set.");
  }

  return {
    status: errors.length > 0 ? "needs_input" : "complete",
    errors,
    warnings,
  };
}

export function validatePOSConnection(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const posType = data.posType as string | undefined;

  if (!posType) {
    errors.push("POS type is required.");
    return { status: "needs_input", errors, warnings };
  }

  if (posType !== "manual") {
    warnings.push("Verify your POS connection is active.");
  }

  return {
    status: errors.length > 0 ? "needs_input" : "complete",
    errors,
    warnings,
  };
}

export function validateQRPayments(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.qrEnabled && !data.stripeConnected) {
    warnings.push("QR is enabled but Stripe is not connected.");
  }

  return {
    status: errors.length > 0 ? "needs_input" : "complete",
    errors,
    warnings,
  };
}

export function validateGoLiveCheck(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const checks = [
    "pricingValid",
    "posVerified",
    "qrTested",
    "testTransactionSuccess",
    "operatorApproved",
  ];

  const missing = checks.filter((key) => !data[key]);
  if (missing.length > 0) {
    errors.push(`Complete all checklist items: ${missing.join(", ")}`);
  }

  return {
    status: errors.length > 0 ? "needs_input" : "complete",
    errors,
    warnings,
  };
}

const validatorMap: Record<string, (data: Record<string, unknown>) => ValidationResult> = {
  lounge_identity: validateLoungeIdentity,
  pricing_lock: validatePricingLock,
  pos_connection: validatePOSConnection,
  qr_payments: validateQRPayments,
  go_live_check: validateGoLiveCheck,
};

export function validateStep(stepKey: string, data: Record<string, unknown>): ValidationResult {
  const fn = validatorMap[stepKey];
  if (!fn) {
    return { status: "complete", errors: [], warnings: [] };
  }
  return fn(data);
}
