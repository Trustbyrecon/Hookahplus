export interface PlannedOperatorIntent {
  intent: 'start_usual_session' | 'move_then_close';
  customer_name?: string;
  table?: string;
  destination_table?: string;
}

/**
 * Lightweight keyword / pattern pass for operator chains (no LLM).
 * Prefer normal tool-calling when this returns null.
 */
export function planOperatorIntent(message: string): PlannedOperatorIntent | null {
  const text = message.toLowerCase();

  const moveMatch = /\bmove\b/.test(text);
  const closeMatch = /\b(close|after)\b/.test(text);
  const usualMatch = text.includes('usual');
  const startMatch = text.includes('start') || text.includes('back');

  const customerNameMatch = message.match(
    /\bfor\s+([A-Za-z][^\s,.]+)|\b([A-Za-z][^\s,.]+)\s+is\s+back\b/i
  );
  const tableMatches = [...message.matchAll(/\btable\s+(\S+)/gi)].map((m) =>
    m[1].replace(/[.,!?]+$/, '')
  );
  const toTableMatch = message.match(/\bto\s+table\s+(\S+)/i);
  const fromTableMatch = message.match(/\bfrom\s+table\s+(\S+)/i);

  const customer_name =
    customerNameMatch?.[1]?.trim() || customerNameMatch?.[2]?.trim() || undefined;

  if (usualMatch && startMatch) {
    return {
      intent: 'start_usual_session',
      customer_name,
      table: tableMatches[0],
    };
  }

  if (moveMatch && closeMatch) {
    const destination_table =
      toTableMatch?.[1]?.replace(/[.,!?]+$/, '') ||
      (tableMatches.length >= 2 ? tableMatches[1] : tableMatches[0]);

    const table =
      fromTableMatch?.[1]?.replace(/[.,!?]+$/, '') ||
      (tableMatches.length >= 2 ? tableMatches[0] : undefined);

    return {
      intent: 'move_then_close',
      customer_name,
      table,
      destination_table,
    };
  }

  return null;
}
