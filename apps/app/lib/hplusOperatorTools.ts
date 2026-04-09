import type { ChatCompletionTool } from './openaiChat';

/** OpenAI Chat Completions tool definitions for H+ Operator (v1). */
export const HPLUS_OPERATOR_TOOLS: ChatCompletionTool[] = [
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
        'End a hookah session. Session key can be session id, external ref, or table id (resolved by API).',
      parameters: {
        type: 'object',
        properties: {
          session_id: {
            type: 'string',
            description: 'Session id, or table id if that is how staff refers to it',
          },
        },
        required: ['session_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'move_table',
      description: 'Move a session to a different table (MOVE_TABLE command).',
      parameters: {
        type: 'object',
        properties: {
          session_id: {
            type: 'string',
            description: 'Session id or table id the session is currently under',
          },
          table: { type: 'string', description: 'Destination table id, e.g. T-14' },
        },
        required: ['session_id', 'table'],
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
        'CLARK lite: look up recent sessions for a guest name in this lounge to infer preferences.',
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
        'Summarize active session count and open tables for the lounge in scope (read-only).',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];
