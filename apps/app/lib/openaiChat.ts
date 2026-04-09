/**
 * Minimal OpenAI Chat Completions types + fetch helpers (no openai package).
 */

export type ChatCompletionTool = {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
};

export type ChatMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };

export type ToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string | null;
      tool_calls?: ToolCall[];
    };
  }>;
  error?: { message?: string };
};

export async function openaiChatCompletions(body: Record<string, unknown>): Promise<ChatCompletionResponse> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { error: { message: 'OPENAI_API_KEY is not set' } };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as ChatCompletionResponse;
  if (!res.ok) {
    const msg = json?.error?.message || `OpenAI HTTP ${res.status}`;
    return { error: { message: msg } };
  }
  return json;
}
