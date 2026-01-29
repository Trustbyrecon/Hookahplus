import { z } from 'zod';
import { getOpenAIKey, getOpenAIModel } from '../env';

type OpenAIChatMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string };

type CallOpenAIJsonParams<T> = {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  model?: string;
  timeoutMs?: number;
};

const OpenAIChatResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable(),
      }),
    })
  ),
});

export async function callOpenAIJson<T>(params: CallOpenAIJsonParams<T>): Promise<{
  ok: true;
  data: T;
  model: string;
  latencyMs: number;
} | {
  ok: false;
  error: string;
  model: string;
  latencyMs: number;
}> {
  const key = getOpenAIKey();
  const model = params.model || getOpenAIModel();

  if (!key) {
    return { ok: false, error: 'OPENAI_API_KEY not configured', model, latencyMs: 0 };
  }

  const started = Date.now();
  const messages: OpenAIChatMessage[] = [
    { role: 'system', content: params.system },
    { role: 'user', content: params.user },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs ?? 12_000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages,
      }),
      signal: controller.signal,
    });

    const latencyMs = Date.now() - started;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        error: `OpenAI HTTP ${res.status}: ${text || res.statusText}`,
        model,
        latencyMs,
      };
    }

    const json = await res.json();
    const parsed = OpenAIChatResponseSchema.safeParse(json);
    if (!parsed.success) {
      return { ok: false, error: 'OpenAI response shape invalid', model, latencyMs };
    }

    const content = parsed.data.choices?.[0]?.message?.content || '';
    const trimmed = content.trim();
    const rawJson = extractFirstJsonObject(trimmed) ?? trimmed;

    let obj: unknown;
    try {
      obj = JSON.parse(rawJson);
    } catch {
      return { ok: false, error: 'Model did not return valid JSON', model, latencyMs };
    }

    const validated = params.schema.safeParse(obj);
    if (!validated.success) {
      return {
        ok: false,
        error: `JSON schema validation failed: ${validated.error.message}`,
        model,
        latencyMs,
      };
    }

    return { ok: true, data: validated.data, model, latencyMs };
  } catch (e: any) {
    const latencyMs = Date.now() - started;
    const msg = e?.name === 'AbortError' ? 'OpenAI request timed out' : (e?.message || 'OpenAI request failed');
    return { ok: false, error: msg, model, latencyMs };
  } finally {
    clearTimeout(timeout);
  }
}

function extractFirstJsonObject(text: string): string | null {
  // Best-effort extraction if model wraps JSON in prose or code fences.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) return fenceMatch[1].trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return null;
}

