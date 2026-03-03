/**
 * Staff note validation helpers
 *
 * Goals:
 * - Keep notes short (operator rail stays fast)
 * - Reduce PII leakage risk (emails/phones in free-text)
 * - Provide simple reason codes for UX + telemetry (without logging content)
 */
export type StaffNoteValidationResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'too_long' | 'pii_detected' };

export const STAFF_NOTE_MAX_CHARS = 280;

// Heuristic PII detection (defense-in-depth; server must still avoid logging content)
const EMAIL_RE =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

// Detect long digit runs that often represent phone numbers.
// This will also match some non-PII numeric sequences, but that's acceptable for staff notes.
const PHONE_DIGITS_RE =
  /(?:\+?\d[\s().-]*){7,}\d/;

export function validateStaffNote(raw: unknown): StaffNoteValidationResult {
  if (typeof raw !== 'string') {
    return { ok: false, reason: 'empty' };
  }

  const note = raw.trim();
  if (!note) {
    return { ok: false, reason: 'empty' };
  }

  if (note.length > STAFF_NOTE_MAX_CHARS) {
    return { ok: false, reason: 'too_long' };
  }

  if (EMAIL_RE.test(note) || PHONE_DIGITS_RE.test(note)) {
    return { ok: false, reason: 'pii_detected' };
  }

  return { ok: true };
}

