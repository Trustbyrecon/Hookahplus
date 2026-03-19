/**
 * CODIGO entry intent — preserved across trust gates (/join, /privacy) then consumed by /codigo/resolve.
 * Query example: /codigo/join?intent=party&partyId=TB-A1-778&host=Clark&section=Terminal+B&tableId=T-012&loungeId=CODIGO
 */

export type CodigoIntentKind = 'party' | 'preorder' | 'table' | 'guest';

export type CodigoEntryIntent = {
  intent: CodigoIntentKind;
  partyId?: string;
  tableId?: string;
  preorderId?: string;
  hostMemberId?: string;
  hostName?: string;
  section?: string;
  loungeId?: string;
  guestsJoined?: string;
};

export const CODIGO_INTENT_STORAGE_KEY = 'hp_codigo_entry_intent_v1';

function emptyIntent(): CodigoEntryIntent {
  return { intent: 'guest' };
}

/** Parse supported params from a URLSearchParams (client). */
/** True if any parsed field is non-empty (use before merging into sessionStorage). */
export function codigoIntentPatchHasValues(patch: Partial<CodigoEntryIntent>): boolean {
  return Object.values(patch).some((v) => v !== undefined && v !== null && String(v).trim() !== '');
}

export function intentFromSearchParams(sp: URLSearchParams): Partial<CodigoEntryIntent> {
  const get = (k: string) => (sp.get(k) || '').trim() || undefined;
  const raw: Partial<CodigoEntryIntent> = {};
  const intentRaw = get('intent');
  if (intentRaw) raw.intent = intentRaw as CodigoIntentKind;
  raw.partyId = get('partyId');
  raw.tableId = get('tableId');
  raw.preorderId = get('preorderId');
  raw.hostMemberId = get('hostMemberId');
  raw.hostName = get('hostName') || get('host');
  raw.section = get('section');
  raw.loungeId = get('loungeId');
  raw.guestsJoined = get('guestsJoined');
  return raw;
}

export function readStoredCodigoIntent(): Partial<CodigoEntryIntent> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CODIGO_INTENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CodigoEntryIntent>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStoredCodigoIntent(patch: Partial<CodigoEntryIntent>) {
  if (typeof window === 'undefined') return;
  const prev = readStoredCodigoIntent() || {};
  sessionStorage.setItem(CODIGO_INTENT_STORAGE_KEY, JSON.stringify({ ...prev, ...patch }));
}

export function clearStoredCodigoIntent() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CODIGO_INTENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Merge URL over storage; infer intent kind when missing. Explicit `intent` always wins. */
export function resolveCodigoIntent(
  stored: Partial<CodigoEntryIntent> | null,
  url: Partial<CodigoEntryIntent>
): CodigoEntryIntent {
  const m: Record<string, string | undefined> = { ...(stored || {}), ...url };
  const raw = String(m.intent || '').toLowerCase();

  let kind: CodigoIntentKind = 'guest';
  if (raw === 'preorder') {
    kind = 'preorder';
  } else if (raw === 'party') {
    kind = 'party';
  } else if (raw === 'table' && m.tableId) {
    kind = 'table';
  } else if (raw === 'guest') {
    kind = 'guest';
  } else if (m.partyId || m.hostName || m.hostMemberId) {
    kind = 'party';
  } else if (m.preorderId) {
    kind = 'preorder';
  }

  return {
    intent: kind,
    partyId: m.partyId,
    tableId: m.tableId,
    preorderId: m.preorderId,
    hostMemberId: m.hostMemberId,
    hostName: m.hostName,
    section: m.section,
    loungeId: m.loungeId || 'CODIGO',
    guestsJoined: m.guestsJoined,
  };
}

/** Serialize intent back to query string (for navigation). */
export function intentToSearchParams(intent: CodigoEntryIntent): string {
  const p = new URLSearchParams();
  p.set('intent', intent.intent);
  if (intent.partyId) p.set('partyId', intent.partyId);
  if (intent.tableId) p.set('tableId', intent.tableId);
  if (intent.preorderId) p.set('preorderId', intent.preorderId);
  if (intent.hostMemberId) p.set('hostMemberId', intent.hostMemberId);
  if (intent.hostName) p.set('hostName', intent.hostName);
  if (intent.section) p.set('section', intent.section);
  if (intent.loungeId) p.set('loungeId', intent.loungeId);
  if (intent.guestsJoined) p.set('guestsJoined', intent.guestsJoined);
  return p.toString();
}

export function appendIntentToPath(path: string, intent: CodigoEntryIntent): string {
  const q = intentToSearchParams(intent);
  if (!q) return path;
  return path.includes('?') ? `${path}&${q}` : `${path}?${q}`;
}
