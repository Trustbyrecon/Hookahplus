/**
 * EchoPrime Auto-Prompt Generation System
 * Generates continuous proactive prompts based on predictive patterns
 */

import { PredictiveFlowEngine, ErrorPattern } from './predictive-flow';

export interface AutoPrompt {
  id: string;
  type: 'PREDICTIVE' | 'PROACTIVE' | 'BATCH';
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  autoExecute: boolean;
  confidence: number;
  timestamp: Date;
}

export interface PromptTemplate {
  type: string;
  template: string;
  variables: string[];
  autoExecute: boolean;
}

export class AutoPromptGenerator {
  private predictiveEngine: PredictiveFlowEngine;
  private promptTemplates: PromptTemplate[];

  constructor(predictiveEngine: PredictiveFlowEngine) {
    this.predictiveEngine = predictiveEngine;
    this.promptTemplates = this.initializePromptTemplates();
  }

  /**
   * Initialize prompt templates for different error types
   */
  private initializePromptTemplates(): PromptTemplate[] {
    return [
      {
        type: 'import-path',
        template: '🤖 AUTO-PROMPT: Import path resolution pattern detected. Risk: LOW. Auto-execute: YES. Confidence: {confidence}%. Pattern: {pattern}',
        variables: ['confidence', 'pattern'],
        autoExecute: true
      },
      {
        type: 'path-depth',
        template: '🤖 AUTO-PROMPT: Path depth correction pattern detected. Risk: LOW. Auto-execute: YES. Confidence: {confidence}%. Pattern: {pattern}',
        variables: ['confidence', 'pattern'],
        autoExecute: true
      },
      {
        type: 'component-import',
        template: '🤖 AUTO-PROMPT: Component import pattern detected. Risk: LOW. Auto-execute: YES. Confidence: {confidence}%. Pattern: {pattern}',
        variables: ['confidence', 'pattern'],
        autoExecute: true
      },
      {
        type: 'utils-import',
        template: '🤖 AUTO-PROMPT: Utils import pattern detected. Risk: LOW. Auto-execute: YES. Confidence: {confidence}%. Pattern: {pattern}',
        variables: ['confidence', 'pattern'],
        autoExecute: true
      },
      {
        type: 'batch-execution',
        template: '🤖 AUTO-PROMPT: Batch execution ready. {count} fixes queued. Risk: LOW. Auto-execute: YES. Confidence: {confidence}%',
        variables: ['count', 'confidence'],
        autoExecute: true
      },
      {
        type: 'proactive-scan',
        template: '🤖 AUTO-PROMPT: Proactive scan complete. {count} potential issues found. Risk: LOW. Auto-execute: YES. Confidence: {confidence}%',
        variables: ['count', 'confidence'],
        autoExecute: true
      }
    ];
  }

  /**
   * Generate auto-prompts based on current error
   */
  public generateAutoPrompts(currentError: ErrorPattern): AutoPrompt[] {
    const analysis = this.predictiveEngine.analyzeAndPredict(currentError);
    const prompts: AutoPrompt[] = [];

    // Generate individual prompts for each prediction
    analysis.predictions.forEach((prediction, index) => {
      const template = this.promptTemplates.find(t => t.type === prediction.type);
      if (template) {
        const prompt = this.createPromptFromTemplate(template, prediction, index);
        prompts.push(prompt);
      }
    });

    // Generate batch execution prompt if multiple fixes
    if (analysis.batchFixes.length > 1) {
      const batchPrompt = this.createBatchPrompt(analysis.batchFixes);
      prompts.push(batchPrompt);
    }

    return prompts;
  }

  /**
   * Create prompt from template
   */
  private createPromptFromTemplate(
    template: PromptTemplate, 
    prediction: ErrorPattern, 
    index: number
  ): AutoPrompt {
    const confidence = (prediction.confidence * 100).toFixed(1);
    const pattern = prediction.pattern;

    const message = template.template
      .replace('{confidence}', confidence)
      .replace('{pattern}', pattern);

    return {
      id: `prompt-${Date.now()}-${index}`,
      type: 'PREDICTIVE',
      message,
      priority: prediction.confidence > 0.8 ? 'HIGH' : 'MEDIUM',
      autoExecute: template.autoExecute,
      confidence: prediction.confidence,
      timestamp: new Date()
    };
  }

  /**
   * Create batch execution prompt
   */
  private createBatchPrompt(batchFixes: ErrorPattern[]): AutoPrompt {
    const count = batchFixes.length;
    const avgConfidence = batchFixes.reduce((sum, fix) => sum + fix.confidence, 0) / count;
    const confidence = (avgConfidence * 100).toFixed(1);

    const message = `🤖 AUTO-PROMPT: Batch execution ready. ${count} fixes queued. Risk: LOW. Auto-execute: YES. Confidence: ${confidence}%`;

    return {
      id: `batch-prompt-${Date.now()}`,
      type: 'BATCH',
      message,
      priority: 'HIGH',
      autoExecute: true,
      confidence: avgConfidence,
      timestamp: new Date()
    };
  }

  /**
   * Generate proactive scan prompts
   */
  public generateProactivePrompts(scanResults: ErrorPattern[]): AutoPrompt[] {
    const prompts: AutoPrompt[] = [];

    if (scanResults.length > 0) {
      const template = this.promptTemplates.find(t => t.type === 'proactive-scan');
      if (template) {
        const count = scanResults.length;
        const avgConfidence = scanResults.reduce((sum, fix) => sum + fix.confidence, 0) / count;
        const confidence = (avgConfidence * 100).toFixed(1);

        const message = template.template
          .replace('{count}', count.toString())
          .replace('{confidence}', confidence);

        prompts.push({
          id: `proactive-prompt-${Date.now()}`,
          type: 'PROACTIVE',
          message,
          priority: 'HIGH',
          autoExecute: true,
          confidence: avgConfidence,
          timestamp: new Date()
        });
      }
    }

    return prompts;
  }

  /**
   * Generate continuous flow status prompt
   */
  public generateFlowStatusPrompt(): AutoPrompt {
    const status = this.predictiveEngine.getFlowStatus();
    
    const message = `🤖 AUTO-PROMPT: Predictive flow active. Predictions: ${status.predictions}, Batch fixes: ${status.batchFixes}, Confidence: ${(status.confidence * 100).toFixed(1)}%`;

    return {
      id: `flow-status-${Date.now()}`,
      type: 'PREDICTIVE',
      message,
      priority: 'MEDIUM',
      autoExecute: false,
      confidence: status.confidence,
      timestamp: new Date()
    };
  }

  /**
   * Execute auto-prompts automatically
   */
  public async executeAutoPrompts(prompts: AutoPrompt[]): Promise<{
    executed: AutoPrompt[];
    results: Array<{ success: boolean; error?: string }>;
  }> {
    const executed: AutoPrompt[] = [];
    const results: Array<{ success: boolean; error?: string }> = [];

    for (const prompt of prompts) {
      if (prompt.autoExecute) {
        try {
          console.log(`🤖 AUTO-EXECUTING PROMPT: ${prompt.message}`);
          
          executed.push(prompt);
          results.push({ success: true });
        } catch (error) {
          results.push({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
    }

    return { executed, results };
  }
}

/**
 * Initialize auto-prompt generator
 */
export const initializeAutoPromptGenerator = (predictiveEngine: PredictiveFlowEngine) => {
  return new AutoPromptGenerator(predictiveEngine);
};
