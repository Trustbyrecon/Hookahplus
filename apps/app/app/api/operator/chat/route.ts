import { NextRequest, NextResponse } from 'next/server';
import { HPLUS_OPERATOR_SYSTEM_PROMPT } from '../../../../lib/hplusOperatorSystemPrompt';
import { HPLUS_OPERATOR_TOOLS } from '../../../../lib/hplusOperatorTools';
import { openaiChatCompletions, type ChatMessage } from '../../../../lib/openaiChat';
import { executeOperatorTool } from '../../../../lib/operatorToolExecutor';

export const runtime = 'nodejs';

const MAX_TOOL_ROUNDS = 6;
const DEFAULT_MODEL = 'gpt-4o-mini';

type IncomingMsg = { role?: string; content?: string };

function toChatMessages(incoming: IncomingMsg[], loungeId?: string): ChatMessage[] {
  const scope =
    loungeId && loungeId.trim()
      ? `\nCurrent lounge scope (use for tools): loungeId=${loungeId.trim()}`
      : '';
  const system: ChatMessage = {
    role: 'system',
    content: HPLUS_OPERATOR_SYSTEM_PROMPT + scope,
  };
  const rest: ChatMessage[] = [];
  for (const m of incoming) {
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    const content = typeof m.content === 'string' ? m.content : '';
    if (!content.trim()) continue;
    rest.push({ role, content });
  }
  return [system, ...rest];
}

export async function POST(req: NextRequest) {
  let body: { messages?: IncomingMsg[]; loungeId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: 'OPENAI_API_KEY is not configured',
        hint: 'Set OPENAI_API_KEY in the app environment to use H+ Operator.',
      },
      { status: 503 }
    );
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const loungeId = typeof body.loungeId === 'string' ? body.loungeId : undefined;

  if (incoming.length === 0) {
    return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  let messages = toChatMessages(incoming, loungeId);
  const toolTrace: Array<{ tool: string; ok: boolean; summary?: string }> = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await openaiChatCompletions({
      model,
      messages,
      tools: HPLUS_OPERATOR_TOOLS,
      tool_choice: 'auto',
      temperature: 0.4,
    });

    if (completion.error?.message) {
      return NextResponse.json(
        { error: completion.error.message, toolTrace },
        { status: 502 }
      );
    }

    const choice = completion.choices?.[0]?.message;
    if (!choice) {
      return NextResponse.json(
        { error: 'Empty response from model', toolTrace },
        { status: 502 }
      );
    }

    const toolCalls = choice.tool_calls;
    if (!toolCalls?.length) {
      const text = choice.content?.trim() || '';
      return NextResponse.json({
        reply: text,
        toolTrace,
        model,
      });
    }

    messages.push({
      role: 'assistant',
      content: choice.content ?? null,
      tool_calls: toolCalls,
    });

    for (const tc of toolCalls) {
      if (tc.type !== 'function') continue;
      const fn = tc.function;
      let parsed: unknown = {};
      try {
        parsed = fn.arguments ? JSON.parse(fn.arguments) : {};
      } catch {
        parsed = {};
      }

      const result = await executeOperatorTool(fn.name, parsed, req, loungeId);
      toolTrace.push({
        tool: fn.name,
        ok: result.ok,
        summary: result.error || (result.ok ? 'ok' : 'failed'),
      });

      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify({
          ok: result.ok,
          error: result.error,
          data: result.data,
        }),
      });
    }
  }

  const final = await openaiChatCompletions({
    model,
    messages,
    tools: HPLUS_OPERATOR_TOOLS,
    tool_choice: 'none',
    temperature: 0.3,
  });

  if (final.error?.message) {
    return NextResponse.json(
      { error: final.error.message, toolTrace },
      { status: 502 }
    );
  }

  const reply = final.choices?.[0]?.message?.content?.trim() || 'Done.';
  return NextResponse.json({ reply, toolTrace, model });
}
