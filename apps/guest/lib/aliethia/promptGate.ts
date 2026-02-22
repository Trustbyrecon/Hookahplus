export type PromptSurface = 'timed_assist_prompts' | 'upsell_strip' | 'vip_banner';

export function getLastPromptAtMs(key: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setLastPromptAtMs(key: string, valueMs: number) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, String(valueMs));
  } catch {
    // ignore
  }
}

export function promptKey(params: { loungeId: string; surface: PromptSurface; scope?: string }) {
  const scope = params.scope ? `:${params.scope}` : '';
  return `aliethia:lastPromptAt:${params.loungeId}:${params.surface}${scope}`;
}

export function shouldFirePrompt(params: {
  nowMs: number;
  lastFiredAtMs: number | null;
  minMinutesBetweenPrompts: number;
}): boolean {
  const { nowMs, lastFiredAtMs, minMinutesBetweenPrompts } = params;
  if (!lastFiredAtMs) return true;
  const minMs = Math.max(0, minMinutesBetweenPrompts) * 60_000;
  return nowMs - lastFiredAtMs >= minMs;
}

