import type { ReflexScore } from '../../types/reflex';

export type GateOutcome = "proceed" | "recover" | "halt";

/**
 * Determines the action to take based on a Reflex Score
 * @param score The reflex score (0-1)
 * @returns The recommended action
 */
export function gate(score: number): GateOutcome {
  if (score >= 0.92) return "proceed";
  if (score >= 0.87) return "recover";
  return "halt";
}

/**
 * Evaluates a detailed Reflex Score and returns the gate outcome
 * @param reflexScore The detailed reflex score object
 * @returns The gate outcome with additional context
 */
export function evaluateScore(reflexScore: ReflexScore): {
  outcome: GateOutcome;
  reason: string;
  recommendedAction?: string;
} {
  const { value, components, failureType, downstreamRisk } = reflexScore;
  
  // Base gate decision
  const outcome = gate(value);
  
  // Determine reason and recommended action
  let reason = "";
  let recommendedAction: string | undefined;
  
  if (outcome === "proceed") {
    reason = "Score meets proceed threshold (≥0.92)";
  } else if (outcome === "recover") {
    reason = "Score in recovery range (0.87-0.92)";
    
    // Suggest specific recovery actions based on component scores
    if (components.semanticDensity < 0.8) {
      recommendedAction = "Re-prompt with more specific instructions";
    } else if (components.relevance < 0.8) {
      recommendedAction = "Provide additional context or examples";
    } else if (components.structure < 0.8) {
      recommendedAction = "Request structured output format";
    } else if (components.memoryConsistency < 0.8) {
      recommendedAction = "Refresh context with recent history";
    }
  } else {
    reason = "Score below halt threshold (<0.87)";
    
    if (failureType) {
      reason += ` - Failure type: ${failureType}`;
    }
    
    if (downstreamRisk > 0.7) {
      reason += " - High downstream risk detected";
      recommendedAction = "Halt and escalate to human supervisor";
    } else {
      recommendedAction = "Halt and log failure for analysis";
    }
  }
  
  return { outcome, reason, recommendedAction };
}

/**
 * Calculates a composite reflex score from individual components
 * @param components The individual score components
 * @returns The composite score
 */
export function calculateCompositeScore(components: ReflexScore['components']): number {
  const { semanticDensity, relevance, structure, memoryConsistency } = components;
  
  // Weighted average with emphasis on semantic density and relevance
  const weights = {
    semanticDensity: 0.3,
    relevance: 0.3,
    structure: 0.2,
    memoryConsistency: 0.2
  };
  
  return (
    semanticDensity * weights.semanticDensity +
    relevance * weights.relevance +
    structure * weights.structure +
    memoryConsistency * weights.memoryConsistency
  );
}

/**
 * Validates that a score is within valid range
 * @param score The score to validate
 * @returns True if valid, false otherwise
 */
export function isValidScore(score: number): boolean {
  return score >= 0 && score <= 1 && !isNaN(score);
}

/**
 * Gets the severity level for a given score
 * @param score The reflex score
 * @returns The severity level
 */
export function getSeverity(score: number): "low" | "medium" | "critical" {
  if (score >= 0.87) return "low";
  if (score >= 0.7) return "medium";
  return "critical";
}
