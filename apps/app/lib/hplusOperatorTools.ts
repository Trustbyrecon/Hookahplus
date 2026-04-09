import type { ChatCompletionTool } from './openaiChat';

/** OpenAI Chat Completions tool definitions for H+ Operator (v2). */
export const HPLUS_OPERATOR_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'resolve_session_context',
      description:
        'Resolve a table, customer, or session reference into lounge-scoped context before risky actions. Read-only.',
      parameters: {
        type: 'object',
        properties: {
          loungeId: { type: 'string', description: 'Override lounge (usually omitted; scope comes from UI)' },
          session_id: { type: 'string' },
          table: { type: 'string', description: 'Table label or id, e.g. 3, T-5, patio' },
          customer_name: { type: 'string' },
          customer_ref: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'start_session',
      description:
        'Start a new hookah session for a table. Creates a session via POST /api/sessions (walk-in).',
      parameters: {
        type: 'object',
        properties: {
          table: { type: 'string', description: 'Table id or label, e.g. "3", "T-5", "T-14"' },
          flavors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Flavor names for the mix',
          },
          customer_name: { type: 'string', description: 'Guest display name (optional)' },
          notes: { type: 'string', description: 'Staff notes (optional)' },
        },
        required: ['table', 'flavors'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'end_session',
      description:
        'Request to end a session. Requires staff confirmation in the UI. Pass session_id OR table OR customer to resolve.',
      parameters: {
        type: 'object',
        properties: {
          session_id: { type: 'string', description: 'Direct session id if known' },
          table: { type: 'string', description: 'Table to resolve an active session' },
          customer_name: { type: 'string' },
          customer_ref: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'move_table',
      description:
        'Request to move a session to another table (MOVE_TABLE). Requires confirmation. Resolve source by session_id OR table OR customer; destination is destination_table.',
      parameters: {
        type: 'object',
        properties: {
          session_id: { type: 'string' },
          table: { type: 'string', description: 'Current / source table if resolving by table' },
          from_table: { type: 'string' },
          destination_table: { type: 'string', description: 'Target table id or label' },
          customer_name: { type: 'string' },
          customer_ref: { type: 'string' },
        },
        required: ['destination_table'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_upsell',
      description: 'Return upsell and premium ideas based on current flavors (no payment).',
      parameters: {
        type: 'object',
        properties: {
          flavors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Current flavors in the mix',
          },
        },
        required: ['flavors'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_customer_memory',
      description:
        'CLARK: look up saved rollup + recent sessions for a guest name in this lounge.',
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string', description: 'Guest name to match' },
        },
        required: ['customer_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'summarize_lounge_activity',
      description:
        'Summarize active session count and recent activity for the lounge in scope (read-only).',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];
