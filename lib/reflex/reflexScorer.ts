import type { ReflexScore, FailureType, EnrichmentFingerprint } from '../../types/reflex';
import { calculateCompositeScore } from './scoreGate';

interface ScorerInput {
  output: string | object | null;
  expectedType?: 'text' | 'json' | 'code' | 'tool';
  context?: string;
  previousOutputs?: string[];
  domain?: string;
}

/**
 * Analyzes output and generates a comprehensive Reflex Score
 * @param input The input to analyze
 * @returns A detailed reflex score
 */
export function scoreOutput(input: ScorerInput): ReflexScore {
  const { output, expectedType, context, previousOutputs, domain } = input;
  
  // Handle blank output
  if (!output || (typeof output === 'string' && output.trim() === '')) {
    return {
      value: 0,
      components: {
        semanticDensity: 0,
        relevance: 0,
        structure: 0,
        memoryConsistency: 0
      },
      failureType: 'blank',
      confidence: 1.0,
      downstreamRisk: 0.8
    };
  }
  
  // Convert output to string for analysis
  const outputStr = typeof output === 'string' ? output : JSON.stringify(output, null, 2);
  
  // Calculate individual components
  const semanticDensity = calculateSemanticDensity(outputStr);
  const relevance = calculateRelevance(outputStr, context, domain);
  const structure = calculateStructure(outputStr, expectedType);
  const memoryConsistency = calculateMemoryConsistency(outputStr, previousOutputs);
  
  // Calculate composite score
  const value = calculateCompositeScore({
    semanticDensity,
    relevance,
    structure,
    memoryConsistency
  });
  
  // Determine failure type if score is low
  let failureType: FailureType | undefined;
  if (value < 0.87) {
    failureType = determineFailureType(outputStr, expectedType, semanticDensity, relevance, structure);
  }
  
  // Calculate confidence in our scoring
  const confidence = calculateScoringConfidence(semanticDensity, relevance, structure);
  
  // Estimate downstream risk
  const downstreamRisk = calculateDownstreamRisk(value, failureType, structure);
  
  return {
    value,
    components: {
      semanticDensity,
      relevance,
      structure,
      memoryConsistency
    },
    failureType,
    confidence,
    downstreamRisk
  };
}

/**
 * Calculate semantic density (specificity and detail level)
 */
function calculateSemanticDensity(output: string): number {
  const words = output.split(/\s+/).length;
  const sentences = output.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / Math.max(sentences, 1);
  
  // Higher density = more specific, detailed output
  // Penalize very short outputs, reward detailed ones
  if (words < 5) return 0.1;
  if (words < 10) return 0.3;
  if (words < 20) return 0.5;
  if (words < 50) return 0.7;
  if (words < 100) return 0.8;
  if (words < 200) return 0.9;
  return 1.0;
}

/**
 * Calculate relevance to context and domain
 */
