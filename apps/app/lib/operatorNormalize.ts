/** Normalize operator table references to Hookah+ tableId strings (e.g. "3" → "T-3"). */
export function normalizeTableId(raw: string): string {
  const t = raw.trim();
  if (!t) return 'UNASSIGNED';
  const digits = t.replace(/^table\s*/i, '').replace(/^t-?/i, '').trim();
  if (/^\d+$/.test(digits)) return `T-${digits}`;
  return t;
}
