"use client";

import React, { useMemo, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import Card from "./Card";
import { STAFF_NOTE_MAX_CHARS, validateStaffNote } from "../lib/staff-note-validation";

type Role = "BOH" | "FOH" | "MANAGER" | "ADMIN";

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  userRole: Role;
  operatorId: string;
  refreshSessions?: () => void | Promise<void>;
}

function notify(message: string, kind: "success" | "warning" | "error" = "success") {
  const colors =
    kind === "success"
      ? "bg-green-600"
      : kind === "warning"
      ? "bg-yellow-600"
      : "bg-red-600";

  const el = document.createElement("div");
  el.className = `fixed top-4 right-4 ${colors} text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md`;
  el.style.whiteSpace = "pre-line";
  el.textContent = message;
  document.body.appendChild(el);

  setTimeout(() => {
    el.classList.add("opacity-0", "transition-opacity", "duration-300");
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

export default function CloseSessionModal({
  isOpen,
  onClose,
  sessionId,
  userRole,
  operatorId,
  refreshSessions,
}: CloseSessionModalProps) {
  const [note, setNote] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const trimmed = note.trim();
  const remaining = STAFF_NOTE_MAX_CHARS - trimmed.length;

  const validation = useMemo(() => {
    if (!trimmed) return { ok: true as const }; // optional
    return validateStaffNote(trimmed);
  }, [trimmed]);

  const canSubmitWithNote = trimmed ? validation.ok : true;

  if (!isOpen) return null;

  const closeSession = async (includeNote: boolean) => {
    setIsClosing(true);
    setNoteError(null);
    try {
      // 1) Close the session (canonical, must succeed even if note fails)
      const closeRes = await fetch(`/api/sessions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "CLOSE_SESSION",
          userRole,
          operatorId,
          // keep legacy notes field for traceability (no PII)
          notes: `Action CLOSE_SESSION executed by ${userRole}`,
        }),
      });

      if (!closeRes.ok) {
        const err = await closeRes.json().catch(() => ({ error: "Failed to close session" }));
        throw new Error(err.details || err.error || "Failed to close session");
      }

      // 2) If user provided a note, attempt to save it (best-effort)
      if (includeNote && trimmed) {
        const noteRes = await fetch(`/api/session/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            note: trimmed,
            share_scope: "lounge",
            created_by: operatorId,
          }),
        });

        if (!noteRes.ok) {
          const err = await noteRes.json().catch(() => ({ error: "Failed to save note" }));
          // Save draft locally for recovery
          try {
            localStorage.setItem(
              `hp:session-note-draft:${sessionId}`,
              JSON.stringify({ note: trimmed, savedAt: new Date().toISOString() })
            );
          } catch {
            // ignore
          }
          notify(
            `✅ Session closed.\n⚠️ Note not saved (${err.error || err.code || "unknown"}). Saved locally / sync pending.`,
            "warning"
          );
        } else {
          notify("✅ Session closed. Staff note saved.", "success");
        }
      } else {
        notify("✅ Session closed.", "success");
      }

      if (refreshSessions) await refreshSessions();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to close session";
      notify(`❌ Error: ${msg}`, "error");
    } finally {
      setIsClosing(false);
    }
  };

  const onPrimary = async () => {
    if (trimmed && !validation.ok) {
      setNoteError(
        validation.reason === "too_long"
          ? `Keep it under ${STAFF_NOTE_MAX_CHARS} characters.`
          : validation.reason === "pii_detected"
          ? "Remove phone/email from the note."
          : "Invalid note."
      );
      return;
    }
    await closeSession(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-6 bg-zinc-900 border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Close session</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            disabled={isClosing}
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Add a quick staff note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setNoteError(null);
              }}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={3}
              placeholder="Short summary. No phone/email."
              maxLength={STAFF_NOTE_MAX_CHARS + 50 /* allow paste; we validate on submit */}
              disabled={isClosing}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Don’t include phone numbers or emails.</span>
              <span className={remaining < 0 ? "text-red-400" : "text-zinc-400"}>
                {Math.max(0, remaining)} / {STAFF_NOTE_MAX_CHARS}
              </span>
            </div>
          </div>

          {noteError && (
            <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
              <p className="text-sm text-red-200">{noteError}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => closeSession(false)}
              disabled={isClosing}
              className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Close without note
            </button>
            <button
              onClick={onPrimary}
              disabled={isClosing || !canSubmitWithNote}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors disabled:opacity-50"
              title={!canSubmitWithNote ? "Fix note before saving" : "Close session"}
            >
              {isClosing ? "Closing..." : "Close session"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

