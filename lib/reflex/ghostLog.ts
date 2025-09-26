import type { ReflexEvent, TrustGraphNode } from '../../types/reflex';

interface GhostLogConfig {
  enabled: boolean;
  transport: 'console' | 'file' | 'api' | 'supabase';
  endpoint?: string;
  apiKey?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const defaultConfig: GhostLogConfig = {
  enabled: true,
  transport: 'console',
  logLevel: 'info'
};

let config: GhostLogConfig = { ...defaultConfig };

/**
 * Configure the GhostLog emitter
 * @param newConfig Configuration options
 */
export function configureGhostLog(newConfig: Partial<GhostLogConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Emit a reflex event to the GhostLog
 * @param event The reflex event to log
 */
export function ghostLog(event: ReflexEvent): void {
  if (!config.enabled) return;
  
  try {
    const logEntry = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      source: 'reflex-layer',
      version: '1.0'
    };
    
    switch (config.transport) {
      case 'console':
        console.info('[GhostLog]', JSON.stringify(logEntry, null, 2));
        break;
        
      case 'file':
        // In a real implementation, this would write to a file
        console.info('[GhostLog-File]', JSON.stringify(logEntry));
        break;
        
      case 'api':
        if (config.endpoint) {
          // In a real implementation, this would POST to an API
          console.info('[GhostLog-API]', JSON.stringify(logEntry));
        }
        break;
        
      case 'supabase':
        // In a real implementation, this would insert into Supabase
        console.info('[GhostLog-Supabase]', JSON.stringify(logEntry));
        break;
    }
  } catch (error) {
    console.error('[GhostLog-Error]', 'Failed to emit log entry:', error);
  }
}

/**
 * Emit a generic event to the GhostLog
 * @param event Generic event object
 */
export function ghostLogGeneric(event: Record<string, unknown>): void {
  if (!config.enabled) return;
  
  try {
    const logEntry = {
      ...event,
      timestamp: new Date().toISOString(),
      source: 'reflex-layer',
      version: '1.0'
    };
    
    console.info('[GhostLog]', JSON.stringify(logEntry, null, 2));
  } catch (error) {
    console.error('[GhostLog-Error]', 'Failed to emit generic log entry:', error);
  }
}

/**
 * Log a failure event with automatic fingerprinting
 * @param route The route where the failure occurred
 * @param action The action that failed
 * @param failureType The type of failure
 * @param score The reflex score at time of failure
 * @param additionalContext Additional context about the failure
 */
export function logFailure(
  route: string,
  action: string,
  failureType: string,
  score: number,
  additionalContext?: Record<string, unknown>
): void {
  const event: ReflexEvent = {
    route,
    action,
    score,
    failureType: failureType as any,
    outcome: score < 0.87 ? 'halt' : 'recover',
    fingerprint: {
      outputType: 'text',
      signal: 0.1, // Low signal for failures
      domainMatch: 0.5,
      reliability: score
    },
    timestamp: new Date().toISOString(),
    severity: score < 0.7 ? 'critical' : score < 0.87 ? 'medium' : 'low',
    ...additionalContext
  };
  
  ghostLog(event);
}

/**
 * Log a successful operation
 * @param route The route where the success occurred
 * @param action The action that succeeded
 * @param score The reflex score
 * @param additionalContext Additional context about the success
 */
export function logSuccess(
  route: string,
  action: string,
  score: number,
  additionalContext?: Record<string, unknown>
): void {
  const event: ReflexEvent = {
    route,
    action,
    score,
    outcome: 'proceed',
    fingerprint: {
      outputType: 'text',
      signal: 0.9, // High signal for successes
      domainMatch: 0.9,
      reliability: score
    },
    timestamp: new Date().toISOString(),
    severity: 'low',
    ...additionalContext
  };
  
  ghostLog(event);
}

/**
 * Update the trust graph with a new node or update existing node
 * @param node The trust graph node to update
 */
export function updateTrustGraph(node: TrustGraphNode): void {
  ghostLogGeneric({
    type: 'trust_graph_update',
    node,
    timestamp: new Date().toISOString()
  });
}

/**
 * Log a repair action
 * @param route The route being repaired
 * @param action The repair action taken
 * @param success Whether the repair was successful
 * @param details Additional details about the repair
 */
export function logRepair(
  route: string,
  action: string,
  success: boolean,
  details?: Record<string, unknown>
): void {
  ghostLogGeneric({
    type: 'repair_action',
    route,
    action,
    success,
    details,
    timestamp: new Date().toISOString()
  });
}

/**
 * Get the current GhostLog configuration
 * @returns The current configuration
 */
export function getGhostLogConfig(): GhostLogConfig {
  return { ...config };
}
