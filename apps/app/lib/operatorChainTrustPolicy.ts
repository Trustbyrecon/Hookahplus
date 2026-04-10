import type {
  OperatorRiskLevel,
  OperatorTrustTier,
  ResolutionConfidence,
} from './operatorTrustPolicy';

export interface OperatorChainTrustStep {
  tool:
    | 'resolve_session_context'
    | 'get_customer_memory'
    | 'start_session'
    | 'move_table'
    | 'end_session'
    | 'summarize_lounge_activity'
    | 'suggest_upsell';
  riskLevel: OperatorRiskLevel;
  confidence: ResolutionConfidence;
  ambiguous?: boolean;
}

export interface OperatorChainTrustDecisionInput {
  trustTier: OperatorTrustTier;
  steps: OperatorChainTrustStep[];
  hasExplicitPolicyBlock?: boolean;
}

export interface OperatorChainTrustDecision {
  autoRun: boolean;
  requireConfirmation: boolean;
  reason: string;
  highestRisk: OperatorRiskLevel;
  lowestConfidence: ResolutionConfidence;
  ambiguous: boolean;
}

function rankRisk(risk: OperatorRiskLevel): number {
  switch (risk) {
    case 'low':
      return 1;
    case 'medium':
      return 2;
    case 'high':
      return 3;
  }
}

function rankConfidence(confidence: ResolutionConfidence): number {
  switch (confidence) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
  }
}

export function evaluateOperatorChainTrustDecision(
  input: OperatorChainTrustDecisionInput
): OperatorChainTrustDecision {
  if (input.hasExplicitPolicyBlock) {
    return {
      autoRun: false,
      requireConfirmation: true,
      reason: 'Blocked by policy.',
      highestRisk: 'high',
      lowestConfidence: 'low',
      ambiguous: true,
    };
  }

  const ambiguous = input.steps.some((step) => step.ambiguous);
  if (ambiguous) {
    return {
      autoRun: false,
      requireConfirmation: true,
      reason: 'Chain is ambiguous.',
      highestRisk: getHighestRisk(input.steps),
      lowestConfidence: getLowestConfidence(input.steps),
      ambiguous: true,
    };
  }

  const lowestConfidence = getLowestConfidence(input.steps);
  if (lowestConfidence === 'low') {
    return {
      autoRun: false,
      requireConfirmation: true,
      reason: 'Low-confidence chain.',
      highestRisk: getHighestRisk(input.steps),
      lowestConfidence,
      ambiguous: false,
    };
  }

  const highestRisk = getHighestRisk(input.steps);

  if (highestRisk === 'high') {
    return {
      autoRun: false,
      requireConfirmation: true,
      reason: 'High-risk chain requires confirmation.',
      highestRisk,
      lowestConfidence,
      ambiguous: false,
    };
  }

  if (highestRisk === 'low') {
    return {
      autoRun: true,
      requireConfirmation: false,
      reason: 'Low-risk chain.',
      highestRisk,
      lowestConfidence,
      ambiguous: false,
    };
  }

  if (highestRisk === 'medium') {
    if (input.trustTier >= 3 && lowestConfidence === 'high') {
      return {
        autoRun: true,
        requireConfirmation: false,
        reason: 'Trusted operator with high-confidence medium-risk chain.',
        highestRisk,
        lowestConfidence,
        ambiguous: false,
      };
    }

    return {
      autoRun: false,
      requireConfirmation: true,
      reason: 'Medium-risk chain requires confirmation for this tier.',
      highestRisk,
      lowestConfidence,
      ambiguous: false,
    };
  }

  return {
    autoRun: false,
    requireConfirmation: true,
    reason: 'Fallback chain confirmation.',
    highestRisk,
    lowestConfidence,
    ambiguous: false,
  };
}

function getHighestRisk(steps: OperatorChainTrustStep[]): OperatorRiskLevel {
  return [...steps].sort((a, b) => rankRisk(b.riskLevel) - rankRisk(a.riskLevel))[0]?.riskLevel ?? 'low';
}

function getLowestConfidence(steps: OperatorChainTrustStep[]): ResolutionConfidence {
  return [...steps].sort((a, b) => rankConfidence(a.confidence) - rankConfidence(b.confidence))[0]
    ?.confidence ?? 'high';
}
