/**
 * EchoPrime Auto-Agentic Flow Controller
 * Main controller for predictive flow integration
 */

import { ContinuousFlowIntegration, initializeContinuousFlow } from './continuous-flow-integration';
import { ErrorPattern, AutoPrompt } from './auto-prompt-generator';

export interface FlowControllerConfig {
  enableAutoExecution: boolean;
  enablePredictivePrompts: boolean;
  enableBatchProcessing: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
}

export class AutoAgenticFlowController {
  private flowIntegration: ContinuousFlowIntegration;
  private config: FlowControllerConfig;
  private isInitialized: boolean = false;

  constructor(config: FlowControllerConfig) {
    this.config = config;
    this.flowIntegration = initializeContinuousFlow({
      enableContinuousPrompts: config.enablePredictivePrompts,
      enableBatchExecution: config.enableBatchProcessing,
      enableProactiveScanning: true
    });
  }

  /**
   * Initialize the auto-agentic flow controller
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.flowIntegration.startContinuousFlow();
    this.isInitialized = true;
    
    this.log('INFO', '🤖 AUTO-AGENTIC FLOW: Controller initialized with predictive integration');
  }

  /**
   * Process build error with predictive flow
   */
  public async processBuildError(errorLog: string): Promise<{
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    currentFix: ErrorPattern;
    predictions: ErrorPattern[];
    autoPrompts: AutoPrompt[];
    nextActions: string[];
  }> {
    try {
      const result = await this.flowIntegration.processBuildError(errorLog);
      
      // Generate next actions based on predictions
      const nextActions = this.generateNextActions(result.predictions);
      
      this.log('INFO', `🤖 AUTO-AGENTIC FLOW: Processed error - ${result.currentFix.type}`);
      
      return {
        status: 'SUCCESS',
        currentFix: result.currentFix,
        predictions: result.predictions,
        autoPrompts: result.autoPrompts,
        nextActions
      };
    } catch (error) {
      this.log('ERROR', `🤖 AUTO-AGENTIC FLOW: Error processing build log - ${error}`);
      return {
        status: 'FAILED',
        currentFix: {
          type: 'error',
          pattern: 'Processing failed',
          risk: 'HIGH',
          fix: 'Manual intervention required',
          autoExecute: false,
          confidence: 0.0
        },
        predictions: [],
        autoPrompts: [],
        nextActions: ['Manual analysis required']
      };
    }
  }

  /**
   * Generate next actions based on predictions
   */
  private generateNextActions(predictions: ErrorPattern[]): string[] {
    const actions: string[] = [];
    
    predictions.forEach(prediction => {
      if (prediction.confidence > 0.8) {
        actions.push(`🤖 AUTO-EXECUTE: ${prediction.fix} (Confidence: ${(prediction.confidence * 100).toFixed(1)}%)`);
      } else if (prediction.confidence > 0.6) {
        actions.push(`🤖 AUTO-PROMPT: ${prediction.fix} (Confidence: ${(prediction.confidence * 100).toFixed(1)}%)`);
      } else {
        actions.push(`🤖 MONITOR: ${prediction.fix} (Confidence: ${(prediction.confidence * 100).toFixed(1)}%)`);
      }
    });

    return actions;
  }

  /**
   * Get flow status and metrics
   */
  public getFlowMetrics(): {
    active: boolean;
    predictions: number;
    batchFixes: number;
    confidence: number;
    status: string;
  } {
    const status = this.flowIntegration.getFlowStatus();
    
    return {
      active: status.active,
      predictions: status.predictions,
      batchFixes: status.batchFixes,
      confidence: status.confidence,
      status: this.isInitialized ? 'OPERATIONAL' : 'INITIALIZING'
    };
  }

  /**
   * Log message with level
   */
  private log(level: string, message: string): void {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const currentLevel = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);
    
    if (messageLevel <= currentLevel) {
      console.log(`[${level}] ${message}`);
    }
  }

  /**
   * Shutdown the flow controller
   */
  public async shutdown(): Promise<void> {
    this.flowIntegration.stopContinuousFlow();
    this.isInitialized = false;
    this.log('INFO', '🤖 AUTO-AGENTIC FLOW: Controller shutdown complete');
  }
}

/**
 * Default configuration for flow controller
 */
export const defaultFlowControllerConfig: FlowControllerConfig = {
  enableAutoExecution: true,
  enablePredictivePrompts: true,
  enableBatchProcessing: true,
  logLevel: 'INFO'
};

/**
 * Initialize auto-agentic flow controller
 */
export const initializeAutoAgenticFlow = (config?: Partial<FlowControllerConfig>) => {
  const finalConfig = { ...defaultFlowControllerConfig, ...config };
  return new AutoAgenticFlowController(finalConfig);
};