function calculateRelevance(output: string, context?: string, domain?: string): number {
  if (!context && !domain) return 0.5; // Neutral if no context
  
  let relevance = 0.5;
  
  // Check for domain-specific keywords
  if (domain) {
    const domainKeywords = getDomainKeywords(domain);
    const domainMatches = domainKeywords.filter(keyword => 
      output.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    relevance += (domainMatches / domainKeywords.length) * 0.3;
  }
  
  // Check for context relevance
  if (context) {
    const contextWords = context.toLowerCase().split(/\s+/);
    const outputWords = output.toLowerCase().split(/\s+/);
    const contextMatches = contextWords.filter(word => 
      outputWords.some(outputWord => outputWord.includes(word) || word.includes(outputWord))
    ).length;
    relevance += (contextMatches / contextWords.length) * 0.2;
  }
  
  return Math.min(relevance, 1.0);
}

/**
 * Calculate structural quality
 */
function calculateStructure(output: string, expectedType?: string): number {
  if (expectedType === 'json') {
    try {
      JSON.parse(output);
      return 1.0; // Valid JSON
    } catch {
      return 0.1; // Invalid JSON
    }
  }
  
  if (expectedType === 'code') {
    // Basic code structure checks
    const hasIndentation = /^\s+/.test(output);
    const hasKeywords = /\b(function|const|let|var|if|for|while|return)\b/.test(output);
    const hasSemicolons = output.includes(';');
    const hasBrackets = /[{}]/.test(output);
    
    let score = 0;
    if (hasIndentation) score += 0.25;
    if (hasKeywords) score += 0.25;
    if (hasSemicolons) score += 0.25;
    if (hasBrackets) score += 0.25;
    
    return score;
  }
  
  // For text output, check basic structure
  const hasPunctuation = /[.!?]/.test(output);
  const hasCapitalization = /[A-Z]/.test(output);
  const hasReasonableLength = output.length > 10 && output.length < 1000;
  
  let score = 0;
  if (hasPunctuation) score += 0.4;
  if (hasCapitalization) score += 0.3;
  if (hasReasonableLength) score += 0.3;
  
  return score;
}

/**
 * Calculate memory consistency with previous outputs
 */
function calculateMemoryConsistency(output: string, previousOutputs?: string[]): number {
  if (!previousOutputs || previousOutputs.length === 0) return 0.5; // Neutral if no history
  
  // Check for consistency in style, terminology, and approach
  const currentWords = output.toLowerCase().split(/\s+/);
  let consistencyScore = 0;
  
  for (const prevOutput of previousOutputs) {
    const prevWords = prevOutput.toLowerCase().split(/\s+/);
    const commonWords = currentWords.filter(word => prevWords.includes(word));
    consistencyScore += commonWords.length / Math.max(currentWords.length, prevWords.length);
  }
  
  return Math.min(consistencyScore / previousOutputs.length, 1.0);
}

/**
 * Determine the specific type of failure
 */
function determineFailureType(
  output: string, 
  expectedType?: string, 
  semanticDensity: number, 
  relevance: number, 
  structure: number
): FailureType {
  if (semanticDensity < 0.3) return 'vague';
  if (relevance < 0.3) return 'context_drift';
  if (structure < 0.3) return 'serialization_error';
  if (expectedType === 'json' && !isValidJSON(output)) return 'function_mismatch';
  if (expectedType === 'code' && !isValidCode(output)) return 'function_mismatch';
  
  return 'vague'; // Default fallback
}

/**
 * Calculate confidence in our scoring
 */
function calculateScoringConfidence(semanticDensity: number, relevance: number, structure: number): number {
  // Higher confidence when components are more extreme (very high or very low)
  const variance = Math.abs(semanticDensity - 0.5) + Math.abs(relevance - 0.5) + Math.abs(structure - 0.5);
  return Math.min(variance / 1.5, 1.0);
}

/**
 * Calculate downstream risk
 */
function calculateDownstreamRisk(value: number, failureType?: FailureType, structure: number): number {
  let risk = 1 - value; // Base risk inversely related to score
  
  // Increase risk for certain failure types
  if (failureType === 'serialization_error' || failureType === 'function_mismatch') {
    risk += 0.3;
  }
  
  if (failureType === 'privacy_breach' || failureType === 'guardrail_breach') {
    risk += 0.5;
  }
  
  // Increase risk for poor structure
  if (structure < 0.5) {
    risk += 0.2;
  }
  
  return Math.min(risk, 1.0);
}

/**
 * Get domain-specific keywords for relevance checking
 */
function getDomainKeywords(domain: string): string[] {
  const domainMap: Record<string, string[]> = {
    'hookah': ['hookah', 'shisha', 'flavor', 'session', 'lounge', 'tobacco', 'coal', 'bowl'],
    'payment': ['payment', 'stripe', 'charge', 'transaction', 'billing', 'invoice', 'receipt'],
    'user': ['user', 'customer', 'guest', 'session', 'profile', 'account', 'login'],
    'api': ['api', 'endpoint', 'route', 'request', 'response', 'status', 'error'],
    'ui': ['component', 'button', 'form', 'input', 'display', 'render', 'layout']
  };
  
  return domainMap[domain.toLowerCase()] || [];
}

/**
 * Check if output is valid JSON
 */
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if output looks like valid code
 */
function isValidCode(str: string): boolean {
  const codeIndicators = [
    /\b(function|const|let|var|if|for|while|return)\b/,
    /[{}]/, // Braces
    /[;]/, // Semicolons
    /\/\*.*\*\//, // Block comments
    /\/\/.*$/, // Line comments
  ];
  
  return codeIndicators.some(pattern => pattern.test(str));
}

/**
 * Generate an enrichment fingerprint for an output
 */
export function generateFingerprint(
  output: string | object,
  domain?: string,
  reliability: number = 0.5
): EnrichmentFingerprint {
  const outputStr = typeof output === 'string' ? output : JSON.stringify(output);
  
  return {
    outputType: typeof output === 'object' ? 'json' : 'text',
    signal: calculateSemanticDensity(outputStr),
    domainMatch: domain ? calculateRelevance(outputStr, undefined, domain) : 0.5,
    reliability
  };
}
