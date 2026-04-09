import { logger } from './logger';
import type { OperatorTraceEntry, OperatorToolResultStatus } from './operatorTypes';

export function logOperatorTrace(entry: {
  loungeId?: string;
  model?: string;
  userMessage?: string;
  selectedTool?: string;
  toolArgs?: Record<string, unknown>;
  toolStatus?: OperatorToolResultStatus;
  assistantReply?: string;
  latencyMs?: number;
}): void {
  const row: OperatorTraceEntry = {
    ...entry,
    createdAt: new Date().toISOString(),
  };
  try {
    logger.info('[H+ Operator] trace', { operatorTrace: row });
  } catch {
    console.log('[H+ Operator Trace]', row);
  }
}
