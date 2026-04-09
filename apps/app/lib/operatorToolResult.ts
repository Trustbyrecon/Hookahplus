import type {
  OperatorConfirmation,
  OperatorToolName,
  OperatorToolResult,
  OperatorToolResultStatus,
} from './operatorTypes';

export function operatorSuccess<TData>(
  tool: OperatorToolName,
  message: string,
  data?: TData,
  meta?: Record<string, unknown>,
  auditLine?: string
): OperatorToolResult<TData> {
  return {
    ok: true,
    tool,
    status: 'success',
    message,
    data,
    meta,
    auditLine: auditLine ?? message,
  };
}

export function operatorFail(
  tool: OperatorToolName,
  status: Exclude<OperatorToolResultStatus, 'success' | 'needs_confirmation'>,
  message: string,
  meta?: Record<string, unknown>,
  auditLine?: string
): OperatorToolResult {
  return {
    ok: false,
    tool,
    status,
    message,
    meta,
    auditLine: auditLine ?? message,
  };
}

export function operatorNeedsConfirmation(
  tool: 'end_session' | 'move_table',
  message: string,
  confirmation: OperatorConfirmation,
  meta?: Record<string, unknown>,
  auditLine?: string
): OperatorToolResult {
  return {
    ok: false,
    tool,
    status: 'needs_confirmation',
    message,
    meta,
    confirmation,
    auditLine: auditLine ?? message,
  };
}
