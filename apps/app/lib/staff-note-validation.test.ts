import { describe, expect, it } from "vitest";
import { STAFF_NOTE_MAX_CHARS, validateStaffNote } from "./staff-note-validation";

describe("validateStaffNote", () => {
  it("accepts a short non-PII note", () => {
    expect(validateStaffNote("Great service, replaced coals once.")).toEqual({ ok: true });
  });

  it("rejects empty/whitespace", () => {
    expect(validateStaffNote("   ")).toEqual({ ok: false, reason: "empty" });
  });

  it("rejects too-long notes", () => {
    const long = "a".repeat(STAFF_NOTE_MAX_CHARS + 1);
    expect(validateStaffNote(long)).toEqual({ ok: false, reason: "too_long" });
  });

  it("rejects email addresses", () => {
    expect(validateStaffNote("Email john@example.com about lost item")).toEqual({
      ok: false,
      reason: "pii_detected",
    });
  });

  it("rejects phone-like digit runs", () => {
    expect(validateStaffNote("Call 555-123-4567 if needed")).toEqual({
      ok: false,
      reason: "pii_detected",
    });
  });
});

