export type OperatorRole = 'user' | 'assistant';

export type OperatorToolName =
  | 'resolve_session_context'
  | 'start_session'
  | 'end_session'
  | 'move_table'
  | 'suggest_upsell'
  | 'get_customer_memory'
  | 'summarize_lounge_activity';

export type OperatorToolResultStatus =
  | 'success'
  | 'needs_confirmation'
  | 'not_found'
  | 'ambiguous'
  | 'validation_error'
  | 'error';

export interface OperatorMessage {
  role: OperatorRole;
  content: string;
}

export interface OperatorConfirmation {
  required: boolean;
  actionKey: string;
  prompt: string;
  expiresAt?: string;
}

export interface OperatorToolResult<TData = unknown> {
  ok: boolean;
  tool: OperatorToolName;
  status: OperatorToolResultStatus;
  message: string;
  data?: TData;
  meta?: Record<string, unknown>;
  confirmation?: OperatorConfirmation;
  /** Human-readable audit line for logs and UI */
  auditLine?: string;
}

export interface ResolvedSessionContext {
  loungeId: string;
  sessionId?: string;
  table?: string;
  customerName?: string;
  customerRef?: string;
  active: boolean;
  confidence: 'high' | 'medium' | 'low';
  ambiguity?: string[];
}

export interface PendingOperatorAction {
  actionKey: string;
  tool: 'end_session' | 'move_table';
  args: Record<string, unknown>;
  loungeId?: string;
  createdAt: string;
}

export interface OperatorTraceEntry {
  loungeId?: string;
  model?: string;
  userMessage?: string;
  selectedTool?: string;
  toolArgs?: Record<string, unknown>;
  toolStatus?: OperatorToolResultStatus;
  assistantReply?: string;
  latencyMs?: number;
  createdAt: string;
}
