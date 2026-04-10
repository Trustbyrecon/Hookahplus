import { NextRequest, NextResponse } from 'next/server';
import { HPLUS_OPERATOR_SYSTEM_PROMPT } from '../../../../lib/hplusOperatorSystemPrompt';
import { HPLUS_OPERATOR_TOOLS } from '../../../../lib/hplusOperatorTools';
import { openaiChatCompletions, type ChatMessage } from '../../../../lib/openaiChat';
import {
  executeMoveThenCloseChain,
  executeStartUsualChain,
  getUsualFlavorsForCustomer,
} from '../../../../lib/operatorChainExecutor';
import { resolveSessionContext } from '../../../../lib/operatorContextResolver';
import { resolveOperatorActorContext } from '../../../../lib/operatorActorContext';
import { planOperatorIntent } from '../../../../lib/operatorIntentPlanner';
import { executeOperatorTool } from '../../../../lib/operatorToolExecutor';
import { executePendingOperatorAction } from '../../../../lib/operatorPendingExecution';
import { logOperatorTrace } from '../../../../lib/operatorTraceLogger';
import type { OperatorToolResult } from '../../../../lib/operatorTypes';

export const runtime = 'nodejs';

const MAX_TOOL_ROUNDS = 6;
const DEFAULT_MODEL = 'gpt-4o-mini';

type IncomingMsg = { role?: string; content?: string };

export type OperatorToolTraceEntry = {
  tool: string;
  ok: boolean;
  status: string;
  message: string;
  auditLine?: string;
  confirmation?: OperatorToolResult['confirmation'];
};

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

