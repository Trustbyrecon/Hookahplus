import type { ReflexEvent, ScorerInput, EnrichmentFingerprint } from '../../types/reflex';
import { scoreOutput, generateFingerprint } from './reflexScorer';
import { evaluateScore, getSeverity } from './scoreGate';
import { ghostLog, logFailure, logSuccess, logRepair } from './ghostLog';
import { trustGraph } from './trustGraph';

export interface ReflexContext {
  route: string;
  action: string;
  domain?: string;
  previousOutputs?: string[];
  context?: string;
}

/**
 * Main Reflex Layer orchestrator
 * Analyzes output, scores it, and takes appropriate action
 */
export class ReflexLayer {
  private context: ReflexContext;

  constructor(context: ReflexContext) {
    this.context = context;
  }

  /**
   * Process an output through the complete Reflex Layer
   */
  async processOutput(
    output: string | object | null,
    expectedType?: 'text' | 'json' | 'code' | 'tool'
  ): Promise<{
    shouldProceed: boolean;
    action: 'proceed' | 'recover' | 'halt';
    score: number;
    reason: string;
    recommendedAction?: string;
    fingerprint: EnrichmentFingerprint;
  }> {
    // Step 1: Score the output
    const scoreResult = scoreOutput({
      output,
      expectedType,
      context: this.context.context,
      previousOutputs: this.context.previousOutputs,
      domain: this.context.domain
    });

    // Step 2: Evaluate the score and determine action
    const evaluation = evaluateScore(scoreResult);
    
    // Step 3: Generate fingerprint
    const fingerprint = generateFingerprint(
      output,
      this.context.domain,
      scoreResult.value
    );

    // Step 4: Create reflex event
    const reflexEvent: ReflexEvent = {
      route: this.context.route,
      action: this.context.action,
      score: scoreResult.value,
      failureType: scoreResult.failureType,
      outcome: evaluation.outcome,
      fingerprint,
      timestamp: new Date().toISOString(),
      severity: getSeverity(scoreResult.value)
    };

    // Step 5: Log the event
    if (evaluation.outcome === 'proceed') {
      logSuccess(this.context.route, this.context.action, scoreResult.value);
    } else {
      logFailure(
        this.context.route,
        this.context.action,
        scoreResult.failureType || 'unknown',
        scoreResult.value
      );
    }

    // Step 6: Update trust graph
    trustGraph.processReflexEvent(reflexEvent);

    // Step 7: Take action based on evaluation
    const shouldProceed = evaluation.outcome === 'proceed';
    
    if (evaluation.outcome === 'recover') {
      await this.attemptRecovery(scoreResult, evaluation.recommendedAction);
    }

    return {
      shouldProceed,
      action: evaluation.outcome,
      score: scoreResult.value,
      reason: evaluation.reason,
      recommendedAction: evaluation.recommendedAction,
      fingerprint
    };
  }

  /**
   * Attempt to recover from a low score
   */
  private async attemptRecovery(scoreResult: any, recommendedAction?: string): Promise<void> {
    const recoveryActions = this.generateRecoveryActions(scoreResult, recommendedAction);
    
    for (const action of recoveryActions) {
      logRepair(this.context.route, action.type, false, {
        target: action.target,
        confidence: action.confidence
      });
      
      // In a real implementation, this would execute the recovery action
      console.log(`[ReflexLayer] Attempting recovery: ${action.type} on ${action.target}`);
    }
  }

  /**
   * Generate recovery actions based on the score analysis
   */
  private generateRecoveryActions(scoreResult: any, recommendedAction?: string) {
    const actions = [];
    const { components, failureType } = scoreResult;

    // Semantic density recovery
    if (components.semanticDensity < 0.8) {
      actions.push({
        type: 're_prompt',
        target: 'output_generation',
        confidence: 0.7,
        patch: 'Request more specific and detailed output'
      });
    }

    // Relevance recovery
    if (components.relevance < 0.8) {
      actions.push({
        type: 're_prompt',
        target: 'context_awareness',
        confidence: 0.6,
        patch: 'Provide additional context and domain-specific examples'
      });
    }

    // Structure recovery
    if (components.structure < 0.8) {
      actions.push({
        type: 're_prompt',
        target: 'output_format',
        confidence: 0.8,
        patch: 'Request properly structured output format'
      });
    }

    // Memory consistency recovery
    if (components.memoryConsistency < 0.8) {
      actions.push({
        type: 're_prompt',
        target: 'memory_consistency',
        confidence: 0.5,
        patch: 'Refresh context with recent history and previous outputs'
      });
    }

    // Specific failure type recovery
    if (failureType === 'serialization_error') {
      actions.push({
        type: 're_prompt',
        target: 'json_formatting',
        confidence: 0.9,
        patch: 'Ensure valid JSON output with proper escaping'
      });
    }

    return actions;
  }

  /**
   * Get current system health
   */
  getSystemHealth() {
    return trustGraph.getSystemHealth();
  }

  /**
   * Get nodes needing attention
   */
  getNodesNeedingAttention() {
    return trustGraph.getNodesNeedingAttention();
  }

  /**
   * Get reliability for a specific node
   */
  getNodeReliability(nodeId: string): number {
    return trustGraph.getReliability(nodeId);
  }
}

/**
 * Create a new Reflex Layer instance
 */
export function createReflexLayer(context: ReflexContext): ReflexLayer {
  return new ReflexLayer(context);
}

/**
 * Quick reflex check for simple use cases
 */
export async function quickReflexCheck(
  output: string | object | null,
  route: string,
  action: string,
  domain?: string
): Promise<boolean> {
  const reflexLayer = createReflexLayer({ route, action, domain });
  const result = await reflexLayer.processOutput(output);
  return result.shouldProceed;
}

// Export all the core components
export * from './reflexScorer';
export * from './scoreGate';
export * from './ghostLog';
export * from './trustGraph';
export * from '../../types/reflex';
