export type OperatorTrustTier = 1 | 2 | 3 | 4;
export type OperatorRiskLevel = 'low' | 'medium' | 'high';
export type ResolutionConfidence = 'high' | 'medium' | 'low';

export interface OperatorTrustDecisionInput {
  trustTier: OperatorTrustTier;
  riskLevel: OperatorRiskLevel;
  confidence: ResolutionConfidence;
  isAmbiguous: boolean;
  hasExplicitPolicyBlock?: boolean;
}

export interface OperatorTrustDecision {
  autoRun: boolean;
  requireConfirmation: boolean;
  reason: string;
}

export function evaluateOperatorTrustDecision(
  input: OperatorTrustDecisionInput
): OperatorTrustDecision {
  if (input.hasExplicitPolicyBlock) {
    return {
      autoRun: false,
      requireConfirmation: true,
      reason: 'Blocked by policy.',
    };
  }

  if (input.isAmbiguous || input.confidence === 'low') {
    return {
      autoRun: false,
      requireConfirmation: true,
      reason: 'Ambiguous or low-confidence context.',
    };
  }

  if (input.riskLevel === 'high') {
    return {
      autoRun: false,
      requireConfirmation: true,
      reason: 'High-risk actions require confirmation.',
    };
  }

  if (input.riskLevel === 'low') {
    return {
      autoRun: true,
      requireConfirmation: false,
      reason: 'Low-risk action.',
    };
  }

  if (input.riskLevel === 'medium') {
    if (input.trustTier >= 3 && input.confidence === 'high') {
      return {
        autoRun: true,
        requireConfirmation: false,
        reason: 'Trusted operator with high-confidence medium-risk action.',
      };
    }

    return {
      autoRun: false,
      requireConfirmation: true,
      reason: 'Medium-risk action requires confirmation for this tier.',
    };
  }

  return {
    autoRun: false,
    requireConfirmation: true,
    reason: 'Fallback confirmation.',
  };
}