function serializeToolResult(result: OperatorToolResult): string {
  return JSON.stringify({
    ok: result.ok,
    status: result.status,
    tool: result.tool,
    message: result.message,
    data: result.data,
    meta: result.meta,
    confirmation: result.confirmation,
    auditLine: result.auditLine,
  });
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  let body: {
    messages?: IncomingMsg[];
    loungeId?: string;
    confirmedActionKey?: string | null;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const loungeId = typeof body.loungeId === 'string' ? body.loungeId : undefined;
  const confirmedKey =
    typeof body.confirmedActionKey === 'string' && body.confirmedActionKey.trim()
      ? body.confirmedActionKey.trim()
      : null;

  if (confirmedKey) {
    const result = await executePendingOperatorAction(confirmedKey, req);
    const toolTrace: OperatorToolTraceEntry[] = [
      {
        tool: result.tool,
        ok: result.ok,
        status: result.status,
        message: result.message,
        auditLine: result.auditLine,
      },
    ];
    logOperatorTrace({
      loungeId,
      toolStatus: result.status,
      assistantReply: result.message,
      latencyMs: Date.now() - started,
    });
    return NextResponse.json({
      reply: result.message,
      toolTrace,
      pendingConfirmation: null,
      model: 'confirm',
      result,
    });
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
  if (incoming.length === 0) {
    return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
  }

  const lastUser = [...incoming].reverse().find((m) => m.role === 'user' && m.content?.trim());
  const userMessage = typeof lastUser?.content === 'string' ? lastUser.content.trim() : undefined;

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const operatorActor = await resolveOperatorActorContext(req);

  const effectiveLounge = (loungeId || '').trim();
  const plannedUserMessage =
    typeof lastUser?.content === 'string' ? lastUser.content.trim() : '';

  if (effectiveLounge && plannedUserMessage) {
    const plannedIntent = planOperatorIntent(plannedUserMessage);

    if (plannedIntent?.intent === 'move_then_close') {
      const resolved = await resolveSessionContext({
        loungeId: effectiveLounge,
        table: plannedIntent.table,
        customer_name: plannedIntent.customer_name,
        customer_ref: plannedIntent.customer_name,
      });

      const dest = plannedIntent.destination_table?.trim();
      if (!('error' in resolved) && resolved.sessionId && dest) {
        const chainResult = await executeMoveThenCloseChain({
          actor: operatorActor,
          loungeId: effectiveLounge,
          sessionId: resolved.sessionId,
          fromTable: resolved.table,
          destinationTable: dest,
          confidence: resolved.confidence,
          customerRef: resolved.customerRef,
        });

        const chainTrace: OperatorToolTraceEntry[] = [
          {
            tool: chainResult.tool,
            ok: chainResult.ok,
            status: chainResult.status,
            message: chainResult.message,
            auditLine: chainResult.auditLine,
            confirmation: chainResult.confirmation,
          },
        ];

        const pendingConfirmation =
          chainResult.status === 'needs_confirmation' && chainResult.confirmation
            ? {
                actionKey: chainResult.confirmation.actionKey,
                prompt: chainResult.confirmation.prompt,
                tool: chainResult.tool,
              }
            : null;

        logOperatorTrace({
          loungeId,
          model: 'operator-chain',
          userMessage: plannedUserMessage,
          assistantReply: chainResult.message,
          latencyMs: Date.now() - started,
        });

        return NextResponse.json({
          reply: chainResult.message,
          toolTrace: chainTrace,
          pendingConfirmation,
          model: 'operator-chain',
          result: chainResult,
        });
      }
    }

    if (plannedIntent?.intent === 'start_usual_session') {
      const resolved = await resolveSessionContext({
        loungeId: effectiveLounge,
        customer_name: plannedIntent.customer_name,
        customer_ref: plannedIntent.customer_name,
      });

      const confidence = !('error' in resolved) ? resolved.confidence : 'medium';

      if (plannedIntent.table && plannedIntent.customer_name && !('error' in resolved)) {
        const chainResult = await executeStartUsualChain({
          actor: operatorActor,
          loungeId: effectiveLounge,
          customerName: plannedIntent.customer_name,
          table: plannedIntent.table,
          confidence,
          startSessionFromUsual: async () => {
            const flavors = await getUsualFlavorsForCustomer(
              effectiveLounge,
              plannedIntent.customer_name!
            );
            const result = await executeOperatorTool(
              'start_session',
              {
                table: plannedIntent.table,
                flavors,
                customer_name: plannedIntent.customer_name,
              },
              req,
              loungeId,
              operatorActor
            );
            return {
              ok: result.ok,
              message: result.message,
              flavors,
            };
          },
          suggestUpsell: async () => {
            const flavors = await getUsualFlavorsForCustomer(
              effectiveLounge,
              plannedIntent.customer_name!
            );
            const result = await executeOperatorTool(
              'suggest_upsell',
              { flavors },
              req,
              loungeId,
              operatorActor
            );
            return result.ok ? result.message : null;
          },
        });

        if (chainResult.ok) {
          const chainTrace: OperatorToolTraceEntry[] = [
            {
              tool: chainResult.tool,
              ok: chainResult.ok,
              status: chainResult.status,
              message: chainResult.message,
              auditLine: chainResult.auditLine,
              confirmation: chainResult.confirmation,
            },
          ];
          logOperatorTrace({
            loungeId,
            model: 'operator-chain',
            userMessage: plannedUserMessage,
            assistantReply: chainResult.message,
            latencyMs: Date.now() - started,
          });
          return NextResponse.json({
            reply: chainResult.message,
            toolTrace: chainTrace,
            pendingConfirmation: null,
            model: 'operator-chain',
            result: chainResult,
          });
        }
      }
    }
  }

  let messages = toChatMessages(incoming, loungeId);
  const toolTrace: OperatorToolTraceEntry[] = [];
  let pendingConfirmation: {
    actionKey: string;
    prompt: string;
    tool: string;
  } | null = null;

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
      logOperatorTrace({
        loungeId,
        model,
        userMessage,
        assistantReply: text,
        latencyMs: Date.now() - started,
      });
      return NextResponse.json({
        reply: text,
        toolTrace,
        pendingConfirmation,
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

      const result = await executeOperatorTool(fn.name, parsed, req, loungeId, operatorActor);
      toolTrace.push({
        tool: result.tool,
        ok: result.ok,
        status: result.status,
        message: result.message,
        auditLine: result.auditLine,
        confirmation: result.confirmation,
      });

      if (result.status === 'needs_confirmation' && result.confirmation && !pendingConfirmation) {
        pendingConfirmation = {
          actionKey: result.confirmation.actionKey,
          prompt: result.confirmation.prompt,
          tool: result.tool,
        };
      }

      logOperatorTrace({
        loungeId,
        model,
        userMessage,
        selectedTool: result.tool,
        toolArgs: parsed as Record<string, unknown>,
        toolStatus: result.status,
        latencyMs: Date.now() - started,
      });

      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: serializeToolResult(result),
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
  logOperatorTrace({
    loungeId,
    model,
    userMessage,
    assistantReply: reply,
    latencyMs: Date.now() - started,
  });
  return NextResponse.json({ reply, toolTrace, pendingConfirmation, model });
}
