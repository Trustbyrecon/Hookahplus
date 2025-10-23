/**
 * EchoPrime Continuous Flow Integration System
 * Integrates predictive flow with auto-agentic execution
 */

import { PredictiveFlowEngine, ErrorPattern, initializePredictiveFlow } from './predictive-flow';
import { AutoPromptGenerator, AutoPrompt, initializeAutoPromptGenerator } from './auto-prompt-generator';

export interface FlowIntegrationConfig {
  enableContinuousPrompts: boolean;
  enableBatchExecution: boolean;
  enableProactiveScanning: boolean;
  maxConcurrentFixes: number;
  flowTimeout: number;
}

export class ContinuousFlowIntegration {
  private predictiveEngine: PredictiveFlowEngine;
  private promptGenerator: AutoPromptGenerator;
  private config: FlowIntegrationConfig;
  private isActive: boolean = false;

  constructor(config: FlowIntegrationConfig) {
    this.config = config;
    this.predictiveEngine = initializePredictiveFlow({
      enableProactiveScanning: config.enableProactiveScanning,
      enableBatchExecution: config.enableBatchExecution,
      enableContinuousPrompts: config.enableContinuousPrompts
    });
    this.promptGenerator = initializeAutoPromptGenerator(this.predictiveEngine);
  }

  /**
   * Process build error and generate continuous flow
   */
  public async processBuildError(errorLog: string): Promise<{
    currentFix: ErrorPattern;
    predictions: ErrorPattern[];
    autoPrompts: AutoPrompt[];
    batchFixes: ErrorPattern[];
  }> {
    // Parse error log to extract error pattern
    const currentError = this.parseErrorLog(errorLog);
    
    // Generate predictions and prompts
    const autoPrompts = this.promptGenerator.generateAutoPrompts(currentError);
    const analysis = this.predictiveEngine.analyzeAndPredict(currentError);
    
    // Execute auto-prompts if enabled
    if (this.config.enableContinuousPrompts) {
      await this.promptGenerator.executeAutoPrompts(autoPrompts);
    }

    return {
      currentFix: currentError,
      predictions: analysis.predictions,
      autoPrompts,
      batchFixes: analysis.batchFixes
    };
  }

  /**
   * Parse error log to extract error pattern
   */
  private parseErrorLog(errorLog: string): ErrorPattern {
    // Extract error type and pattern from log
    const importPathMatch = errorLog.match(/Cannot find module ['"]([^'"]+)['"]/);
    const typeErrorMatch = errorLog.match(/Type error: (.+)/);
    const pathMatch = errorLog.match(/\.\.\/\.\.\/\.\./g);

    if (importPathMatch) {
      const path = importPathMatch[1];
      if (path.startsWith('@/')) {
        return {
          type: 'import-path',
          pattern: `Cannot find module "${path}"`,
          risk: 'LOW',
          fix: 'Convert @/ imports to relative paths',
          autoExecute: true,
          confidence: 0.95
        };
      } else if (pathMatch) {
        return {
          type: 'path-depth',
          pattern: `Cannot find module "${path}"`,
          risk: 'LOW',
          fix: 'Correct path depth (add/remove ../ levels)',
          autoExecute: true,
          confidence: 0.90
        };
      }
    }

    // Default fallback
    return {
      type: 'unknown',
      pattern: errorLog.substring(0, 100),
      risk: 'MEDIUM',
      fix: 'Manual analysis required',
      autoExecute: false,
      confidence: 0.5
    };
  }

  /**
   * Start continuous flow
   */
  public startContinuousFlow(): void {
    this.isActive = true;
    console.log('🤖 CONTINUOUS FLOW: Started predictive auto-agentic flow');
  }

  /**
   * Stop continuous flow
   */
  public stopContinuousFlow(): void {
    this.isActive = false;
    console.log('🤖 CONTINUOUS FLOW: Stopped predictive auto-agentic flow');
  }

  /**
   * Get flow status
   */
  public getFlowStatus(): {
    active: boolean;
    predictions: number;
    batchFixes: number;
    confidence: number;
  } {
    return this.predictiveEngine.getFlowStatus();
  }
}

/**
 * Default configuration for continuous flow
 */
export const defaultFlowConfig: FlowIntegrationConfig = {
  enableContinuousPrompts: true,
  enableBatchExecution: true,
  enableProactiveScanning: true,
  maxConcurrentFixes: 5,
  flowTimeout: 30000
};

/**
 * Initialize continuous flow integration
 */
export const initializeContinuousFlow = (config?: Partial<FlowIntegrationConfig>) => {
  const finalConfig = { ...defaultFlowConfig, ...config };
  return new ContinuousFlowIntegration(finalConfig);
};
