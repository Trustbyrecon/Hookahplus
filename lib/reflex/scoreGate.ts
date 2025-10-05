// lib/reflex/scoreGate.ts
// Reflex Score Gate - Decision engine for agent operations

import type { GateDecision, ReflexScore, FailureAnalysis, Severity } from '../../types/reflex';

export class ReflexScoreGate {
  private static readonly PROCEED_THRESHOLD = 0.92;
  private static readonly RECOVER_THRESHOLD = 0.87;
  private static readonly CRITICAL_THRESHOLD = 0.50;

  /**
   * Main gate function - determines action based on reflex score
   */
  static gate(score: number): GateDecision {
    if (score >= this.PROCEED_THRESHOLD) return "proceed";
    if (score >= this.RECOVER_THRESHOLD) return "recover";
    return "halt";
  }

  /**
   * Comprehensive gate evaluation with detailed analysis
   */
  static evaluateGate(
    score: ReflexScore, 
    failures: FailureAnalysis[] = []
  ): {
    decision: GateDecision;
    reasoning: string;
    requiredActions: string[];
    escalationNeeded: boolean;
  } {
    const { value, components, confidence } = score;
    const criticalFailures = failures.filter(f => f.severity === "critical");
    const hasHighRiskFailures = failures.some(f => f.propagationRisk > 0.7);

    // Critical failure override
    if (criticalFailures.length > 0 || hasHighRiskFailures) {
      return {
        decision: "halt",
        reasoning: `Critical failures detected: ${criticalFailures.map(f => f.type).join(", ")}`,
        requiredActions: ["escalate_to_supervisor", "log_critical_failure", "halt_operation"],
        escalationNeeded: true
      };
    }

    // Low confidence override
    if (confidence < 0.5) {
      return {
        decision: "halt",
        reasoning: `Low confidence in score accuracy: ${confidence.toFixed(2)}`,
        requiredActions: ["request_human_review", "improve_context", "retry_with_better_inputs"],
        escalationNeeded: true
      };
    }

    // Standard gate logic
    if (value >= this.PROCEED_THRESHOLD) {
      return {
        decision: "proceed",
        reasoning: `Score ${value.toFixed(2)} meets proceed threshold ${this.PROCEED_THRESHOLD}`,
        requiredActions: ["log_success", "update_trust_graph"],
        escalationNeeded: false
      };
    }

    if (value >= this.RECOVER_THRESHOLD) {
      const recoveryActions = this.generateRecoveryActions(score, failures);
      return {
        decision: "recover",
        reasoning: `Score ${value.toFixed(2)} requires recovery (${this.RECOVER_THRESHOLD}-${this.PROCEED_THRESHOLD})`,
        requiredActions: recoveryActions,
        escalationNeeded: false
      };
    }

    return {
      decision: "halt",
      reasoning: `Score ${value.toFixed(2)} below recover threshold ${this.RECOVER_THRESHOLD}`,
      requiredActions: ["escalate_to_supervisor", "analyze_failure_patterns", "request_manual_intervention"],
      escalationNeeded: true
    };
  }

  /**
   * Generate specific recovery actions based on score components and failures
   */
  private static generateRecoveryActions(
    score: ReflexScore, 
    failures: FailureAnalysis[]
  ): string[] {
    const actions: string[] = [];
    const { components } = score;

    // Component-specific recovery actions
    if (components.accuracy < 0.8) {
      actions.push("improve_data_validation", "enhance_context_analysis");
    }
    if (components.completeness < 0.8) {
      actions.push("expand_response_scope", "check_missing_requirements");
    }
    if (components.consistency < 0.8) {
      actions.push("standardize_output_format", "align_with_previous_responses");
    }
    if (components.efficiency < 0.8) {
      actions.push("optimize_processing_logic", "reduce_redundant_operations");
    }
    if (components.security < 0.8) {
      actions.push("enhance_security_checks", "validate_permissions");
    }

    // Failure-specific recovery actions
    failures.forEach(failure => {
      switch (failure.type) {
        case "blank":
          actions.push("retry_with_enhanced_prompt", "check_input_validity");
          break;
        case "hallucinated":
          actions.push("validate_against_ground_truth", "request_fact_check");
          break;
        case "function_mismatch":
          actions.push("validate_schema_compliance", "update_function_signature");
          break;
        case "vague":
          actions.push("enhance_specificity", "add_constraints");
          break;
        case "context_drift":
          actions.push("refresh_context", "validate_memory_consistency");
          break;
        case "guardrail_breach":
          actions.push("apply_security_patches", "validate_policy_compliance");
          break;
        case "serialization_error":
          actions.push("fix_json_structure", "validate_data_types");
          break;
        case "privacy_breach":
          actions.push("sanitize_output", "apply_privacy_filters");
          break;
        default:
          actions.push("analyze_failure_pattern", "apply_generic_recovery");
      }
    });

    return [...new Set(actions)]; // Remove duplicates
  }

  /**
   * Calculate weighted reflex score from components
   */
  static calculateScore(components: ReflexScore['components']): number {
    const weights = {
      accuracy: 0.3,
      completeness: 0.25,
      consistency: 0.2,
      efficiency: 0.15,
      security: 0.1
    };

    return Object.entries(components).reduce(
      (score, [key, value]) => score + (value * weights[key as keyof typeof weights]),
      0
    );
  }

  /**
   * Validate score components are within valid range
   */
  static validateScore(score: ReflexScore): boolean {
    const { value, components, confidence } = score;
    
    // Check main score is valid
    if (value < 0 || value > 1) return false;
    
    // Check confidence is valid
    if (confidence < 0 || confidence > 1) return false;
    
    // Check all components are valid
    return Object.values(components).every(comp => comp >= 0 && comp <= 1);
  }

  /**
   * Get threshold values for external monitoring
   */
  static getThresholds() {
    return {
      proceed: this.PROCEED_THRESHOLD,
      recover: this.RECOVER_THRESHOLD,
      critical: this.CRITICAL_THRESHOLD
    };
  }

  /**
   * Check if score indicates system health issues
   */
  static isSystemHealthy(scores: number[]): {
    healthy: boolean;
    averageScore: number;
    issues: string[];
  } {
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const issues: string[] = [];

    if (averageScore < this.CRITICAL_THRESHOLD) {
      issues.push("Critical system degradation detected");
    } else if (averageScore < this.RECOVER_THRESHOLD) {
      issues.push("System requires attention");
    }

    const lowScores = scores.filter(score => score < this.RECOVER_THRESHOLD).length;
    if (lowScores > scores.length * 0.3) {
      issues.push("High percentage of low-scoring operations");
    }

    return {
      healthy: issues.length === 0,
      averageScore,
      issues
    };
  }
}

// Export convenience functions
export const gate = ReflexScoreGate.gate;
export const evaluateGate = ReflexScoreGate.evaluateGate;
export const calculateScore = ReflexScoreGate.calculateScore;
export const validateScore = ReflexScoreGate.validateScore;
export const isSystemHealthy = ReflexScoreGate.isSystemHealthy;
